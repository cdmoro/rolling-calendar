import { initState, state } from './state/app';
import { applyTranslations } from './i18n';
import type { Language, Theme } from './types/app';
import type { CalendarEvent } from './types/calendar';
import { initExport } from './export';
import { renderUI } from './render';
import {
  autosaveCurrentCalendar,
  openNewCalendarDialog
} from './modules/calendars';
import './components/app-icon';

const startMonthInput =
  document.querySelector<HTMLInputElement>('#start-month')!;
const calendarTitleInput = document.querySelector<HTMLInputElement>(
  '#calendar-title-input'
)!;
const calendarSubtitleInput = document.querySelector<HTMLInputElement>(
  '#calendar-subtitle-input'
)!;

const startDateInput = document.querySelector<HTMLInputElement>('#add-edit-event-dialog #event-start-date-input')!;
const endDateInput = document.querySelector<HTMLInputElement>('#add-edit-event-dialog #event-end-date-input')!;

export function setTheme(theme: Theme, color: string = 'blue') {
  const html = document.documentElement;
  let resolvedTheme = theme;

  if (theme === 'auto') {
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;
    resolvedTheme = prefersDark ? 'dark' : 'light';
  }

  html.setAttribute('data-theme', `${resolvedTheme}-${color}`);

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

function resetForm() {
  const form = document.querySelector<HTMLFormElement>('#event-form')!;
  form.reset();
}

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
  resetForm();
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

document
  .querySelector<HTMLSelectElement>('#color-select')!
  .addEventListener('change', (e) => {
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

  html.setAttribute('data-theme', `${resolvedTheme}-${color}`);

  startMonthInput.value = `${state.calendar!.startYear}-${String(state.calendar!.startMonth + 1).padStart(2, '0')}`;
  calendarTitleInput.value = localStorage.getItem('calendarTitle') || '';
  calendarSubtitleInput.value = localStorage.getItem('calendarSubtitle') || '';

  resolveCalendarHeader();

  document.querySelector<HTMLSelectElement>('#theme-select')!.value =
    state.theme;
  document.querySelector<HTMLSelectElement>('#color-select')!.value = color;
  document.querySelector<HTMLSelectElement>('#language-select')!.value =
    state.language;

  if (import.meta.env.DEV) {
    window.__INTERNAL__ = {
      state
    };
  }
}

main();
