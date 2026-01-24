import type { CalendarEvent, EventType } from '../types/calendar';
import { state } from '../state/app';
import { getTypedForm, type AddEditEventFormElements } from '../types/forms';
import { sortEventsByStartDate } from '../main';
import { autosaveCurrentCalendar } from './calendars';
import { renderUI } from '../render';
import { t } from '../i18n';

const addEditEventDialog = document.querySelector<HTMLDialogElement>(
  '#add-edit-event-dialog'
)!;

const addEditEventForm = getTypedForm<AddEditEventFormElements>(
  '#add-edit-event-dialog form#add-edit-event-form'
)!;
const preview =
  addEditEventForm.querySelector<HTMLDivElement>('#legend-preview')!;

function getCalendarStartDate(): Date {
  return new Date(state.calendar!.startYear, state.calendar!.startMonth, 1);
}

document.querySelector<HTMLButtonElement>('#new-event-btn')!.onclick = () => {
  openNewEventDialog(toLocalISODate(getCalendarStartDate()));
};

function updateLegendPreview() {
  const day = addEditEventForm.elements.start.value
    .substring(8, 10)
    .replace(/^0/, '');
  const type = addEditEventForm.elements.type.value as EventType;
  preview.innerHTML = `<span class="day weekday marked ${type}">${day}</span>`;
}

addEditEventForm.elements.start.addEventListener('change', () =>
  updateLegendPreview()
);
addEditEventForm.elements.type.addEventListener('change', () =>
  updateLegendPreview()
);

addEditEventForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const data = new FormData(addEditEventForm);

  if (!data.get('end')) {
    data.set('end', data.get('start') as string);
  }

  const eventData: Omit<CalendarEvent, 'id'> = {
    title: data.get('title') as string,
    start: data.get('start') as string,
    end: data.get('end') as string,
    type: data.get('type') as CalendarEvent['type']
  };

  if (data.get('id')) {
    const eventIndex = state.calendar!.events.findIndex(
      (ev) => ev.id === data.get('id')
    );

    if (eventIndex !== -1) {
      state.calendar!.events[eventIndex] = {
        ...eventData,
        id: data.get('id') as string
      };
    }
  } else {
    state.calendar!.events.push({
      ...eventData,
      id: crypto.randomUUID()
    });
  }

  sortEventsByStartDate(state.calendar!.events);
  autosaveCurrentCalendar();
  renderUI();

  addEditEventDialog.close();
});

addEditEventDialog.onclose = () => {
  addEditEventForm.reset();
};

function setAditEventFormValues({
  id = '',
  title = '',
  start = '',
  end = '',
  type = 'no-activity'
}: Partial<CalendarEvent>) {
  addEditEventForm.elements.id.value = id;
  addEditEventForm.elements.title.value = title;
  addEditEventForm.elements.start.value = start;
  addEditEventForm.elements.end.value = end;
  addEditEventForm.elements.type.value = type;
}

export function openNewEventDialog(dateIso: string) {
  addEditEventDialog.querySelector('h3')!.innerHTML = `
    <app-icon name="new-event"></app-icon>
    <span>${t('newEvent')}</span>
  `;
  setAditEventFormValues({ start: dateIso });
  addEditEventForm.elements.end.setAttribute('min', dateIso);
  updateLegendPreview();
  addEditEventDialog.querySelector('#confirm-add-edit-event')!.textContent =
    t('addEvent');
  addEditEventDialog.showModal();
}

export function openEditEventDialog(event: CalendarEvent) {
  addEditEventDialog.querySelector('h3')!.innerHTML = `
    <app-icon name="edit"></app-icon>
    <span>${t('editEvent')}</span>
  `;
  setAditEventFormValues(event);
  addEditEventForm.elements.end.setAttribute('min', event.start);
  updateLegendPreview();
  addEditEventDialog.querySelector('#confirm-add-edit-event')!.textContent =
    t('save');
  addEditEventDialog.showModal();
}

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
