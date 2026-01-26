import { getLanguageOrDefault, t } from '../i18n';
import { createDraftCalendar } from '../modules/calendars';
import { ls } from '../modules/local-storage';
import { type Theme, type Language, type Store } from '../types/app';
import { type CalendarDocument } from '../types/calendar';

export const store: Store = {
  language: getLanguageOrDefault(),
  theme: 'auto',
  calendars: [],
  currentCalendarId: null,
  calendar: null
};

export function initStore() {
  const savedCurrentCalendarId = ls.getItem('currentCalendarId');

  store.language = ls.getItemOr<Language>('language', store.language);
  store.theme = ls.getItemOr<Theme>('theme', store.theme);
  store.calendars = ls.getItemOr<CalendarDocument[]>(
    'calendars',
    store.calendars
  );

  if (store.calendars.length === 0) {
    const draftCalendar = createDraftCalendar();
    store.calendars.push(draftCalendar);

    const untitledCalendarOption = document.createElement('option');
    untitledCalendarOption.value = draftCalendar.id!;
    untitledCalendarOption.textContent = t('untitledCalendar');
    untitledCalendarOption.dataset.label = 'untitledCalendar';

    store.currentCalendarId = draftCalendar.id;
    store.calendar = structuredClone(draftCalendar);

    ls.setItem('calendars', store.calendars);
    ls.setItem('currentCalendarId', draftCalendar.id);
    return;
  }

  if (store.calendars.length === 1 && store.calendars[0].isDraft) {
    const untitledCalendarOption = document.createElement('option');

    untitledCalendarOption.value = store.calendars[0].id!;
    untitledCalendarOption.textContent = t('untitledCalendar');
    untitledCalendarOption.dataset.label = 'untitledCalendar';

    store.calendar = structuredClone(store.calendars[0]);
    store.currentCalendarId = store.calendars[0].id;
    return;
  }

  const currentCalendar = store.calendars.find(
    (doc) => doc.id === savedCurrentCalendarId
  );

  if (currentCalendar) {
    store.currentCalendarId = savedCurrentCalendarId;
    store.calendar = structuredClone(currentCalendar);
    return;
  }
}
