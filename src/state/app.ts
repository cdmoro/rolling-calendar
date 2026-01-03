import type { State } from '../types/app';
import { calendarState } from './calendar';

export const state: State = {
  language: 'en',
  theme: 'light',
  color: 'blue',
  calendarTitle: '',
  calendarSubtitle: ''
};

export function initState() {
  const savedStartMonth = localStorage.getItem('startMonth');
  const savedCalendarTitle = localStorage.getItem('calendarTitle');
  const savedCalendarSubtitle = localStorage.getItem('calendarSubtitle');

  const savedLanguage = localStorage.getItem('language') as State['language'];
  const [savedTheme, savedColor] = localStorage.getItem('theme')?.split('-') as
    | [State['theme'], State['color']]
    | ['light', 'blue'];

  if (savedStartMonth) {
    const [y, m] = savedStartMonth.split('-').map(Number);
    calendarState.startMonth = m - 1;
    calendarState.startYear = y;
  }

  state.calendarTitle = savedCalendarTitle ?? state.calendarTitle;
  state.calendarSubtitle = savedCalendarSubtitle ?? state.calendarSubtitle;
  state.language = savedLanguage ?? state.language;
  state.theme = savedTheme ?? state.theme;
  state.color = savedColor ?? state.color;
}

export type WeekStart = 0 | 1;
export type Category = 'holiday' | 'exam' | 'meeting';
export interface ExportOptions {
  format: 'pdf' | 'ics';
}
