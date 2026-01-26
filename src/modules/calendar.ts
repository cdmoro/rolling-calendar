import type { CalendarEvent, MonthGrid } from '../types/calendar';
import type { Language } from '../types/app';
import { store } from '../store';

export function getFixedMonthGrid(year: number, month: number): MonthGrid {
  const firstDay = new Date(year, month, 1);
  const offset = firstDay.getDay(); // Sunday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];

  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length < 42) cells.push(null);

  return Array.from({ length: 6 }, (_, i) => cells.slice(i * 7, i * 7 + 7));
}

export function getLocalizedWeekdays(lang: Language): string[] {
  const formatter = new Intl.DateTimeFormat(lang, {
    weekday: 'short'
  });

  // Sunday = 2023-01-01
  const baseDate = new Date(2023, 0, 1);

  return Array.from({ length: 7 }, (_, i) =>
    formatter.format(
      new Date(
        baseDate.getFullYear(),
        baseDate.getMonth(),
        baseDate.getDate() + i
      )
    )
  );
}

export function getFilteredEvents(events: CalendarEvent[]) {
  const startDate = new Date(
    store.calendar!.state.startYear,
    store.calendar!.state.startMonth
  );

  const endDate = new Date(
    store.calendar!.state.startYear,
    store.calendar!.state.startMonth + 12
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
