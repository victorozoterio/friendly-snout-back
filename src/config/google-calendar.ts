import { calendar_v3, google } from 'googleapis';
import { GOOGLE_CALENDAR } from '../constants/google-calendar.constants';

/** Retorna se todas as credenciais necessárias para a integração estão disponíveis. */
export const isGoogleCalendarConfigured = (): boolean =>
  Boolean(
    GOOGLE_CALENDAR.CALENDAR_ID && GOOGLE_CALENDAR.SERVICE_ACCOUNT_EMAIL && GOOGLE_CALENDAR.SERVICE_ACCOUNT_PRIVATE_KEY,
  );

export const getCalendarClient = (): calendar_v3.Calendar => {
  const serviceAccountEmail = GOOGLE_CALENDAR.SERVICE_ACCOUNT_EMAIL;
  const serviceAccountPrivateKey = GOOGLE_CALENDAR.SERVICE_ACCOUNT_PRIVATE_KEY;

  if (!serviceAccountEmail || !serviceAccountPrivateKey) {
    throw new Error('Google Calendar is not configured');
  }

  const privateKey = Buffer.from(serviceAccountPrivateKey, 'base64').toString('utf8');

  const auth = new google.auth.JWT({
    email: serviceAccountEmail,
    key: privateKey.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });

  return google.calendar({ version: 'v3', auth });
};

export const getCalendarId = (): string => {
  const calendarId = GOOGLE_CALENDAR.CALENDAR_ID;

  if (!calendarId) {
    throw new Error('Google Calendar is not configured');
  }

  return calendarId;
};
