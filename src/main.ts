import { calendarState } from './state/calendar';
import { initState, state } from './state/app';
import { renderCalendar } from './render/calendar';
import { renderEventList } from './render/events';
import { applyTranslations } from './i18n';
import type { Language, Theme } from './types/app';
import type { CalendarEvent } from './types/calendar';

const startMonthInput =
  document.querySelector<HTMLInputElement>('#start-month')!;
const startDateInput = document.querySelector<HTMLInputElement>('#startDate')!;
const endDateInput = document.querySelector<HTMLInputElement>('#endDate')!;

export function setTheme(theme: Theme, color: string = 'blue') {
  const html = document.documentElement;

  if (color) {
    html.setAttribute('data-theme', `${theme}-${color}`);
  } else {
    html.setAttribute('data-theme', theme);
  }

  localStorage.setItem('theme', html.getAttribute('data-theme')!);
}

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

  renderCalendar();
  resetForm();
});

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
      halfDay: data.get('halfDay') === 'on'
    });

    form.reset();
    sortEventsByStartDate(calendarState.events);
    renderEventList();
  });

document
  .querySelector<HTMLSelectElement>('#language-select')!
  .addEventListener('change', (e) => {
    state.language = (e.target as HTMLSelectElement).value as Language;
    localStorage.setItem('language', state.language);
    applyTranslations();
    renderCalendar();
    renderEventList();
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

function main() {
  initState();
  applyTranslations();
  renderCalendar();

  const color = state.color;
  const html = document.documentElement;
  html.setAttribute('data-theme', `${state.theme}-${color}`);

  startMonthInput.value = `${calendarState.startYear}-${String(calendarState.startMonth + 1).padStart(2, '0')}`;

  document.querySelector<HTMLSelectElement>('#theme-select')!.value =
    state.theme;
  document.querySelector<HTMLSelectElement>('#color-select')!.value = color;
  document.querySelector<HTMLSelectElement>('#language-select')!.value =
    state.language;
}

main();
