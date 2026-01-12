import type { CalendarEvent } from '../types/calendar';
import { state } from './app';

export function getFilteredEvents(events: CalendarEvent[]) {
  const startDate = new Date(
    state.calendar!.startYear,
    state.calendar!.startMonth
  );

  const endDate = new Date(
    state.calendar!.startYear,
    state.calendar!.startMonth + 12
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
