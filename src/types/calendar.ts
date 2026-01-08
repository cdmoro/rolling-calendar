export type CalendarState = {
  startYear: number;
  startMonth: number;
  calendarTitle: string;
  calendarSubtitle: string;
  events: CalendarEvent[];
};

export type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  halfDay?: boolean;
  color?: string;
  type:
    | 'no-activity'
    | 'half-day'
    | 'internal-activity'
    | 'administrative-event'
    | 'community-event'
    | 'start-end-period';
};

export type MonthGridCell = Date | null;
export type MonthGrid = MonthGridCell[][];
