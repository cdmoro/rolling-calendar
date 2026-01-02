import { getStrings } from '../i18n';
import { calendarState } from '../state/calendar';
import type { CalendarEvent } from '../types/calendar';
import { renderCalendar } from './calendar';
import { state } from '../state/app';

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
  const strings = getStrings();
  const list = document.querySelector<HTMLDivElement>('#event-list')!;
  list.innerHTML = '';

  calendarState.events.forEach((event) => {
    const div = document.createElement('div');
    div.classList.add('event-item');

    const dateText = formatEventDate(event, state.language);
    const halfDayText = event.halfDay
      ? ` (${strings.halfDay.toLocaleLowerCase()})`
      : '';

    div.innerHTML = `
            <span class="event-date">${dateText}</span>
            <span class="event-title">${event.title}${halfDayText}</span>
            <span class="event-actiions">
                <button class="event-delete" data-id="${event.id}">&times;</button>
            </span>
        `;

    list.appendChild(div);
  });

  document.getElementById('event-list')!.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>(
      '.event-delete'
    );

    if (!btn) return;

    handleDelete(btn.dataset.id!);
  });

  renderCalendar();
}
