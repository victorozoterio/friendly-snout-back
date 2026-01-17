import { calendar_v3, google } from 'googleapis';
import { GOOGLE_CALENDAR } from '../constants/google-calendar.constants';

export const getCalendarClient = (): calendar_v3.Calendar => {
  const privateKey = Buffer.from(GOOGLE_CALENDAR.SERVICE_ACCOUNT_PRIVATE_KEY, 'base64').toString('utf8');

  const auth = new google.auth.JWT({
    email: GOOGLE_CALENDAR.SERVICE_ACCOUNT_EMAIL,
    key: privateKey.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });

  return google.calendar({ version: 'v3', auth });
};

export const getCalendarId = (): string => {
  return GOOGLE_CALENDAR.CALENDAR_ID;
};
