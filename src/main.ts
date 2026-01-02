import { calendarState } from './state/calendar'
import { initState, state } from './state/app'
import { renderCalendar } from './render/calendar'
import { renderEventList } from './render/events'
import { applyTranslations } from './i18n'
import type { Theme } from './types/app'
import type { CalendarEvent } from './types/calendar'
import { addOnClickToWeekdays } from './calendar/weekdays'

const startMonthInput = document.getElementById('start-month') as HTMLInputElement;

export function setTheme(theme: 'light' | 'dark', color: string = "blue") {
  const html = document.documentElement

  if (color) {
    html.setAttribute('data-theme', `${theme}-${color}`)
  } else {
    html.setAttribute('data-theme', theme)
  }

  localStorage.setItem('theme', html.getAttribute('data-theme')!)
}

startMonthInput.addEventListener('change', e => {
  const [y, m] = (e.target as HTMLInputElement).value.split('-').map(Number)
  calendarState.startYear = y
  calendarState.startMonth = m - 1
  renderCalendar()
})

function getCalendarStartDate(): Date {
  return new Date(
    calendarState.startYear,
    calendarState.startMonth,
    1
  );
}

export function sortEventsByStartDate(events: CalendarEvent[]) {
  events.sort((a, b) => {
    const aTime = new Date(a.start).getTime();
    const bTime = new Date(b.start).getTime();
    return aTime - bTime;
  });
}



document.getElementById('event-form')!
  .addEventListener('submit', e => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const data = new FormData(form)

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
    })

    form.reset();
    sortEventsByStartDate(calendarState.events);
    renderEventList();
  })

document.getElementById('language-select')!
  .addEventListener('change', e => {
    state.language = (e.target as HTMLSelectElement).value as any
    applyTranslations()
    renderCalendar()
    renderEventList()
  })

document.getElementById('theme-select')!
  .addEventListener('change', e => {
    state.theme = (e.target as HTMLSelectElement).value as any
    setTheme(state.theme, state.color)
  })

document.getElementById('color-select')!
  .addEventListener('change', e => {
    const theme = document.querySelector<HTMLSelectElement>('#theme-select')!.value as Theme;
    state.color = (e.target as HTMLSelectElement).value as any
    setTheme(theme, state.color)
  })

  function init() {
  applyTranslations()
  renderCalendar()
  initState()

  const color = state.color || 'blue';
  const html = document.documentElement;
  html.setAttribute('data-theme', `${state.theme}-${color}`);

  startMonthInput.value = `${calendarState.startYear}-${String(calendarState.startMonth + 1).padStart(2, '0')}`;
  document.querySelector<HTMLSelectElement>('#theme-select')!.value = state.theme;
  document.querySelector<HTMLSelectElement>('#color-select')!.value = color;
  document.querySelector<HTMLSelectElement>('#language-select')!.value = state.language;
}

init()