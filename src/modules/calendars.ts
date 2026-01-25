import { t } from '../i18n';
import { state } from '../state/app';
import type { CalendarDocument } from '../types/calendar';
import { getTypedForm, type CalendarFormElements } from '../types/forms';

const DEFAULT_COLOR = '#4a90e2';

const calendarDialog = document.querySelector<HTMLDialogElement>(
  '#calendar-dialog'
)!;

const calendarDialogForm = getTypedForm<CalendarFormElements>(
  '#calendar-dialog form'
);

export function createDraftCalendar(): CalendarDocument {
  return {
    id: crypto.randomUUID(),
    name: t('untitledCalendar'),
    isDraft: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    state: {
      startYear: new Date().getFullYear(),
      startMonth: new Date().getMonth(),
      events: [],
      color: '#4a90e2'
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

export function autosaveCurrentCalendar() {
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
  const submitBtn = calendarDialog.querySelector<HTMLButtonElement>('button[type="submit"]')!
  calendarDialog.querySelector('h3')!.innerHTML = `
    <app-icon name="new-calendar"></app-icon>
    <span>${t('newCalendar')}</span>
  `;

  calendarDialogForm['calendar-name-input'].value = '';
  calendarDialogForm['start-month'].value = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  calendarDialogForm['calendar-title-input'].value = '';
  calendarDialogForm['calendar-subtitle-input'].value = '';
  calendarDialogForm['color-select'].value = DEFAULT_COLOR;
  submitBtn.textContent = t('save');
  submitBtn.value = 'create';
  
  calendarDialog.showModal();

  calendarDialogForm['calendar-name-input'].focus();
}
