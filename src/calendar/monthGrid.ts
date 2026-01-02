import type { MonthGrid } from '../types/calendar';

export function getFixedMonthGrid(year: number, month: number): MonthGrid {
  const firstDay = new Date(year, month, 1);
  const offset = firstDay.getDay(); // Sunday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];

  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length < 42) cells.push(null);

  return Array.from({ length: 6 }, (_, i) => cells.slice(i * 7, i * 7 + 7));
}
