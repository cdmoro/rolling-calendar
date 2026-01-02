export type Language = 'en' | 'es';
export type Theme = 'light' | 'dark';

export type State = {
  startMonth?: string;
  language: Language;
  theme: Theme;
  color: string;
};
