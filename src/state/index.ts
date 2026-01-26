import { t } from '../i18n';
import { createDraftCalendar } from '../modules/calendars';
import { ls } from '../modules/local-storage';
import { type Theme, type Language, type Store } from '../types/app';
import { type CalendarDocument } from '../types/calendar';

export const state: Store = {
  language: 'en',
  theme: 'auto',
  calendars: [],
  currentCalendarId: null,
  calendar: null
};

export function initState() {
  const savedCurrentCalendarId = ls.getItem('currentCalendarId');

  state.language = ls.getItemOr<Language>('language', state.language);
  state.theme = ls.getItemOr<Theme>('theme', state.theme);
  state.calendars = ls.getItemOr<CalendarDocument[]>(
    'calendars',
    state.calendars
  );

  if (state.calendars.length === 0) {
    const draftCalendar = createDraftCalendar();
    state.calendars.push(draftCalendar);

    const untitledCalendarOption = document.createElement('option');
    untitledCalendarOption.value = draftCalendar.id!;
    untitledCalendarOption.textContent = t('untitledCalendar');
    untitledCalendarOption.dataset.label = 'untitledCalendar';

    state.currentCalendarId = draftCalendar.id;
    state.calendar = structuredClone(draftCalendar);

    ls.setItem('calendars', state.calendars);
    ls.setItem('currentCalendarId', draftCalendar.id);
    return;
  }

  if (state.calendars.length === 1 && state.calendars[0].isDraft) {
    const untitledCalendarOption = document.createElement('option');

    untitledCalendarOption.value = state.calendars[0].id!;
    untitledCalendarOption.textContent = t('untitledCalendar');
    untitledCalendarOption.dataset.label = 'untitledCalendar';

    state.calendar = structuredClone(state.calendars[0]);
    state.currentCalendarId = state.calendars[0].id;
    return;
  }

  const currentCalendar = state.calendars.find(
    (doc) => doc.id === savedCurrentCalendarId
  );

  if (currentCalendar) {
    state.currentCalendarId = savedCurrentCalendarId;
    state.calendar = structuredClone(currentCalendar);
    return;
  }
}
