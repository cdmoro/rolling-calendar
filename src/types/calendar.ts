export type CalendarState = {
  startYear: number;
  startMonth: number;
  calendarTitle?: string;
  calendarSubtitle?: string;
  events: CalendarEvent[];
  color: string;
};

export type EventType =
  | 'no-activity'
  | 'half-day'
  | 'internal-activity'
  | 'administrative-event'
  | 'community-event'
  | 'start-end-period';

export type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end?: string;
  color?: string;
  type: EventType;
};

export type CalendarDocument = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  state: CalendarState;
  isDraft: boolean;
};

export type MonthGridCell = Date | null;
export type MonthGrid = MonthGridCell[][];
