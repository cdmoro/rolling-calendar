import { calendarState, getFilteredEvents } from '../state/calendar';
import type { CalendarEvent } from '../types/calendar';
import { renderCalendar } from './calendar';
import { state } from '../state/app';
import { t } from '../i18n';
import { renderLegend } from './legend';

function splitInTwoColumns<T>(items: T[]): [T[], T[]] {
  const mid = Math.ceil(items.length / 2);
  return [items.slice(0, mid), items.slice(mid)];
}

function formatEventDate(
  event: CalendarEvent,
  locale: string = state.language,
  showYear: boolean = false
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

  const startYear = showYear ? `, ${start.getFullYear()}` : '';
  const endYear = showYear ? `, ${end.getFullYear()}` : '';

  if (sameDay) {
    return `${startMonth} ${start.getDate()}${startYear}`;
  }

  if (sameMonth) {
    return `${startMonth} ${start.getDate()}&ndash;${end.getDate()}${startYear}`;
  }

  return `${startMonth} ${start.getDate()}${startYear} &ndash; ${endMonth} ${end.getDate()}${endYear}`;
}

function handleDelete(id: string) {
  if (!id) return;

  const index = calendarState.events.findIndex((event) => event.id === id);

  if (index !== -1) {
    calendarState.events.splice(index, 1);
    localStorage.setItem('events', JSON.stringify(calendarState.events));
    renderEventList();
    renderCalendar();
    renderLegend();
  }
}

function renderEventListSection(
  events: CalendarEvent[],
  id: string,
  showYear: boolean = false,
  title?: string
) {
  const container = document.querySelector<HTMLDivElement>(id);
  if (!container) return;

  container.innerHTML = '';

  if (events.length === 0) {
    return;
  }

  if (title) {
    const titleEl = document.createElement('h3');
    titleEl.textContent = title;
    container.appendChild(titleEl);
  }

  const [leftEvents, rightEvents] = splitInTwoColumns(events);
  const colLeft = document.createElement('div');
  const colRight = document.createElement('div');
  colLeft.className = 'event-col';
  colRight.className = 'event-col';

  const createEventItem = (event: CalendarEvent) => {
    const div = document.createElement('div');
    div.classList.add('event-item');

    const dateText = formatEventDate(event, state.language, showYear);
    const halfDayText = event.halfDay ? ' (½)' : '';

    div.innerHTML = `
      <span class="event-date">${dateText}${halfDayText}</span>
      <span class="event-title" title="${event.title}">${event.title}</span>
      <span class="event-actions">
        <button class="event-delete" data-id="${event.id}">&times;</button>
      </span>
    `;
    return div;
  };

  leftEvents.forEach((e) => colLeft.appendChild(createEventItem(e)));
  rightEvents.forEach((e) => colRight.appendChild(createEventItem(e)));

  if (leftEvents.length > rightEvents.length) {
    const empty = document.createElement('div');
    empty.classList.add('event-item', 'empty');
    colRight.appendChild(empty);
  }

  container.appendChild(colLeft);
  container.appendChild(colRight);

  container.onclick = (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>(
      '.event-delete'
    );
    if (!btn) return;
    handleDelete(btn.dataset.id!);
  };
}

export function renderEventList() {
  const list = document.querySelector<HTMLDivElement>('#event-list')!;
  list.innerHTML = '';

  const { inRangeEvents, outOfRangeEvents } = getFilteredEvents(
    calendarState.events
  );

  renderEventListSection(inRangeEvents, '#event-list', false);
  renderEventListSection(
    outOfRangeEvents,
    '#out-of-range-event-list',
    true,
    t('outOfRangeTitle')
  );
}
