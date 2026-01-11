import type { CalendarEvent, CalendarState } from '../types/calendar';

export const calendarState: CalendarState = {
  startYear: new Date().getFullYear(),
  startMonth: new Date().getMonth(),
  calendarTitle: '',
  calendarSubtitle: '',
  events: [],
  color: 'blue'
};

export function getFilteredEvents(events: CalendarEvent[]) {
  const startDate = new Date(calendarState.startYear, calendarState.startMonth);

  const endDate = new Date(
    calendarState.startYear,
    calendarState.startMonth + 12
  );

  const inRangeEvents = events.filter((event: CalendarEvent) => {
    const eventStartDate = new Date(event.start);
    const eventEndDate = new Date(event.end);

    return eventStartDate >= startDate && eventEndDate <= endDate;
  });

  const outOfRangeEvents = events.filter((event: CalendarEvent) => {
    const eventStartDate = new Date(event.start);
    const eventEndDate = new Date(event.end);

    return eventStartDate < startDate || eventEndDate > endDate;
  });

  return {
    inRangeEvents,
    outOfRangeEvents
  };
}

export function initCalendarState() {
  const savedStartMonth = localStorage.getItem('startMonth');
  const savedCalendarTitle = localStorage.getItem('calendarTitle');
  const savedCalendarSubtitle = localStorage.getItem('calendarSubtitle');
  const savedEvents = localStorage.getItem('events');
  const savedColor = localStorage.getItem('color');

  if (savedStartMonth) {
    const [y, m] = savedStartMonth.split('-').map(Number);
    calendarState.startMonth = m - 1;
    calendarState.startYear = y;
  }

  if (savedColor) {
    calendarState.color = savedColor;
  }

  calendarState.calendarTitle =
    savedCalendarTitle ?? calendarState.calendarTitle;
  calendarState.calendarSubtitle =
    savedCalendarSubtitle ?? calendarState.calendarSubtitle;

  if (savedEvents) {
    try {
      calendarState.events = JSON.parse(savedEvents);
    } catch {
      calendarState.events = [];
    }
  }
}
