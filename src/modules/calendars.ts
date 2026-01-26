import { t } from '../i18n';
import { store } from '../store';
import type { CalendarDocument } from '../types/calendar';
import { getTypedForm, type CalendarFormElements } from '../types/forms';
import { ls } from './local-storage';

const DEFAULT_COLOR = '#4a90e2';
const calendarDialog =
  document.querySelector<HTMLDialogElement>('#calendar-dialog')!;
const calendarDialogForm = getTypedForm<CalendarFormElements>(
  '#calendar-dialog form'
);

export function updateMetaTitle() {
  const appTitle = t('title');

  if (!store.calendar) {
    document.title = appTitle;
    return;
  }
  document.title = `${store.calendar.name} - ${appTitle}`;
}

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

export function autosaveCurrentCalendar() {
  if (!store.currentCalendarId) return;

  const index = store.calendars.findIndex(
    (d) => d.id === store.currentCalendarId
  );

  if (index === -1 || !store.calendar) return;

  store.calendars[index] = {
    ...store.calendars[index],
    ...store.calendar,
    updatedAt: new Date().toISOString(),
    state: structuredClone(store.calendar.state)
  };

  updateMetaTitle();
  ls.setItem('calendars', store.calendars);
}

export function openNewCalendarDialog() {
  const submitBtn = calendarDialog.querySelector<HTMLButtonElement>(
    'button[type="submit"]'
  )!;
  calendarDialog.querySelector('h3')!.innerHTML = `
    <app-icon name="new-calendar"></app-icon>
    <span>${t('newCalendar')}</span>
  `;

  calendarDialogForm['calendar-name-input'].value = '';
  calendarDialogForm['start-month'].value =
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  calendarDialogForm['calendar-title-input'].value = '';
  calendarDialogForm['calendar-subtitle-input'].value = '';
  calendarDialogForm['color-select'].value = DEFAULT_COLOR;
  submitBtn.textContent = t('save');
  submitBtn.value = 'create';

  calendarDialog.showModal();

  calendarDialogForm['calendar-name-input'].focus();
}
