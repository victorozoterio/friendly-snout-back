import { Injectable } from '@nestjs/common';
import { addHours, endOfDay, format, parseISO } from 'date-fns';
import { calendar_v3, google } from 'googleapis';
import { MedicineApplicationFrequency } from 'src/modules/medicine-applications/utils';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class GoogleCalendarService {
  private calendarClient: calendar_v3.Calendar;
  private calendarId: string;

  constructor() {
    const calendarId = process.env.GOOGLE_CALENDAR_ID;
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKeyBase64 = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

    if (!calendarId || !clientEmail || !privateKeyBase64) {
      throw new Error('Google Calendar environment variables are not defined');
    }

    this.calendarId = calendarId;
    const privateKey = Buffer.from(privateKeyBase64, 'base64').toString('utf8');

    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    this.calendarClient = google.calendar({ version: 'v3', auth });
  }

  async createEvent(dto: CreateEventDto) {
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

    if (frequency && frequency !== MedicineApplicationFrequency.DOES_NOT_REPEAT && endDate) {
      const recurrenceEndDate = endOfDay(endDate);
      const recurrenceEndRFC = format(recurrenceEndDate, "yyyyMMdd'T'HHmmss'Z'");

      event.recurrence = [`RRULE:FREQ=${frequency.toUpperCase()};UNTIL=${recurrenceEndRFC}`];
    }

    const response = await this.calendarClient.events.insert({ calendarId: this.calendarId, requestBody: event });
    return response.data;
  }

  async deleteEvent(eventId: string) {
    await this.calendarClient.events.delete({ calendarId: this.calendarId, eventId });
  }
}
