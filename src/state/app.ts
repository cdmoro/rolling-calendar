import type { State } from '../types/app';

export const state: State = {
  language: 'en',
  theme: 'light',
  color: 'blue'
};

export function initState() {
  const savedLanguage = localStorage.getItem('language') as State['language'];
  const savedTheme = localStorage.getItem('theme')?.split('-')[0] as
    | State['theme']
    | undefined;
  const savedColor = localStorage.getItem('theme')?.split('-')[1] as
    | State['color']
    | undefined;

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
