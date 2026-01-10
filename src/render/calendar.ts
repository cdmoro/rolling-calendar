import { calendarState } from '../state/calendar';
import { getEvent, getRangePosition, toLocalISODate } from '../modules/events';
import {
  addOnClickToWeekdays,
  getLocalizedWeekdays,
  getFixedMonthGrid
} from '../modules/calendar';
import { state } from '../state/app';
import { getEventLegendLabel } from './utils';

export function renderCalendar() {
  const grid = document.querySelector<HTMLDivElement>('#calendar-grid')!;
  grid.innerHTML = '';

  for (let i = 0; i < 12; i++) {
    const date = new Date(
      calendarState.startYear,
      calendarState.startMonth + i
    );

    const monthEl = document.createElement('div');
    monthEl.className = 'month';

    /* ---- Month title ---- */
    const title = document.createElement('div');
    title.className = 'month-title';
    title.textContent = date.toLocaleString(state.language, {
      month: 'long',
      year: 'numeric'
    });

    monthEl.appendChild(title);

    /* ---- Weekday header ---- */
    const header = document.createElement('div');
    header.className = 'week-header';

    getLocalizedWeekdays(state.language).forEach((label) => {
      const h = document.createElement('div');
      h.textContent = label;
      header.appendChild(h);
    });

    monthEl.appendChild(header);

    /* ---- Days grid ---- */
    const monthGrid = document.createElement('div');
    monthGrid.className = 'month-grid';

    const weeks = getFixedMonthGrid(date.getFullYear(), date.getMonth());

    weeks.flat().forEach((day) => {
      const cell = document.createElement('div');
      cell.className = 'day';

      if (day) {
        cell.textContent = day.getDate().toString();

        const weekday = day.getDay();
        cell.classList.add(
          weekday === 0 || weekday === 6 ? 'weekend' : 'weekday'
        );
        cell.dataset.date = toLocalISODate(day);
        cell.dataset.day = weekday.toString();

        const event = getEvent(day);

        if (event) {
          const isSingleDayEvent = event.start === event.end;

          cell.dataset.dateStart = event.start;
          cell.classList.add('marked');
          cell.classList.add(event.type || 'no-activity');
          cell.title = `${event.title} – ${getEventLegendLabel(event.type)}`;

          if (isSingleDayEvent) {
            cell.classList.add('single');
          } else {
            cell.classList.add('range');

            const pos = getRangePosition(
              toLocalISODate(day),
              event.start,
              event.end!
            );

            if (pos === 'start') {
              cell.classList.add('range-start');
            } else if (pos === 'end') {
              cell.classList.add('range-end');
            } else if (pos === 'middle') {
              cell.classList.add('range-middle');
            }
          }

          cell.addEventListener('mouseenter', () => {
            document
              .querySelectorAll('.event-list .event-item')
              .forEach((item) => item.classList.remove('event-highlight'));
            document
              .querySelectorAll(
                `.event-list .event-item[data-date-start="${event.start}"]`
              )
              .forEach((item) => item.classList.add('event-highlight'));
          });

          cell.addEventListener('mouseleave', () => {
            document
              .querySelectorAll('.event-list .event-item')
              .forEach((item) => item.classList.remove('event-highlight'));
          });
        }
      } else {
        cell.classList.add('empty');
      }

      monthGrid.appendChild(cell);
    });

    monthEl.appendChild(monthGrid);
    grid.appendChild(monthEl);
  }

  addOnClickToWeekdays();
}
