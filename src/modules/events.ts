import type { CalendarEvent, EventType } from '../types/calendar';
import { store } from '../store';
import { getTypedForm, type AddEditEventFormElements } from '../types/forms';
import { sortEventsByStartDate, uptdateEventCount } from '../main';
import { autosaveCurrentCalendar } from './calendars';
import { renderUI } from '../render';
import { t } from '../i18n';
import { Toast } from './notifications';

const addEditEventDialog = document.querySelector<HTMLDialogElement>(
  '#add-edit-event-dialog'
)!;

const addEditEventForm = getTypedForm<AddEditEventFormElements>(
  '#add-edit-event-dialog form#add-edit-event-form'
)!;
const preview =
  addEditEventForm.querySelector<HTMLDivElement>('#legend-preview')!;

function getCalendarStartDate(): Date {
  return new Date(
    store.calendar!.state.startYear,
    store.calendar!.state.startMonth,
    1
  );
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

function updateDurationDisplay() {
  const durationDisplay = document.querySelector<HTMLInputElement>(
    '#event-duration-display'
  )!;
  const startDate = new Date(addEditEventForm.elements.start.value);
  const endDate = new Date(addEditEventForm.elements.end.value);
  const duration = endDate.getTime() - startDate.getTime();
  const durationInDays = duration / (1000 * 60 * 60 * 24) + 1;

  durationDisplay.innerHTML =
    durationInDays > 1 ? `${durationInDays} ${t('days')}` : `1 ${t('day')}`;
}

addEditEventForm.elements.start.addEventListener('change', () => {
  updateLegendPreview();
  updateDurationDisplay();
});
addEditEventForm.elements.end.addEventListener('change', () => {
  updateLegendPreview();
  updateDurationDisplay();
});
addEditEventForm.elements.type.addEventListener('change', () =>
  updateLegendPreview()
);

addEditEventForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const data = new FormData(addEditEventForm);

  // if (!data.get('end')) {
  //   data.set('end', data.get('start') as string);
  // }

  const eventData: CalendarEvent = {
    id: data.get('id') as string,
    title: data.get('title') as string,
    start: data.get('start') as string,
    end: data.get('end') as string,
    type: data.get('type') as CalendarEvent['type']
  };

  const eventIndex = store.calendar!.state.events.findIndex(
    (ev) => ev.id === eventData.id
  );

  if (eventIndex !== -1) {
    store.calendar!.state.events[eventIndex] = structuredClone(eventData);
  } else {
    store.calendar!.state.events.push({
      ...eventData,
      id: crypto.randomUUID()
    });
  }

  sortEventsByStartDate(store.calendar!.state.events);
  autosaveCurrentCalendar();
  uptdateEventCount();
  renderUI();

  addEditEventDialog.close();
});

addEditEventDialog.onclose = () => {
  addEditEventForm.reset();
};

function setEventFormValues({
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
  setEventFormValues({ start: dateIso });
  addEditEventForm.elements.end.setAttribute('min', dateIso);
  updateLegendPreview();
  updateDurationDisplay();
  addEditEventDialog.querySelector('#confirm-add-edit-event')!.textContent =
    t('addEvent');
  addEditEventDialog.showModal();
}

export function openEditEventDialog(id: string) {
  const event = store.calendar!.state.events.find((e) => e.id === id);
  if (!event) {
    Toast.error(t('eventNotFound'), {
      id: 'event-not-found'
    });
    return;
  };

  addEditEventDialog.querySelector('h3')!.innerHTML = `
    <app-icon name="edit"></app-icon>
    <span>${t('editEvent')}</span>
  `;
  setEventFormValues(event);
  addEditEventForm.elements.end.setAttribute('min', event.start);
  updateLegendPreview();
  updateDurationDisplay();
  addEditEventDialog.querySelector('#confirm-add-edit-event')!.textContent =
    t('save');
  addEditEventDialog.showModal();
}

export function toLocalISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getEvent(day: Date): CalendarEvent | null {
  const dayIso = toLocalISODate(day);

  const event = store.calendar!.state.events.find((e) => {
    const start = e.start;
    const end = e.end;

    if (!end) return dayIso === start;

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
