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
};

export type MonthGridCell = Date | null;
export type MonthGrid = MonthGridCell[][];
