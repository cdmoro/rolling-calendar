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

const calendarSelect =
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

    calendarSelect.value = draftCalendar.id!;

    const untitledCalendarOption = document.createElement('option');
    untitledCalendarOption.value = draftCalendar.id!;
    untitledCalendarOption.textContent = t('untitledCalendar');
    untitledCalendarOption.dataset.label = 'untitledCalendar';
    calendarSelect.appendChild(untitledCalendarOption);

    state.currentCalendarId = draftCalendar.id;
    state.calendar = structuredClone(draftCalendar.state);

    localStorage.setItem('calendars', JSON.stringify(state.calendars));
    localStorage.setItem('currentCalendarId', draftCalendar.id);
  } else if (state.calendars.length === 1 && state.calendars[0].isDraft) {
    const untitledCalendarOption = document.createElement('option');

    untitledCalendarOption.value = state.calendars[0].id!;
    untitledCalendarOption.textContent = t('untitledCalendar');
    untitledCalendarOption.dataset.label = 'untitledCalendar';

    calendarSelect.appendChild(untitledCalendarOption);

    state.calendar = structuredClone(state.calendars[0].state);
    state.currentCalendarId = state.calendars[0].id;
  } else {
    state.calendars.forEach((calendar) => {
      const option = document.createElement('option');
      option.value = calendar.id!;
      option.textContent = calendar.title!;
      calendarSelect.appendChild(option);
    });

    if (state.calendars.find((doc) => doc.id === savedCurrentCalendarId)) {
      state.currentCalendarId = savedCurrentCalendarId;
      state.calendar = structuredClone(
        state.calendars.find((doc) => doc.id === savedCurrentCalendarId)!.state
      );
      calendarSelect.value = savedCurrentCalendarId!;
    }
  }
}
