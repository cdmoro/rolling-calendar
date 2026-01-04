export type Language = 'en' | 'es';
export type Theme = 'light' | 'dark';

export type State = {
  language: Language;
  theme: Theme;
  color: string;
};

export type WeekStart = 0 | 1;
export type Category = 'holiday' | 'exam' | 'meeting';
export interface ExportOptions {
  format: 'pdf' | 'ics';
}
