import type { CalendarDocument } from "./calendar";

export type Language = 'en' | 'es' | 'it' | 'fr' | 'pt' | 'de';
export type Theme = 'auto' | 'light' | 'dark';

export type State = {
  language: Language;
  theme: Theme;
  color: string;
  documents: CalendarDocument[];
  currentDocumentId: string | null;
};

export type WeekStart = 0 | 1;
export type Category = 'holiday' | 'exam' | 'meeting';
export interface ExportOptions {
  format: 'pdf' | 'ics';
}
