export type Language = 'en' | 'es';
export type Theme = 'light' | 'dark';

export type State = {
  language: Language;
  theme: Theme;
  color?: string;
};
