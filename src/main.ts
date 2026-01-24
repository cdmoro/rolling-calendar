import { initState, state } from './state/app';
import { applyTranslations, t } from './i18n';
import type { Language, Theme } from './types/app';
import type { CalendarEvent } from './types/calendar';
import { initExport } from './modules/export';
import { renderUI } from './render';
import {
  autosaveCurrentCalendar,
  createDraftCalendar,
  openNewCalendarDialog
} from './modules/calendars';
import './components/app-icon';
import { confirmDialog } from './modules/dialogs';
import { Toast } from './modules/notifications';
import { toHumanReadableDate } from './render/events';
import { getTypedForm, type CalendarFormElements } from './types/forms';

const calendarNameInput = document.querySelector<HTMLInputElement>(
  '#calendar-name-input'
)!;
const startMonthInput =
  document.querySelector<HTMLInputElement>('#start-month')!;
const calendarTitleInput = document.querySelector<HTMLInputElement>(
  '#calendar-title-input'
)!;
const calendarSubtitleInput = document.querySelector<HTMLInputElement>(
  '#calendar-subtitle-input'
)!;
const calendarNameTitle =
  document.querySelector<HTMLHeadingElement>('#calendar-name')!;
const calendarDialogBtn =
  document.querySelector<HTMLButtonElement>('#calendar-settings')!;
const calendarDialog = document.querySelector<HTMLDialogElement>(
  '#calendar-dialog'
)!;

const calendarDialogForm = getTypedForm<CalendarFormElements>(
  '#calendar-dialog form'
);

function updateColor() {
  const color = state.calendar!.color;
  document.documentElement.style.setProperty(
    '--accent-color-rgb',
    hexToRgb(color)
  );
  document.documentElement.style.setProperty(
    '--accent-text-color',
    getForegroundColor(color)
  );
  colorSelectHeader.value = color;
}

calendarDialog.addEventListener('close', (e) => {
  if ((e.target as HTMLDialogElement)?.returnValue === 'save') {
    const calendar = state.calendars.find(
      (cal) => cal.id === state.currentCalendarId
    );
    
    if (calendar) {
      calendar.name = calendarDialogForm['calendar-name-input'].value.trim();
      localStorage.setItem('calendars', JSON.stringify(state.calendars));
      calendarNameTitle.textContent = calendar.name;
    }

    state.calendar = {
      ...state.calendar!,
      color: calendarDialogForm['color-select'].value,
      startYear: Number(
        calendarDialogForm['start-month'].value.split('-')[0]
      ),
      startMonth: Number(
        calendarDialogForm['start-month'].value.split('-')[1]
      ) - 1,
      calendarTitle: calendarDialogForm['calendar-title-input'].value.trim(),
      calendarSubtitle: calendarDialogForm[
        'calendar-subtitle-input'
      ].value.trim(),
    }

    updateColor();
    autosaveCurrentCalendar();
    resolveCalendarHeader();
    renderUI();
  }
});
// const calendarSelect =
//   document.querySelector<HTMLSelectElement>('#calendar-select')!;
const calendarCount =
  document.querySelector<HTMLSpanElement>('#calendar-count')!;

const startDateInput = document.querySelector<HTMLInputElement>(
  '#add-edit-event-dialog #event-start-date-input'
)!;
const endDateInput = document.querySelector<HTMLInputElement>(
  '#add-edit-event-dialog #event-end-date-input'
)!;

const colorSelect = document.querySelector<HTMLInputElement>('#color-select')!;
const colorSelectHeader = document.querySelector<HTMLInputElement>(
  '#calendar-color-input'
)!;

const calendarsDialog =
  document.querySelector<HTMLDialogElement>('#calendars-dialog')!;

function hexToRgb(hex: string) {
  const bigint = parseInt(hex.replace('#', ''), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r}, ${g}, ${b}`;
}

function getForegroundColor(hex: string) {
  const [r, g, b] = hexToRgb(hex).split(', ').map(Number);
  return r * 0.299 + g * 0.587 + b * 0.114 > 135 ? '#000000' : '#FFFFFF';
}

export function setTheme(theme: Theme, color: string = '#4a90e2') {
  const html = document.documentElement;
  let resolvedTheme = theme;

  if (theme === 'auto') {
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;
    resolvedTheme = prefersDark ? 'dark' : 'light';
  }

  // html.setAttribute('data-theme', `${resolvedTheme}-${color}`);
  html.setAttribute('data-theme', `${resolvedTheme}`);
  html.style.setProperty('--accent-color-rgb', hexToRgb(color));
  html.style.setProperty('--accent-text-color', getForegroundColor(color));

  localStorage.setItem('theme', `${theme}`);
  localStorage.setItem('color', `${color}`);

  if (state.calendar) {
    state.calendar.color = color;
    autosaveCurrentCalendar();
  }
}

window
  .matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', (e) => {
    if (state.theme === 'auto') {
      const newColorScheme = e.matches ? 'dark' : 'light';
      setTheme(newColorScheme, state.calendar!.color);
    }
  });

// function resetForm() {
//   const form = document.querySelector<HTMLFormElement>('#event-form')!;
//   form.reset();
// }

async function deleteCalendar(id: string) {
  const index = state.calendars.findIndex((cal) => cal.id === id);
  if (index === -1) return;

  const calendarName = state.calendars[index].name;

  const confirmDelete = await confirmDialog({
    title: t('deleteCalendar'),
    message: t('deleteCalendarConfirmation'),
    detail: `${t('name')}: <strong>${calendarName}</strong>`,
    confirmButtonText: t('delete'),
    cancelButtonText: t('cancel'),
    confirmButtonClass: 'btn-danger'
  });

  if (confirmDelete) {
    state.calendars.splice(index, 1);
    localStorage.setItem('calendars', JSON.stringify(state.calendars));

    if (state.calendars.length > 0) {
      // calendarSelect.querySelector(`option[value=${id}]`)?.remove();

      const newCurrentCalendar = state.calendars[0];
      state.currentCalendarId = newCurrentCalendar.id!;
      state.calendar = structuredClone(newCurrentCalendar.state);
      localStorage.setItem('currentCalendarId', newCurrentCalendar.id!);
      // calendarSelect.value = newCurrentCalendar.id!;
      calendarNameTitle.textContent = newCurrentCalendar.name;
    } else {
      const draftCalendar = createDraftCalendar();
      state.calendars.push(draftCalendar);

      // calendarSelect.innerHTML = `
      //   <option value="${draftCalendar.id!}" data-label="untitledCalendar">
      //     ${t('untitledCalendar')}
      //   </option>
      // `;
      // calendarSelect.value = draftCalendar.id!;
      state.currentCalendarId = draftCalendar.id!;
      state.calendar = structuredClone(draftCalendar.state);
      localStorage.setItem('currentCalendarId', draftCalendar.id!);
      calendarNameTitle.textContent = t('untitledCalendar');
    }

    calendarCount.textContent = `(${state.calendars.length})`;
    Toast.success(
      t('calendarDeleted', {
        calendar_name: calendarName
      }),
      {
        id: 'calendar-deleted'
      }
    );

    // calendarTitleInput.value = state.calendar.calendarTitle || '';
    // calendarSubtitleInput.value = state.calendar.calendarSubtitle || '';
    // startMonthInput.value = `${state.calendar.startYear}-${String(
    //   state.calendar.startMonth + 1
    // ).padStart(2, '0')}`;
    colorSelectHeader.value = state.calendar.color;
    // colorSelect.value = state.calendar.color;
    document.documentElement.style.setProperty(
      '--accent-color-rgb',
      hexToRgb(state.calendar.color)
    );
    document.documentElement.style.setProperty(
      '--accent-text-color',
      getForegroundColor(state.calendar.color)
    );

    resolveCalendarHeader();

    renderUI();
  }
}

calendarDialogBtn.addEventListener('click', () => {
  calendarDialogForm['calendar-name-input'].value =
    state.calendars.find((cal) => cal.id === state.currentCalendarId)?.name;
  calendarDialogForm['start-month'].value = `${state.calendar!.startYear}-${String(state.calendar!.startMonth + 1).padStart(2, '0')}`;
  calendarDialogForm['calendar-title-input'].value = state.calendar!.calendarTitle;
  calendarDialogForm['calendar-subtitle-input'].value = state.calendar!.calendarSubtitle;
  calendarDialogForm['color-select'].value = state.calendar!.color;
  
  calendarDialog.showModal();
});

document
  .querySelector<HTMLButtonElement>('#delete-calendar-btn')!
  .addEventListener('click', async () => {
    const calendarId = state.currentCalendarId;
    if (!calendarId) return;
    await deleteCalendar(calendarId);
  });

function openCalendar(id: string) {
  const selectedCalendar = state.calendars.find((cal) => cal.id === id);

  if (selectedCalendar) {
    state.currentCalendarId = selectedCalendar.id!;
    state.calendar = structuredClone(selectedCalendar.state);
    localStorage.setItem('currentCalendarId', selectedCalendar.id!);
    calendarTitleInput.value = state.calendar.calendarTitle || '';
    calendarSubtitleInput.value = state.calendar.calendarSubtitle || '';
    startMonthInput.value = `${state.calendar.startYear}-${String(
      state.calendar.startMonth + 1
    ).padStart(2, '0')}`;
    colorSelectHeader.value = state.calendar.color;
    colorSelect.value = state.calendar.color;
    document.documentElement.style.setProperty(
      '--accent-color-rgb',
      hexToRgb(state.calendar.color)
    );
    document.documentElement.style.setProperty(
      '--accent-text-color',
      getForegroundColor(state.calendar.color)
    );

    calendarNameTitle.textContent = selectedCalendar.name;

    resolveCalendarHeader();
    autosaveCurrentCalendar();
    renderUI();
    Toast.info(t('calendarOpened', { calendar_name: selectedCalendar.name }), {
      id: 'calendar-opened'
    });
  } else {
    Toast.error(t('calendarNotFound'), { id: 'calendar-not-found' });
  }
}

// calendarSelect.addEventListener('change', (e) => {
//   openCalendar((e.target as HTMLSelectElement).value);
// });

// startMonthInput.addEventListener('change', (e) => {
//   const [y, m] = (e.target as HTMLInputElement).value.split('-').map(Number);

//   localStorage.setItem('startMonth', (e.target as HTMLInputElement).value);

//   const minDate = `${y}-${String(m).padStart(2, '0')}-01`;
//   startDateInput.min = minDate;
//   endDateInput.min = minDate;

//   if (state.calendar) {
//     state.calendar.startYear = y;
//     state.calendar.startMonth = m - 1;
//     autosaveCurrentCalendar();
//   }

//   renderUI();
//   // resetForm();
// });

// calendarTitleInput.addEventListener('input', () => resolveCalendarHeader());
// calendarSubtitleInput.addEventListener('input', () => resolveCalendarHeader());

function resolveCalendarHeader() {
  const headerDiv = document.querySelector<HTMLDivElement>('#calendar-header')!;
  const title = state.calendar?.calendarTitle;
  const subtitle = state.calendar?.calendarSubtitle;

  headerDiv.innerHTML = '';

  if (title) {
    const h1 = document.createElement('h1');
    h1.id = 'calendar-title';
    h1.textContent = title;
    headerDiv.appendChild(h1);
  }

  if (subtitle) {
    const h2 = document.createElement('h2');
    h2.id = 'calendar-subtitle';
    h2.textContent = subtitle;
    headerDiv.appendChild(h2);
  }

  if (state.calendar) {
    state.calendar.calendarTitle = title;
    state.calendar.calendarSubtitle = subtitle;
    autosaveCurrentCalendar();
  }
}

export function sortEventsByStartDate(events: CalendarEvent[]) {
  events.sort((a, b) => {
    const aTime = new Date(a.start).getTime();
    const bTime = new Date(b.start).getTime();
    return aTime - bTime;
  });
}

document
  .querySelector<HTMLSelectElement>('#language-select')!
  .addEventListener('change', (e) => {
    state.language = (e.target as HTMLSelectElement).value as Language;
    localStorage.setItem('language', state.language);
    applyTranslations();
    renderUI();
  });

document
  .querySelector<HTMLSelectElement>('#theme-select')!
  .addEventListener('change', (e) => {
    state.theme = (e.target as HTMLSelectElement).value as Theme;
    setTheme(state.theme, state.calendar!.color);
  });

colorSelectHeader.addEventListener('input', (e) => {
  const theme = document.querySelector<HTMLSelectElement>('#theme-select')!
    .value as Theme;
  state.calendar!.color = (e.target as HTMLSelectElement).value;
  setTheme(theme, state.calendar!.color);
});

startDateInput.addEventListener('change', (e) => {
  endDateInput.min = (e.target as HTMLInputElement).value;
});

document
  .querySelector<HTMLButtonElement>('#new-calendar-btn')!
  .addEventListener('click', () => {
    openNewCalendarDialog();
  });

document
  .querySelector<HTMLButtonElement>('#manage-calendars-btn')!
  .addEventListener('click', () => {
    calendarsDialog.showModal();
  });

function main() {
  initState();
  applyTranslations();
  renderUI();
  initExport();

  const calendarList = calendarsDialog.querySelector('#calendar-list')!;

  state.calendars.forEach((cal) => {
    const calendarListItem = document.createElement('div');
    calendarListItem.className = 'calendar-list-item';
    calendarListItem.innerHTML = `
      <div class="calendar-color-indicator" style="background: ${cal.state.color};"></div>
      <div class="calendar-state">
        <h4 class="calendar-title">${cal.name}</h4>
        <div class="calendar-events-count">${cal.state.events.length} ${t('events')}</div>
        <div class="calendar-updated-at">${toHumanReadableDate(new Date(cal.updatedAt), true)}</div>
      </div>
      <div class="calendar-actions">
        <button class="btn btn-secondary btn-icon btn-open-calendar" data-id="${cal.id}" data-title="open">
          <app-icon name="open-folder"></app-icon>
        </button>
        <button class="btn btn-danger btn-icon btn-delete-calendar" data-id="${cal.id}" data-title="delete">
          <app-icon name="trash"></app-icon>
        </button>
      </div>
    `;
    calendarList.appendChild(calendarListItem);
  });

  calendarList.addEventListener('click', (e) => {
    const openBtn = (e.target as HTMLElement).closest<HTMLButtonElement>(
      '.btn-open-calendar'
    );
    const deleteBtn = (e.target as HTMLElement).closest<HTMLButtonElement>(
      '.btn-delete-calendar'
    );

    if (openBtn?.dataset.id) {
      openCalendar(openBtn.dataset.id);
    }

    if (deleteBtn?.dataset.id) {
      deleteCalendar(deleteBtn.dataset.id);
    }
  });

  const color = state.calendar!.color;
  const html = document.documentElement;
  let resolvedTheme = state.theme;

  if (state.theme === 'auto') {
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;
    resolvedTheme = prefersDark ? 'dark' : 'light';
  }

  html.setAttribute('data-theme', `${resolvedTheme}`);
  html.style.setProperty('--accent-color-rgb', hexToRgb(color));
  html.style.setProperty('--accent-text-color', getForegroundColor(color));

  
  const calendarName = state.calendars.find(
    (cal) => cal.id === state.currentCalendarId
  )?.name!
  console.log('Current calendar name:', calendarName, calendarNameInput);
  calendarNameTitle.textContent = calendarName;
  calendarNameInput.value = calendarName;
  calendarCount.textContent = `(${state.calendars.length})`;

  resolveCalendarHeader();

  document.querySelector<HTMLSelectElement>('#theme-select')!.value =
    state.theme;
  colorSelectHeader.value = color;
  colorSelect.value = color;
  document.querySelector<HTMLSelectElement>('#language-select')!.value =
    state.language;

  if (import.meta.env.DEV) {
    window.__INTERNAL__ = {
      state
    };
  }
}

main();
