import { addHours, endOfDay, format, parseISO } from 'date-fns';
import { calendar_v3 } from 'googleapis';
import { getCalendarClient, getCalendarId } from '../config';
import { MedicineApplicationFrequency } from '../modules/medicine-applications/utils';

export interface CreateEventDto {
  summary: string;
  description?: string;
  start: string;
  end?: string;
  frequency?: MedicineApplicationFrequency;
}

async function createEvent(dto: CreateEventDto): Promise<calendar_v3.Schema$Event> {
  const { summary, description, start, end, frequency } = dto;

  const startDate = parseISO(start);
  const endDate = end ? parseISO(end) : undefined;

  const eventEndDate = addHours(startDate, 1);

  const startDateTime = format(startDate, "yyyy-MM-dd'T'HH:mm:ssXXX");
  const endDateTime = format(eventEndDate, "yyyy-MM-dd'T'HH:mm:ssXXX");

  const event: calendar_v3.Schema$Event = {
    summary,
    description,
    start: {
      dateTime: startDateTime,
      timeZone: 'America/Sao_Paulo',
    },
    end: {
      dateTime: endDateTime,
      timeZone: 'America/Sao_Paulo',
    },
  };

  const medicineFrequencyToGoogleRRule: Record<MedicineApplicationFrequency, string> = {
    [MedicineApplicationFrequency.DAILY]: 'DAILY',
    [MedicineApplicationFrequency.WEEKLY]: 'WEEKLY',
    [MedicineApplicationFrequency.MONTHLY]: 'MONTHLY',
    [MedicineApplicationFrequency.YEARLY]: 'YEARLY',
    [MedicineApplicationFrequency.EVERY_WEEKDAY]: 'WEEKLY;BYDAY=MO,TU,WE,TH,FR',
    [MedicineApplicationFrequency.DOES_NOT_REPEAT]: '',
  };

  if (frequency && frequency !== MedicineApplicationFrequency.DOES_NOT_REPEAT && endDate) {
    const recurrenceEndDate = endOfDay(endDate);
    const recurrenceEndRFC = format(recurrenceEndDate, "yyyyMMdd'T'HHmmss'Z'");

    const googleFreq = medicineFrequencyToGoogleRRule[frequency as MedicineApplicationFrequency];

    event.recurrence = [`RRULE:FREQ=${googleFreq};UNTIL=${recurrenceEndRFC}`];
  }

  try {
    const calendarClient = getCalendarClient();
    const calendarId = getCalendarId();
    const response = await calendarClient.events.insert({ calendarId, requestBody: event });
    return response.data;
  } catch (error) {
    throw new Error(
      `Failed to create event in Google Calendar: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

async function deleteEvent(eventId: string): Promise<void> {
  const calendarClient = getCalendarClient();
  const calendarId = getCalendarId();

  try {
    await calendarClient.events.delete({ calendarId, eventId });
  } catch (_error) {
    return;
  }
}

export const googleCalendar = {
  createEvent,
  deleteEvent,
};
