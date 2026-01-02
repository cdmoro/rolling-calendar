import type { Language } from '../types/app';

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
  const titleInput = document.querySelector<HTMLInputElement>('#title')!;
  const weekDays = document.querySelectorAll<HTMLDivElement>('.weekday');

  weekDays.forEach((day) => {
    day.addEventListener('click', (e) => {
      const el = e.currentTarget as HTMLDivElement;

      if (el.classList.contains('marked')) {
        return;
      }

      weekDays.forEach((d) => d.classList.remove('selected'));
      el.classList.add('selected');
      startDateInput.value = el.dataset.date || '';
      titleInput.focus();
    });
  });
}
