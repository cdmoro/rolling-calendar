import type { CalendarEvent } from '../types/calendar';
import { renderCalendar } from './calendar';
import { store } from '../store';
import { t, translateElement } from '../i18n';
import { renderLegend } from './legend';
import { formatLongDate, getEventLegendLabel } from './utils';
import { autosaveCurrentCalendar } from '../modules/calendars';
import { getFilteredEvents } from '../modules/calendar';
import { openEditEventDialog } from '../modules/events';

const COLUMNS_BY_LAYOUT: Record<string, number> = {
  portrait: 2,
  landscape: 3
};

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

function splitIntoColumns<T>(items: T[], columns: number): T[][] {
  const result: T[][] = [];
  const itemsPerColumn = Math.ceil(items.length / columns);

  for (let i = 0; i < columns; i++) {
    const start = i * itemsPerColumn;
    const end = start + itemsPerColumn;
    result.push(items.slice(start, end));
  }

  return result;
}

export function toHumanReadableDate(date: Date, time: boolean = false): string {
  const formatter = new Intl.DateTimeFormat(store.language, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(time
      ? {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }
      : {})
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

  const monthFormatter = new Intl.DateTimeFormat(store.language, {
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

  const index = store.calendar!.state.events.findIndex(
    (event) => event.id === id
  );

  if (index !== -1) {
    store.calendar!.state.events.splice(index, 1);
    autosaveCurrentCalendar();
    renderEventList();
    renderCalendar();
    renderLegend();
  }
}

const createEventItem = (event: CalendarEvent, showYear: boolean = false) => {
  const div = document.createElement('div');
  div.dataset.dateStart = event.start;
  div.classList.add('event-item', event.type || 'no-activity');

  const dateText = formatEventDate(event, showYear);

  div.innerHTML = `
      <span class="event-icon"></span>
      <span class="event-date" title="${getEventLegendLabel(event.type)}">${dateText}</span>
      <span class="event-title" title="${event.title}">${event.title}</span>
      <span class="event-actions">
        <button class="event-edit btn-icon btn-sm" data-id="${event.id}" data-title="editEvent" value="edit">
          <app-icon name="edit"></app-icon>
        </button>
        <button class="event-delete btn-icon btn-sm btn-danger" data-id="${event.id}" data-title="deleteEvent" value="delete">
          <app-icon name="trash"></app-icon>
        </button>
      </span>
    `;

  return div;
};

function renderEventListSection(
  wrapper: HTMLElement,
  id: string,
  columns: number = 2,
  events: CalendarEvent[],
  showYear: boolean = false,
  title?: string
) {
  if (events.length === 0) return;

  const eventListSection = document.createElement('div');
  eventListSection.id = id;
  eventListSection.className = 'event-list-section';

  const eventListEl = document.createElement('div');
  eventListEl.className = 'event-list';
  eventListEl.innerHTML = '';

  if (title) {
    const titleEl = document.createElement('h3');
    titleEl.textContent = title;
    eventListSection.appendChild(titleEl);
  }

  const eventColumns = splitIntoColumns(events, columns);
  const colElements: HTMLDivElement[] = [];

  eventColumns.forEach((columnEvents) => {
    const col = document.createElement('div');
    col.className = 'event-col';

    columnEvents.forEach((event) => {
      col.appendChild(createEventItem(event, showYear));
    });

    colElements.push(col);
    eventListEl.appendChild(col);
  });

  const maxLength = Math.max(...eventColumns.map((c) => c.length));

  colElements.forEach((col, i) => {
    const diff = maxLength - eventColumns[i].length;
    for (let j = 0; j < diff; j++) {
      const empty = document.createElement('div');
      empty.classList.add('event-item', 'empty');
      col.appendChild(empty);
    }
  });

  eventListSection.appendChild(eventListEl);
  wrapper.appendChild(eventListSection);
}

export function renderEventList() {
  const eventListWrapper = document.querySelector<HTMLDivElement>(
    '.event-list-wrapper'
  )!;
  eventListWrapper.innerHTML = '';

  const columns = COLUMNS_BY_LAYOUT[
    document.documentElement.dataset.layout || 'portrait'
  ] || 3;
  const { inRangeEvents, outOfRangeEvents } = getFilteredEvents(
    store.calendar!.state.events
  );

  renderEventListSection(eventListWrapper, 'in-range-events', columns, inRangeEvents);

  if (outOfRangeEvents.length === 0) return;

  renderEventListSection(
    eventListWrapper,
    'out-of-range-events',
    columns,
    outOfRangeEvents,
    true,
    t('outOfRangeTitle')
  );

  translateElement(eventListWrapper);

  eventListWrapper.onclick = (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>(
      'button'
    );

    if (!btn?.dataset.id) return;

    switch (btn.value) {
      case 'delete': 
        openDeleteEventDialog(btn.dataset.id);
        break;
      case 'edit': {
        openEditEventDialog(btn.dataset.id);
        break;
      }
    }
  };
}

export function openDeleteEventDialog(eventId: string) {
  const event = store.calendar!.state.events.find((e) => e.id === eventId);
  if (!event) return;

  const dialog = document.getElementById('delete-dialog') as HTMLDialogElement;
  pendingDeleteEventId = eventId;

  console.log('event', event);

  const dates =
    event.start === event.end || !event.end
      ? `<p><strong data-label="date"></strong>: ${formatLongDate(event.start)}</p>`
      : `<p><strong data-label="startDate"></strong>: ${formatLongDate(event.start)}</p>
       <p><strong data-label="endDate"></strong>: ${formatLongDate(event.end)}</p>`;

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
