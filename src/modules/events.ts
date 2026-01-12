import type { CalendarEvent } from '../types/calendar';
import { state } from '../state/app';

export function isDayMarked(day: Date): CalendarEvent | null {
  return (
    state.calendar!.events.find(
      (e) => new Date(e.start) <= day && new Date(e.end) >= day
    ) ?? null
  );
}

export function toLocalISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getEvent(day: Date): CalendarEvent | null {
  const dayIso = toLocalISODate(day);

  const event = state.calendar!.events.find((e) => {
    const start = e.start;
    const end = e.end ?? e.start;

    return dayIso >= start && dayIso <= end;
  });

  if (!event) return null;

  return event;
}

export function getRangePosition(dayIso: string, start: string, end: string) {
  if (start === end) return 'single';
  if (dayIso === start) return 'start';
  if (dayIso === end) return 'end';
  return 'middle';
}
