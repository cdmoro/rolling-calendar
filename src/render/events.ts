import { t } from '../i18n';
import { calendarState } from '../state/calendar';
import type { CalendarEvent } from '../types/calendar';
import { renderCalendar } from './calendar';
import { state } from '../state/app';

function splitInTwoColumns<T>(items: T[]): [T[], T[]] {
  const mid = Math.ceil(items.length / 2);
  return [items.slice(0, mid), items.slice(mid)];
}

function formatEventDate(
  event: CalendarEvent,
  locale: string = state.language
): string {
  const start = new Date(event.start);
  const end = event.end ? new Date(event.end) : start;

  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();

  const sameMonth =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth();

  const monthFormatter = new Intl.DateTimeFormat(locale, {
    month: 'short'
  });

  const startMonth = monthFormatter.format(start);
  const endMonth = monthFormatter.format(end);

  if (sameDay) {
    return `${startMonth} ${start.getDate()}`;
  }

  if (sameMonth) {
    return `${startMonth} ${start.getDate()}–${end.getDate()}`;
  }

  return `${startMonth} ${start.getDate()} – ${endMonth} ${end.getDate()}`;
}

function handleDelete(id: string) {
  if (!id) return;

  const index = calendarState.events.findIndex((event) => event.id === id);

  if (index !== -1) {
    calendarState.events.splice(index, 1);
    renderEventList();
  }
}

export function renderEventList() {
  const list = document.querySelector<HTMLDivElement>('#event-list')!
  list.innerHTML = ''

  const events = calendarState.events;

  if (events.length === 0) {
    return;
  }

  const [leftEvents, rightEvents] = splitInTwoColumns(events)

  const colLeft = document.createElement('div')
  const colRight = document.createElement('div')
  colLeft.className = 'event-col'
  colRight.className = 'event-col'

  const createEventItem = (event: CalendarEvent) => {
    const div = document.createElement('div')
    div.classList.add('event-item')

    const dateText = formatEventDate(event, state.language)
    const halfDayText = event.halfDay
      ? ` (½)`
      : ''

    div.innerHTML = `
      <span class="event-date">${dateText}${halfDayText}</span>
      <span class="event-title" title="${event.title}">${event.title}</span>
      <span class="event-actions">
        <button class="event-delete" data-id="${event.id}">&times;</button>
      </span>
    `
    return div
  }

  leftEvents.forEach(e => colLeft.appendChild(createEventItem(e)))
  rightEvents.forEach(e => colRight.appendChild(createEventItem(e)))

  if (leftEvents.length > rightEvents.length) {
    const empty = document.createElement('div')
    empty.classList.add('event-item', 'empty')
    colRight.appendChild(empty)
  }

  list.appendChild(colLeft)
  list.appendChild(colRight)

  list.onclick = (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>(
      '.event-delete'
    )
    if (!btn) return
    handleDelete(btn.dataset.id!)
  }

  renderCalendar()
}

