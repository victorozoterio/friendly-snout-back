import { MedicineApplicationFrequency } from 'src/modules/medicine-applications/utils';
import { PushDeviceEntity } from 'src/modules/push-notifications/entities/push-device.entity';
import {
  PushNotificationJobEntity,
  PushNotificationJobStatus,
} from 'src/modules/push-notifications/entities/push-notification-job.entity';
import { PushNotificationsService } from 'src/modules/push-notifications/push-notifications.service';
import { mockMedicineApplicationEntity, mockUserEntity } from '../../mocks';

describe('PushNotificationsService', () => {
  const devicesRepository = {
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };
  const jobsRepository = {
    create: jest.fn(),
    createQueryBuilder: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  let service: PushNotificationsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PushNotificationsService(devicesRepository as never, jobsRepository as never);
  });

  it('registers a new device for the authenticated user', async () => {
    const user = mockUserEntity();
    const device = { expoPushToken: 'ExponentPushToken[example-token]' } as PushDeviceEntity;
    devicesRepository.findOne.mockResolvedValue(null);
    devicesRepository.create.mockReturnValue(device);

    await service.registerDevice(user, { expoPushToken: device.expoPushToken, platform: 'android' });

    expect(devicesRepository.create).toHaveBeenCalledWith({ expoPushToken: device.expoPushToken });
    expect(device).toMatchObject({ isActive: true, platform: 'android', user });
    expect(devicesRepository.save).toHaveBeenCalledWith(device);
  });

  it('creates the initial job for a recurring application with enough lead time', async () => {
    const user = mockUserEntity();
    const application = mockMedicineApplicationEntity({
      frequency: MedicineApplicationFrequency.WEEKLY,
      nextApplicationAt: new Date(Date.now() + 60 * 60 * 1000),
    });
    const job = {} as PushNotificationJobEntity;
    jobsRepository.findOne.mockResolvedValue(null);
    jobsRepository.create.mockReturnValue(job);

    await service.scheduleMedicineApplicationReminder(application, user);

    expect(jobsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        medicineApplication: application,
        occurrenceAt: application.nextApplicationAt,
        status: PushNotificationJobStatus.PENDING,
        user,
      }),
    );
    expect(jobsRepository.save).toHaveBeenCalledWith(job);
  });

  it('does not create a job when the application has less than 15 minutes of lead time', async () => {
    const application = mockMedicineApplicationEntity({
      nextApplicationAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await service.scheduleMedicineApplicationReminder(application, mockUserEntity());

    expect(jobsRepository.findOne).not.toHaveBeenCalled();
    expect(jobsRepository.save).not.toHaveBeenCalled();
  });
});
