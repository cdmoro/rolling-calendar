import {
  getEvent,
  getRangePosition,
  openEditEventDialog,
  openNewEventDialog,
  toLocalISODate
} from '../modules/events';
import { getLocalizedWeekdays, getFixedMonthGrid } from '../modules/calendar';
import { store } from '../store';
import { EVENT_LEGEND, formatLongDate, getEventLegendLabel } from './utils';
import { formatEventDate, renderEventList } from './events';
import { t, translateElement } from '../i18n';
import { confirmDialog } from '../modules/dialogs';
import { renderLegend } from './legend';
import { autosaveCurrentCalendar } from '../modules/calendars';
import { Toast } from '../modules/notifications';

const grid = document.querySelector<HTMLDivElement>('#calendar-grid')!;

grid.addEventListener('click', async (e) => {
  const btn = (e.target as HTMLButtonElement).closest<HTMLButtonElement>(
    '.btn'
  );

  if (btn?.dataset.eventId) {
    const event = store.calendar!.state.events.find(
      (ev) => ev.id === btn.dataset.eventId
    );

    if (!event) return;

    switch (btn.value) {
      case 'delete': {
        // openDeleteEventDialog(btn.dataset.eventId);
        const dates =
          event.start === event.end
            ? `<p><strong>${t('date')}</strong>: ${formatLongDate(event.start, store.language)}</p>`
            : `<p><strong>${t('startDate')}</strong>: ${formatLongDate(event.start, store.language)}</p>
                 <p><strong>${t('endDate')}</strong>: ${formatLongDate(event.end, store.language)}</p>`;
        const detail = `
              <p><strong>${t('titleLabel')}</strong>: ${event.title}</p>
              ${dates}
              <p><strong>${t('type')}</strong>: ${getEventLegendLabel(event.type)}</p>
            `;

        const doDelete = await confirmDialog({
          title: t('deleteEvent'),
          message: t('deleteEventConfirmation'),
          detail,
          confirmButtonText: t('delete'),
          cancelButtonText: t('cancel'),
          confirmButtonClass: 'btn-danger'
        });

        if (doDelete) {
          const index = store.calendar!.state.events.findIndex(
            (event) => event.id === btn.dataset.eventId
          );

          if (index !== -1) {
            store.calendar!.state.events.splice(index, 1);
            autosaveCurrentCalendar();
            renderEventList();
            renderCalendar();
            renderLegend();

            Toast.success(t('eventDeleted'), {
              id: 'event-deleted'
            });
          } else {
            Toast.error(t('eventNotFound'), {
              id: 'event-not-found'
            });
          }
        }
        break;
      }
      case 'edit': {
        if (event) {
          openEditEventDialog(event);
        }
        break;
      }
    }
    return;
  }

  const weekday = (e.target as HTMLButtonElement).closest<HTMLButtonElement>(
    '.day.weekday:not(.marked)'
  );

  if (!weekday?.dataset.date) return;

  openNewEventDialog(weekday.dataset.date);
});

export function renderCalendar() {
  grid.innerHTML = '';

  const weekdays = getLocalizedWeekdays(store.language);

  for (let i = 0; i < 12; i++) {
    const date = new Date(
      store.calendar!.state.startYear,
      store.calendar!.state.startMonth + i
    );

    const monthEl = document.createElement('div');
    monthEl.className = 'month';

    /* ---- Month title ---- */
    const title = document.createElement('div');
    title.className = 'month-title';
    title.textContent = date.toLocaleString(store.language, {
      month: 'long',
      year: 'numeric'
    });

    monthEl.appendChild(title);

    /* ---- Weekday header ---- */
    const header = document.createElement('div');
    header.className = 'week-header';
    header.innerHTML = weekdays.map((wd) => `<div>${wd}</div>`).join('');

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
        const isWeekend = weekday === 0 || weekday === 6;

        cell.classList.add(isWeekend ? 'weekend' : 'weekday');
        cell.dataset.date = toLocalISODate(day);
        cell.dataset.day = weekday.toString();

        const event = getEvent(day);

        if (event) {
          const isSingleDayEvent = event.start === event.end;

          cell.innerHTML += `<div class="tooltip">
            <div class="tooltip-body">
              <div class="tooltip-title">${event.title}</div>
              <div class="tooltip-date">${formatEventDate(event, true)}</div>
              <div class="tooltip-actions">
                <button class="btn btn-primary btn-sm" value="edit" data-event-id="${event.id}" data-title="edit">
                  <app-icon name="edit"></app-icon>
                </button>
                <button class="btn btn-danger btn-sm" value="delete" data-event-id="${event.id}" data-title="delete">
                  <app-icon name="trash"></app-icon>
                </button>
              </div>
            </div>
            <div class="tooltip-type" data-label="${EVENT_LEGEND[event.type || 'no-activity']}"></div>
          </div>`;

          cell.dataset.dateStart = event.start;
          cell.classList.add('marked');
          cell.classList.add(event.type || 'no-activity');

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

    translateElement(grid);
  }
}
