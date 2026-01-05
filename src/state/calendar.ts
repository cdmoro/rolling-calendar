import type { CalendarEvent, CalendarState } from '../types/calendar';

export const calendarState: CalendarState = {
  startYear: new Date().getFullYear(),
  startMonth: new Date().getMonth(),
  calendarTitle: '',
  calendarSubtitle: '',
  events: []
};

export function filterEventsInRange(events: CalendarEvent[]) {
  const startDate = new Date(
    calendarState.startYear,
    calendarState.startMonth
  );

  const endDate = new Date(
    calendarState.startYear,
    calendarState.startMonth + 11,
  );

  calendarState.events = events.filter((event: CalendarEvent) => {
    const eventStartDate = new Date(event.start);
    const eventEndDate = new Date(event.end);

    return eventStartDate >= startDate && eventEndDate <= endDate;
  });

  localStorage.setItem('events', JSON.stringify(calendarState.events));
}

export function initCalendarState() {
  const savedStartMonth = localStorage.getItem('startMonth');
  const savedCalendarTitle = localStorage.getItem('calendarTitle');
  const savedCalendarSubtitle = localStorage.getItem('calendarSubtitle');
  const savedEvents = localStorage.getItem('events');

  if (savedStartMonth) {
    const [y, m] = savedStartMonth.split('-').map(Number);
    calendarState.startMonth = m - 1;
    calendarState.startYear = y;
  }

  calendarState.calendarTitle =
    savedCalendarTitle ?? calendarState.calendarTitle;
  calendarState.calendarSubtitle =
    savedCalendarSubtitle ?? calendarState.calendarSubtitle;

  if (savedEvents) {
    try {
      filterEventsInRange(JSON.parse(savedEvents));
    } catch {
      calendarState.events = [];
    }
  }
}
