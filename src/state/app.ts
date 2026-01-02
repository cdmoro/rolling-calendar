import type { State } from '../types/app';
import { calendarState } from './calendar';

export const state: State = {
  language: 'en',
  theme: 'light',
  color: 'blue'
};

export function initState() {
  const savedStartMonth = localStorage.getItem('startMonth');
  const savedLanguage = localStorage.getItem('language') as State['language'];
  const savedTheme = localStorage.getItem('theme')?.split('-')[0] as
    | State['theme']
    | undefined;
  const savedColor = localStorage.getItem('theme')?.split('-')[1] as
    | State['color']
    | undefined;

  if (savedStartMonth) {
    const [y, m] = savedStartMonth.split('-').map(Number);
    calendarState.startMonth = m - 1;
    calendarState.startYear = y;
  }

  if (savedLanguage) {
    state.language = savedLanguage;
  }

  if (savedTheme) {
    state.theme = savedTheme;
  }

  if (savedColor) {
    state.color = savedColor;
  }
}

export type WeekStart = 0 | 1;
export type Category = 'holiday' | 'exam' | 'meeting';
export interface ExportOptions {
  format: 'pdf' | 'ics';
}
