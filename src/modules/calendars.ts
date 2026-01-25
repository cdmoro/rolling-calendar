import { t, translateElement } from '../i18n';
import { renderUI } from '../render';
import { state } from '../state/app';
import type { CalendarDocument } from '../types/calendar';
import { getTypedForm, type CalendarFormElements } from '../types/forms';

const DEFAULT_COLOR = '#4a90e2';

// const newCalendarDialog = document.querySelector<HTMLDialogElement>(
//   '#new-calendar-dialog'
// )!;
// const newCalendarDialogForm = getTypedForm<NewCalendarFormElements>(
//   '#new-calendar-dialog form#new-calendar-form'
// );
// const calendarSelect =
//   document.querySelector<HTMLSelectElement>('#calendar-select')!;

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

// newCalendarDialog.querySelector<HTMLButtonElement>(
//   '#cancel-new-calendar'
// )!.onclick = () => {
//   newCalendarDialog.close();
// };

// calendarDialogForm.addEventListener('submit', (e) => {
//   e.preventDefault();
//   const name = calendarDialogForm['calendar-name-input'].value.trim();

//   if (name === '') {
//     return;
//   }

  // if (state.calendars.length === 1 && state.calendars[0].isDraft) {
  //   const calendars: CalendarDocument[] = [
  //     {
  //       ...state.calendars[0],
  //       isDraft: false,
  //       name,
  //       updatedAt: new Date().toISOString()
  //     }
  //   ];
  //   localStorage.setItem('calendars', JSON.stringify(calendars));

  //   // calendarSelect.innerHTML = '';

  //   const option = document.createElement('option');
  //   option.value = calendars[0].id!;
  //   option.textContent = name;
  //   option.dataset.label = name;

  //   // calendarSelect.value = calendars[0].id!;
  //   // calendarSelect.appendChild(option);

  //   calendarDialog.close();
  // } else {
  //   const newCalendar: CalendarDocument = {
  //     id: crypto.randomUUID(),
  //     name,
  //     isDraft: false,
  //     createdAt: new Date().toISOString(),
  //     updatedAt: new Date().toISOString(),
  //     state: {
  //       startYear: new Date().getFullYear(),
  //       startMonth: new Date().getMonth(),
  //       events: [],
  //       color: DEFAULT_COLOR
  //     }
  //   };

  //   state.calendars.push(newCalendar);
  //   state.currentCalendarId = newCalendar.id;
  //   state.calendar = structuredClone(newCalendar.state);

  //   localStorage.setItem('calendars', JSON.stringify(state.calendars));
  //   localStorage.setItem('currentCalendarId', state.currentCalendarId);

  //   const option = document.createElement('option');
  //   option.value = newCalendar.id!;
  //   option.textContent = name;
  //   option.dataset.label = name;

  //   // calendarSelect.appendChild(option);
  //   // calendarSelect.value = newCalendar.id!;

  //   autosaveCurrentCalendar();
  //   renderUI();
  //   calendarDialog.close();
  // }
  // if (state.calendars.length === 1 && state.calendars[0].isDraft) {
  //   state.calendars[0].isDraft = false;
  //   state.currentCalendarId = state.calendars[0].id;
  //   state.calendar = structuredClone(state.calendars[0].state);

  //   localStorage.setItem('calendars', JSON.stringify(state.calendars));
  //   localStorage.setItem('currentCalendarId', state.currentCalendarId);

  //   autosaveCurrentCalendar();
  //   renderUI();
  //   newCalendarDialog.close();
  //   return;
  // }

  // const newCalendar = createDraftCalendar();
  // state.calendars.push(newCalendar);
  // state.currentCalendarId = newCalendar.id;
  // state.calendar = structuredClone(newCalendar.state);

  // localStorage.setItem('calendars', JSON.stringify(state.calendars));
  // localStorage.setItem('currentCalendarId', state.currentCalendarId);

  // autosaveCurrentCalendar();
  // renderUI();

  // newCalendarDialog.close();
// });

export function openNewCalendarDialog() {
  // newCalendarDialogForm.reset();
  // translateElement(newCalendarDialog);
  // newCalendarDialog.showModal();
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
