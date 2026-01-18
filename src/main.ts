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

const startMonthInput =
  document.querySelector<HTMLInputElement>('#start-month')!;
const calendarTitleInput = document.querySelector<HTMLInputElement>(
  '#calendar-title-input'
)!;
const calendarSubtitleInput = document.querySelector<HTMLInputElement>(
  '#calendar-subtitle-input'
)!;
const calendarSelect =
  document.querySelector<HTMLSelectElement>('#calendar-select')!;

const startDateInput = document.querySelector<HTMLInputElement>(
  '#add-edit-event-dialog #event-start-date-input'
)!;
const endDateInput = document.querySelector<HTMLInputElement>(
  '#add-edit-event-dialog #event-end-date-input'
)!;

const colorSelect = document.querySelector<HTMLSelectElement>('#color-select')!;

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

document
  .querySelector<HTMLButtonElement>('#delete-calendar-btn')!
  .addEventListener('click', async () => {
    const calendarId = state.currentCalendarId;
    if (!calendarId) return;

    const index = state.calendars.findIndex((cal) => cal.id === calendarId);
    if (index === -1) return;

    const confirmDelete = await confirmDialog({
      title: t('deleteCalendar'),
      message: t('deleteCalendarConfirmation'),
      confirmButtonText: t('delete'),
      cancelButtonText: t('cancel'),
      confirmButtonClass: 'btn-danger'
    });

    if (confirmDelete) {
      const deletedCalendarTitle = state.calendars[index].title;
      state.calendars.splice(index, 1);
      localStorage.setItem('calendars', JSON.stringify(state.calendars));

      if (state.calendars.length > 0) {
        calendarSelect.querySelector(`option[value=${calendarId}]`)?.remove();

        const newCurrentCalendar = state.calendars[0];
        state.currentCalendarId = newCurrentCalendar.id!;
        state.calendar = structuredClone(newCurrentCalendar.state);
        localStorage.setItem('currentCalendarId', newCurrentCalendar.id!);
        calendarSelect.value = newCurrentCalendar.id!;
      } else {
        const draftCalendar = createDraftCalendar();
        state.calendars.push(draftCalendar);

        calendarSelect.innerHTML = `
        <option value="${draftCalendar.id!}" data-label="untitledCalendar">
          ${t('untitledCalendar')}
        </option>
      `;
        calendarSelect.value = draftCalendar.id!;
        state.currentCalendarId = draftCalendar.id!;
        state.calendar = structuredClone(draftCalendar.state);
        localStorage.setItem('currentCalendarId', draftCalendar.id!);
      }

      Toast.success(
        t('calendarDeleted', {
          calendar_name: deletedCalendarTitle
        },),
        {
          id: 'calendar-deleted'
        }
      );

      calendarTitleInput.value = state.calendar.calendarTitle || '';
      calendarSubtitleInput.value = state.calendar.calendarSubtitle || '';
      startMonthInput.value = `${state.calendar.startYear}-${String(
        state.calendar.startMonth + 1
      ).padStart(2, '0')}`;
      colorSelect.value = state.calendar.color;
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
  });

calendarSelect.addEventListener('change', (e) => {
  const selectedCalendarId = (e.target as HTMLSelectElement).value;
  const selectedCalendar = state.calendars.find(
    (cal) => cal.id === selectedCalendarId
  );

  if (selectedCalendar) {
    state.currentCalendarId = selectedCalendar.id!;
    state.calendar = structuredClone(selectedCalendar.state);
    localStorage.setItem('currentCalendarId', selectedCalendar.id!);
    calendarTitleInput.value = state.calendar.calendarTitle || '';
    calendarSubtitleInput.value = state.calendar.calendarSubtitle || '';
    startMonthInput.value = `${state.calendar.startYear}-${String(
      state.calendar.startMonth + 1
    ).padStart(2, '0')}`;
    colorSelect.value = state.calendar.color;
    document.documentElement.style.setProperty(
      '--accent-color-rgb',
      hexToRgb(state.calendar.color)
    );
    document.documentElement.style.setProperty(
      '--accent-text-color',
      getForegroundColor(state.calendar.color)
    );

    resolveCalendarHeader();
    autosaveCurrentCalendar();
    renderUI();
  }
});

startMonthInput.addEventListener('change', (e) => {
  const [y, m] = (e.target as HTMLInputElement).value.split('-').map(Number);

  localStorage.setItem('startMonth', (e.target as HTMLInputElement).value);

  const minDate = `${y}-${String(m).padStart(2, '0')}-01`;
  startDateInput.min = minDate;
  endDateInput.min = minDate;

  if (state.calendar) {
    state.calendar.startYear = y;
    state.calendar.startMonth = m - 1;
    autosaveCurrentCalendar();
  }

  renderUI();
  // resetForm();
});

calendarTitleInput.addEventListener('input', () => resolveCalendarHeader());
calendarSubtitleInput.addEventListener('input', () => resolveCalendarHeader());

function resolveCalendarHeader() {
  const headerDiv = document.querySelector<HTMLDivElement>('#calendar-header')!;
  const title = calendarTitleInput.value.trim();
  const subtitle = calendarSubtitleInput.value.trim();

  headerDiv.innerHTML = '';

  if (title) {
    const h1 = document.createElement('h1');
    h1.id = 'calendar-title';
    h1.textContent = title;
    headerDiv.appendChild(h1);
    localStorage.setItem('calendarTitle', title);
  } else {
    localStorage.removeItem('calendarTitle');
  }

  if (subtitle) {
    const h2 = document.createElement('h2');
    h2.id = 'calendar-subtitle';
    h2.textContent = subtitle;
    headerDiv.appendChild(h2);
    localStorage.setItem('calendarSubtitle', subtitle);
  } else {
    localStorage.removeItem('calendarSubtitle');
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

colorSelect.addEventListener('input', (e) => {
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

function main() {
  initState();
  applyTranslations();
  renderUI();
  initExport();

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

  startMonthInput.value = `${state.calendar!.startYear}-${String(state.calendar!.startMonth + 1).padStart(2, '0')}`;
  calendarTitleInput.value = localStorage.getItem('calendarTitle') || '';
  calendarSubtitleInput.value = localStorage.getItem('calendarSubtitle') || '';

  resolveCalendarHeader();

  document.querySelector<HTMLSelectElement>('#theme-select')!.value =
    state.theme;
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
