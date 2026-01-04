import type { CalendarState } from '../types/calendar';

export const calendarState: CalendarState = {
  startYear: new Date().getFullYear(),
  startMonth: new Date().getMonth(),
  calendarTitle: '',
  calendarSubtitle: '',
  events: []
};

export function initCalendarState() {
  const savedStartMonth = localStorage.getItem('startMonth');
  const savedCalendarTitle = localStorage.getItem('calendarTitle');
  const savedCalendarSubtitle = localStorage.getItem('calendarSubtitle');

  if (savedStartMonth) {
    const [y, m] = savedStartMonth.split('-').map(Number);
    calendarState.startMonth = m - 1;
    calendarState.startYear = y;
  }

  calendarState.calendarTitle =
    savedCalendarTitle ?? calendarState.calendarTitle;
  calendarState.calendarSubtitle =
    savedCalendarSubtitle ?? calendarState.calendarSubtitle;
}
