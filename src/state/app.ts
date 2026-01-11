import { t } from '../i18n';
import { createDraftCalendar } from '../modules/calendars';
import type { State } from '../types/app';

export const state: State = {
  language: 'en',
  theme: 'auto',
  calendars: [],
  currentCalendarId: null,
  calendar: null
};

const calendadrSelect =
  document.querySelector<HTMLSelectElement>('#calendar-select')!;

export function initState() {
  const savedLanguage = localStorage.getItem('language') as State['language'];
  const savedTheme = localStorage.getItem('theme') as State['theme'];
  const savedCalendars = localStorage.getItem('calendars');
  const savedCurrentCalendarId = localStorage.getItem('currentCalendarId');

  state.language = savedLanguage ?? state.language;

  if (savedTheme) {
    state.theme = savedTheme ?? state.theme;
  }

  try {
    if (savedCalendars) {
      state.calendars = JSON.parse(savedCalendars) as State['calendars'];
    }
  } catch {
    state.calendars = [];
  }

  if (state.calendars.length === 0) {
    const draftCalendar = createDraftCalendar();
    state.calendars.push(draftCalendar);

    calendadrSelect.value = draftCalendar.id!;

    const untitledCalendarOption = document.createElement('option');
    untitledCalendarOption.value = draftCalendar.id!;
    untitledCalendarOption.textContent = t('untitledCalendar');
    untitledCalendarOption.dataset.label = 'untitledCalendar';
    calendadrSelect.appendChild(untitledCalendarOption);

    state.currentCalendarId = draftCalendar.id;
    state.calendar = structuredClone(draftCalendar.state);

    localStorage.setItem('calendars', JSON.stringify(state.calendars));
    localStorage.setItem('currentCalendarId', draftCalendar.id!);
  } else if (state.calendars.length === 1 && state.calendars[0].isDraft) {
    const untitledCalendarOption = document.createElement('option');

    untitledCalendarOption.value = state.calendars[0].id!;
    untitledCalendarOption.textContent = t('untitledCalendar');
    untitledCalendarOption.dataset.label = 'untitledCalendar';

    calendadrSelect.appendChild(untitledCalendarOption);
  } else if (state.calendars.some((doc) => doc.id === savedCurrentCalendarId)) {
    state.currentCalendarId = savedCurrentCalendarId;
    state.calendar = structuredClone(
      state.calendars.find((doc) => doc.id === savedCurrentCalendarId)!.state
    );
  }
}
