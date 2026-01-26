import type { CalendarDocument } from './calendar';

export type LocalStorageKey =
  | 'language'
  | 'theme'
  | 'calendars'
  | 'currentCalendarId';

export type Language = 'en' | 'es' | 'it' | 'fr' | 'pt' | 'de' | 'el' | 'ar';
export type Theme = 'auto' | 'light' | 'dark';

export type Store = {
  language: Language;
  theme: Theme;
  calendars: CalendarDocument[];
  currentCalendarId: string | null;
  calendar: CalendarDocument | null;
};

export type WeekStart = 0 | 1;
export type Category = 'holiday' | 'exam' | 'meeting';
export interface ExportOptions {
  format: 'pdf' | 'ics';
}

export type NotifyType = 'success' | 'error' | 'info' | 'warning';

export type NotifyOptions = {
  type?: NotifyType;
  duration?: number;
  dismissible?: boolean;
  id?: string;
};

export type InternalNotification = {
  id: string;
  element: HTMLDivElement;
  timeout?: number;
};
