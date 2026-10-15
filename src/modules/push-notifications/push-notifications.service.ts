import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { addDays, addMonths, addWeeks, addYears, isWeekend } from 'date-fns';
import { MedicineApplicationEntity } from 'src/modules/medicine-applications/entities/medicine-application.entity';
import { MedicineApplicationFrequency } from 'src/modules/medicine-applications/utils';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { IsNull, LessThanOrEqual, Repository } from 'typeorm';
import { RegisterPushDeviceDto } from './dto/register-push-device.dto';
import { PushDeviceEntity } from './entities/push-device.entity';
import { PushNotificationJobEntity, PushNotificationJobStatus } from './entities/push-notification-job.entity';

const REMINDER_LEAD_TIME_MS = 15 * 60 * 1000;
const PROCESSING_TIMEOUT_MS = 5 * 60 * 1000;
const MAX_DELIVERY_ATTEMPTS = 3;

type ExpoTicket = { details?: { error?: string }; id?: string; status: 'error' | 'ok' };
type ExpoReceipt = { details?: { error?: string }; status: 'error' | 'ok' };

@Injectable()
export class PushNotificationsService implements OnModuleDestroy, OnModuleInit {
  private readonly logger = new Logger(PushNotificationsService.name);
  private timer: NodeJS.Timeout | null = null;
  private isProcessing = false;

  constructor(
    @InjectRepository(PushDeviceEntity)
    private readonly devicesRepository: Repository<PushDeviceEntity>,
    @InjectRepository(PushNotificationJobEntity)
    private readonly jobsRepository: Repository<PushNotificationJobEntity>,
  ) {}

  onModuleInit() {
    void this.processPendingJobs();
    this.timer = setInterval(() => void this.processPendingJobs(), 60_000);
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  async registerDevice(user: UserEntity, dto: RegisterPushDeviceDto) {
    const existingDevice = await this.devicesRepository.findOne({ where: { expoPushToken: dto.expoPushToken } });
    const device = existingDevice ?? this.devicesRepository.create({ expoPushToken: dto.expoPushToken });

    device.user = user;
    device.platform = dto.platform;
    device.isActive = true;
    await this.devicesRepository.save(device);
  }

  async unregisterDevice(user: UserEntity, expoPushToken: string) {
    await this.devicesRepository.update({ expoPushToken, user: { uuid: user.uuid } }, { isActive: false });
  }

  /** Agenda o primeiro lembrete persistente sem interferir no evento do Google Calendar. */
  async scheduleMedicineApplicationReminder(application: MedicineApplicationEntity) {
    if (!application.nextApplicationAt || !application.user) return;
    await this.createJob(application, application.user, new Date(application.nextApplicationAt));
  }

  /** Cancela lembretes pendentes ao cancelar ou substituir um agendamento. */
  async cancelMedicineApplicationReminders(applicationUuid: string) {
    await this.jobsRepository
      .createQueryBuilder()
      .update(PushNotificationJobEntity)
      .set({ status: PushNotificationJobStatus.CANCELLED })
      .where('medicine_application_uuid = :applicationUuid', { applicationUuid })
      .andWhere('status IN (:...statuses)', {
        statuses: [PushNotificationJobStatus.PENDING, PushNotificationJobStatus.PROCESSING],
      })
      .execute();
  }

  private async createJob(application: MedicineApplicationEntity, user: UserEntity, occurrenceAt: Date) {
    const sendAt = new Date(occurrenceAt.getTime() - REMINDER_LEAD_TIME_MS);
    if (sendAt <= new Date()) return;

    const exists = await this.jobsRepository.findOne({
      where: { medicineApplication: { uuid: application.uuid }, occurrenceAt, user: { uuid: user.uuid } },
    });
    if (exists) return;

    try {
      await this.jobsRepository.save(
        this.jobsRepository.create({
          medicineApplication: application,
          occurrenceAt,
          sendAt,
          status: PushNotificationJobStatus.PENDING,
          user,
        }),
      );
    } catch (error: unknown) {
      // O índice único mantém a operação idempotente quando mais de uma instância tenta agendar o mesmo lembrete.
      this.logger.debug(`Lembrete já agendado ou indisponível para ${application.uuid}: ${String(error)}`);
    }
  }

  private async processPendingJobs() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      await this.releaseStaleJobs();
      const jobs = await this.jobsRepository.find({
        order: { sendAt: 'ASC' },
        relations: ['medicineApplication', 'medicineApplication.animal', 'medicineApplication.medicine', 'user'],
        take: 50,
        where: { sendAt: LessThanOrEqual(new Date()), status: PushNotificationJobStatus.PENDING },
      });

      for (const job of jobs) await this.deliverJob(job);
      await this.checkReceipts();
    } catch (error: unknown) {
      this.logger.error(`Falha ao processar notificações push: ${String(error)}`);
    } finally {
      this.isProcessing = false;
    }
  }

  private async releaseStaleJobs() {
    const staleAt = new Date(Date.now() - PROCESSING_TIMEOUT_MS);
    await this.jobsRepository
      .createQueryBuilder()
      .update(PushNotificationJobEntity)
      .set({ lockedAt: null, status: PushNotificationJobStatus.PENDING })
      .where('status = :status', { status: PushNotificationJobStatus.PROCESSING })
      .andWhere('locked_at < :staleAt', { staleAt })
      .execute();
  }

  private async deliverJob(job: PushNotificationJobEntity) {
    const claimed = await this.jobsRepository
      .createQueryBuilder()
      .update(PushNotificationJobEntity)
      .set({
        attempts: () => 'attempts + 1',
        lockedAt: new Date(),
        status: PushNotificationJobStatus.PROCESSING,
      })
      .where('uuid = :uuid', { uuid: job.uuid })
      .andWhere('status = :status', { status: PushNotificationJobStatus.PENDING })
      .execute();
    if (!claimed.affected) return;

    try {
      const devices = await this.devicesRepository.find({ where: { isActive: true, user: { uuid: job.user.uuid } } });
      const expoTickets = await this.sendToDevices(job, devices);

      await this.jobsRepository.update(job.uuid, {
        expoTickets,
        lockedAt: null,
        status: PushNotificationJobStatus.SENT,
      });
      await this.scheduleFollowingOccurrence(job);
    } catch (error: unknown) {
      const attempts = job.attempts + 1;
      await this.jobsRepository.update(job.uuid, {
        lockedAt: null,
        status:
          attempts >= MAX_DELIVERY_ATTEMPTS ? PushNotificationJobStatus.FAILED : PushNotificationJobStatus.PENDING,
      });
      this.logger.error(`Falha ao enviar lembrete ${job.uuid}: ${String(error)}`);
    }
  }

  private async sendToDevices(job: PushNotificationJobEntity, devices: PushDeviceEntity[]) {
    if (devices.length === 0) return [];

    const application = job.medicineApplication;
    const body = `O animal ${application.animal.name} precisa receber o medicamento ${application.medicine.name} às ${this.formatTime(job.occurrenceAt)}.`;
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      body: JSON.stringify(
        devices.map((device) => ({
          body,
          channelId: 'medicine-reminders',
          data: {
            animalUuid: application.animal.uuid,
            medicineApplicationUuid: application.uuid,
            type: 'medicine-application-reminder',
          },
          sound: 'default',
          title: 'Hora do medicamento! 🐾',
          to: device.expoPushToken,
        })),
      ),
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      method: 'POST',
    });
    if (!response.ok) throw new Error(`Expo respondeu ${response.status}`);

    const payload = (await response.json()) as { data?: ExpoTicket[] };
    const tickets = payload.data ?? [];
    await Promise.all(
      tickets.map(async (ticket, index) => {
        if (ticket.status === 'error' && ticket.details?.error === 'DeviceNotRegistered') {
          await this.devicesRepository.update({ expoPushToken: devices[index]?.expoPushToken }, { isActive: false });
        }
      }),
    );
    return tickets.flatMap((ticket, index) =>
      ticket.status === 'ok' && ticket.id && devices[index]
        ? [{ expoPushToken: devices[index].expoPushToken, id: ticket.id }]
        : [],
    );
  }

  private async checkReceipts() {
    const jobs = await this.jobsRepository.find({
      take: 100,
      where: { receiptCheckedAt: IsNull(), status: PushNotificationJobStatus.SENT },
    });

    for (const job of jobs) {
      if (!job.expoTickets?.length) {
        await this.jobsRepository.update(job.uuid, { receiptCheckedAt: new Date() });
        continue;
      }

      const response = await fetch('https://exp.host/--/api/v2/push/getReceipts', {
        body: JSON.stringify({ ids: job.expoTickets.map((ticket) => ticket.id) }),
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        method: 'POST',
      });
      if (!response.ok) continue;

      const payload = (await response.json()) as { data?: Record<string, ExpoReceipt> };
      await Promise.all(
        job.expoTickets.map(async (ticket) => {
          if (payload.data?.[ticket.id]?.details?.error === 'DeviceNotRegistered') {
            await this.devicesRepository.update({ expoPushToken: ticket.expoPushToken }, { isActive: false });
          }
        }),
      );
      const hasPendingReceipt = Object.keys(payload.data ?? {}).length < job.expoTickets.length;
      if (!hasPendingReceipt) await this.jobsRepository.update(job.uuid, { receiptCheckedAt: new Date() });
    }
  }

  private async scheduleFollowingOccurrence(job: PushNotificationJobEntity) {
    const application = job.medicineApplication;
    const nextOccurrence = this.getNextOccurrence(job.occurrenceAt, application.frequency);
    if (nextOccurrence) await this.createJob(application, job.user, nextOccurrence);
  }

  private getNextOccurrence(occurrenceAt: Date, frequency: string | null) {
    switch (frequency) {
      case MedicineApplicationFrequency.DAILY:
        return addDays(occurrenceAt, 1);
      case MedicineApplicationFrequency.EVERY_WEEKDAY: {
        let next = addDays(occurrenceAt, 1);
        while (isWeekend(next)) next = addDays(next, 1);
        return next;
      }
      case MedicineApplicationFrequency.WEEKLY:
        return addWeeks(occurrenceAt, 1);
      case MedicineApplicationFrequency.MONTHLY:
        return addMonths(occurrenceAt, 1);
      case MedicineApplicationFrequency.YEARLY:
        return addYears(occurrenceAt, 1);
      default:
        return null;
    }
  }

  private formatTime(date: Date) {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo',
    }).format(date);
  }
}
