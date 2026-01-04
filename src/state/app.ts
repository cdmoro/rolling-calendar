import type { State } from '../types/app';

export const state: State = {
  language: 'en',
  theme: 'light',
  color: 'blue'
};

export function initState() {
  const savedLanguage = localStorage.getItem('language') as State['language'];
  const savedTheme = localStorage.getItem('theme');

  state.language = savedLanguage ?? state.language;

  if (savedTheme) {
    const [theme, color] = savedTheme.split('-') as [
      State['theme'],
      State['color']
    ];
    state.theme = theme ?? state.theme;
    state.color = color ?? state.color;
  }
}
