import { getFilteredEvents } from '../state/calendar';
import type { CalendarEvent } from '../types/calendar';
import { renderCalendar } from './calendar';
import { state } from '../state/app';
import { t, translateElement } from '../i18n';
import { renderLegend } from './legend';
import { formatLongDate, getEventLegendLabel } from './utils';
import { autosaveCurrentCalendar } from '../modules/calendars';

const deleteDialog = document.getElementById(
  'delete-dialog'
) as HTMLDialogElement;
let pendingDeleteEventId: string | null = null;

deleteDialog.addEventListener('close', () => {
  if (deleteDialog.returnValue === 'delete' && pendingDeleteEventId) {
    handleDelete(pendingDeleteEventId);
  }

  document.querySelector<HTMLDivElement>(
    '#delete-dialog .dialog-description'
  )!.innerHTML = '';
  pendingDeleteEventId = null;
});

function splitInTwoColumns<T>(items: T[]): [T[], T[]] {
  const mid = Math.ceil(items.length / 2);
  return [items.slice(0, mid), items.slice(mid)];
}

export function toHumanReadableDate(date: Date): string {
  const formatter = new Intl.DateTimeFormat(state.language, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  return formatter.format(date);
}

export function formatEventDate(
  event: CalendarEvent,
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

  const monthFormatter = new Intl.DateTimeFormat(state.language, {
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

  const index = state.calendar!.events.findIndex((event) => event.id === id);

  if (index !== -1) {
    state.calendar!.events.splice(index, 1);
    autosaveCurrentCalendar();
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
    div.dataset.dateStart = event.start;
    div.classList.add('event-item');
    div.classList.add(event.type || 'no-activity');
    div.title = getEventLegendLabel(event.type);

    const dateText = formatEventDate(event, showYear);

    div.innerHTML = `
      <span class="event-icon"></span>
      <span class="event-date">${dateText}</span>
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
    if (!btn?.dataset.id) return;

    openDeleteEventDialog(btn.dataset.id);
  };
}

export function renderEventList() {
  const list = document.querySelector<HTMLDivElement>('#event-list')!;
  list.innerHTML = '';

  const { inRangeEvents, outOfRangeEvents } = getFilteredEvents(
    state.calendar!.events
  );

  renderEventListSection(inRangeEvents, '#event-list', false);
  renderEventListSection(
    outOfRangeEvents,
    '#out-of-range-event-list',
    true,
    t('outOfRangeTitle')
  );
}

export function openDeleteEventDialog(eventId: string) {
  const event = state.calendar!.events.find((e) => e.id === eventId);
  if (!event) return;

  const dialog = document.getElementById('delete-dialog') as HTMLDialogElement;
  pendingDeleteEventId = eventId;

  const dates =
    event.start === event.end
      ? `<p><strong data-label="date"></strong>: ${formatLongDate(event.start, state.language)}</p>`
      : `<p><strong data-label="startDate"></strong>: ${formatLongDate(event.start, state.language)}</p>
       <p><strong data-label="endDate"></strong>: ${formatLongDate(event.end, state.language)}</p>`;

  document.querySelector<HTMLDivElement>(
    '#delete-dialog .dialog-description'
  )!.innerHTML = `
    <p><strong data-label="titleLabel"></strong>: ${event.title}</p>
    ${dates}
    <p><strong data-label="type"></strong>: ${getEventLegendLabel(event.type)}</p>
  `;

  translateElement(dialog);
  dialog.showModal();
}
