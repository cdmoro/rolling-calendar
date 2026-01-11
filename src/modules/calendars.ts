import { t } from '../i18n';
import { state } from '../state/app';
import type { CalendarDocument } from '../types/calendar';

export function createDraftCalendar(): CalendarDocument {
  return {
    id: crypto.randomUUID(),
    title: undefined,
    isDraft: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    state: {
      startYear: new Date().getFullYear(),
      startMonth: new Date().getMonth(),
      events: [],
      color: 'blue'
    }
  };
}

export function getCurrentCalendar() {
  if (state.currentCalendarId === null)
    return state.calendars.find((doc) => doc.isDraft) ?? null;
  return (
    state.calendars.find((doc) => doc.id === state.currentCalendarId) ?? null
  );
}

export function saveCalendar(calendar: CalendarDocument) {
  const index =
    state.currentCalendarId === null
      ? 0
      : state.calendars.findIndex((doc) => doc.id === calendar.id);

  if (index !== -1) {
    state.calendars[index] = calendar;
  } else {
    state.calendars.push(calendar);
  }

  localStorage.setItem('calendars', JSON.stringify(state.calendars));
}

export function autosaveCurrentDocument() {
  if (!state.currentCalendarId) return;

  const index = state.calendars.findIndex(
    (d) => d.id === state.currentCalendarId
  );

  if (index === -1 || !state.calendar) return;

  state.calendars[index] = {
    ...state.calendars[index],
    updatedAt: new Date().toISOString(),
    state: structuredClone(state.calendar)
  };

  localStorage.setItem('calendars', JSON.stringify(state.calendars));
}

export function openNewCalendarDialog() {
  const dialog = document.querySelector<HTMLDialogElement>(
    '#new-calendar-dialog'
  )!;
  const form = dialog.querySelector<HTMLFormElement>('form')!;

  dialog.querySelector('h3')!.textContent = t('newCalendar');
  dialog.querySelector('button[value="create"]')!.textContent = t('save');
  dialog.querySelector('button.btn-secondary')!.textContent = t('cancel');

  form.reset();
  dialog.showModal();
}
