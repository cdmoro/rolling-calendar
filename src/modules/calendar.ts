import type { MonthGrid } from '../types/calendar';
import type { Language } from '../types/app';

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

export function getLocalizedWeekdays(lang: Language): string[] {
  const formatter = new Intl.DateTimeFormat(lang, {
    weekday: 'short'
  });

  // Sunday = 2023-01-01
  const baseDate = new Date(2023, 0, 1);

  return Array.from({ length: 7 }, (_, i) =>
    formatter.format(
      new Date(
        baseDate.getFullYear(),
        baseDate.getMonth(),
        baseDate.getDate() + i
      )
    )
  );
}

export function addOnClickToWeekdays() {
  const startDateInput =
    document.querySelector<HTMLInputElement>('#startDate')!;
  const endDateInput = document.querySelector<HTMLInputElement>('#endDate')!;
  const titleInput = document.querySelector<HTMLInputElement>('#title')!;
  const weekDays = document.querySelectorAll<HTMLDivElement>('.weekday');

  weekDays.forEach((day) => {
    day.addEventListener('click', (e) => {
      const el = e.currentTarget as HTMLDivElement;

      if (el.classList.contains('marked')) {
        return;
      }

      if (el.classList.contains('selected')) {
        el.classList.remove('selected');
        startDateInput.value = '';
        endDateInput.removeAttribute('min');
        return;
      }

      weekDays.forEach((d) => d.classList.remove('selected'));
      el.classList.add('selected');
      startDateInput.value = el.dataset.date || '';
      endDateInput.min = el.dataset.date || '';
      titleInput.focus();
    });
  });
}
