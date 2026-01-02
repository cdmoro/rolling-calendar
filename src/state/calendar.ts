import type { CalendarEvent } from '../types/calendar';

export const calendarState = {
  startYear: new Date().getFullYear(),
  startMonth: new Date().getMonth(),
  events: [] as CalendarEvent[]
};
