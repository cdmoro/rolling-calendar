import { calendarState, initCalendarState } from './state/calendar';
import { initState, state } from './state/app';
import { applyTranslations } from './i18n';
import type { Language, Theme } from './types/app';
import type { CalendarEvent } from './types/calendar';
import { initExport } from './export';
import { renderUI } from './render';

const startMonthInput =
  document.querySelector<HTMLInputElement>('#start-month')!;
const calendarTitleInput = document.querySelector<HTMLInputElement>(
  '#calendar-title-input'
)!;
const calendarSubtitleInput = document.querySelector<HTMLInputElement>(
  '#calendar-subtitle-input'
)!;

const startDateInput = document.querySelector<HTMLInputElement>('#startDate')!;
const endDateInput = document.querySelector<HTMLInputElement>('#endDate')!;
const halfDayInput = document.querySelector<HTMLInputElement>('#halfDay')!;

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

  localStorage.setItem('theme', `${theme}-${color}`);
}

window
  .matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', (e) => {
    if (state.theme === 'auto') {
      const newColorScheme = e.matches ? 'dark' : 'light';
      setTheme(newColorScheme, state.color);
    }
  });

function resetForm() {
  const form = document.querySelector<HTMLFormElement>('#event-form')!;
  form.reset();
}

startMonthInput.addEventListener('change', (e) => {
  const [y, m] = (e.target as HTMLInputElement).value.split('-').map(Number);

  localStorage.setItem('startMonth', (e.target as HTMLInputElement).value);

  calendarState.startYear = y;
  calendarState.startMonth = m - 1;

  const minDate = `${y}-${String(m).padStart(2, '0')}-01`;
  startDateInput.min = minDate;
  endDateInput.min = minDate;

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
}

function getCalendarStartDate(): Date {
  return new Date(calendarState.startYear, calendarState.startMonth, 1);
}

export function sortEventsByStartDate(events: CalendarEvent[]) {
  events.sort((a, b) => {
    const aTime = new Date(a.start).getTime();
    const bTime = new Date(b.start).getTime();
    return aTime - bTime;
  });
}

document
  .querySelector<HTMLFormElement>('#event-form')!
  .addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);

    const calendarStart = getCalendarStartDate();
    const eventStart = new Date(data.get('start') as string);

    if (!data.get('end')) {
      data.set('end', data.get('start') as string);
    }

    if (eventStart < calendarStart) {
      alert('Event start date must be within the visible calendar range.');
      return false;
    }

    calendarState.events.push({
      id: crypto.randomUUID(),
      title: data.get('title') as string,
      start: data.get('start') as string,
      end: data.get('end') as string,
      halfDay: data.get('halfDay') === 'on',
      type: data.get('dayType') as CalendarEvent['type']
    });

    form.reset();
    sortEventsByStartDate(calendarState.events);
    localStorage.setItem('events', JSON.stringify(calendarState.events));
    renderUI();
  });

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
    setTheme(state.theme, state.color);
  });

document
  .querySelector<HTMLSelectElement>('#color-select')!
  .addEventListener('change', (e) => {
    const theme = document.querySelector<HTMLSelectElement>('#theme-select')!
      .value as Theme;
    state.color = (e.target as HTMLSelectElement).value;
    setTheme(theme, state.color);
  });

startDateInput.addEventListener('change', (e) => {
  endDateInput.min = (e.target as HTMLInputElement).value;
});

endDateInput.addEventListener('change', (e) => {
  if ((e.target as HTMLInputElement).value) {
    halfDayInput.disabled = true;
    halfDayInput.checked = false;
  } else {
    halfDayInput.disabled = false;
  }
});

function main() {
  initState();
  initCalendarState();
  applyTranslations();
  renderUI();
  initExport();

  const color = state.color;
  const html = document.documentElement;
  let resolvedTheme = state.theme;

  if (state.theme === 'auto') {
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;
    resolvedTheme = prefersDark ? 'dark' : 'light';
  }

  html.setAttribute('data-theme', `${resolvedTheme}-${color}`);

  startMonthInput.value = `${calendarState.startYear}-${String(calendarState.startMonth + 1).padStart(2, '0')}`;
  calendarTitleInput.value = localStorage.getItem('calendarTitle') || '';
  calendarSubtitleInput.value = localStorage.getItem('calendarSubtitle') || '';

  resolveCalendarHeader();

  document.querySelector<HTMLSelectElement>('#theme-select')!.value =
    state.theme;
  document.querySelector<HTMLSelectElement>('#color-select')!.value = color;
  document.querySelector<HTMLSelectElement>('#language-select')!.value =
    state.language;
}

main();
