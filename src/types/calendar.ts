export type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  halfDay?: boolean;
  color?: string;
};

export type MonthRef = {
  year: number;
  month: number;
};

export type MonthGridCell = Date | null;
export type MonthGrid = MonthGridCell[][];
