import type { EventType } from '../types/calendar';
import { getEventLegendLabel } from './utils';

function createLegendItem(type: EventType) {
  const div = document.createElement('div');
  div.dataset.type = type;
  div.innerHTML = `<span class="day weekday marked ${type}"></span> <span>${getEventLegendLabel(type)}</span>`;

  div.addEventListener('mouseenter', () => {
    document
      .querySelectorAll('.event-list .event-item')
      .forEach((item) => item.classList.remove('event-highlight'));
    document
      .querySelectorAll(`.event-list .event-item.${type}`)
      .forEach((item) => item.classList.add('event-highlight'));
  });

  div.addEventListener('mouseleave', () => {
    document
      .querySelectorAll('.event-list .event-item')
      .forEach((item) => item.classList.remove('event-highlight'));
  });

  return div;
}

function existsMarkedDays(className: string): boolean {
  const calendarGrid = document.querySelector('#calendar-grid');
  if (!calendarGrid) return false;

  return calendarGrid.querySelector(`.day.${className}`) !== null;
}

export function renderLegend() {
  const legendElement = document.querySelector<HTMLElement>('.legend');
  if (!legendElement) return;

  legendElement.innerHTML = '';

  const legends = {
    'no-activity': createLegendItem('no-activity'),
    'half-day': createLegendItem('half-day'),
    'start-end-period': createLegendItem('start-end-period'),
    'internal-activity': createLegendItem('internal-activity'),
    'administrative-event': createLegendItem('administrative-event'),
    'community-event': createLegendItem('community-event')
  };

  Object.entries(legends).forEach(([key, item]) => {
    if (existsMarkedDays(key)) {
      legendElement.appendChild(item);
    }
  });
}
