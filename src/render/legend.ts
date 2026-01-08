import { t } from '../i18n';
import type { TranslationKey } from '../types/i18n';

function createLegendItem(className: string, labelKey: TranslationKey) {
  const div = document.createElement('div');
  div.innerHTML = `<span class="day weekday ${className}">1</span> <span>${t(labelKey)}</span>`;
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
    'no-activity': createLegendItem('marked weekday no-activity', 'noActivity'),
    'half-day': createLegendItem('marked half-day weekday', 'halfDay'),
    'start-end-period': createLegendItem('start-end-period', 'startEndPeriod'),
    'internal-activity': createLegendItem(
      'internal-activity',
      'internalActivity'
    ),
    'administrative-event': createLegendItem(
      'administrative-event',
      'administrativeEvent'
    ),
    'community-event': createLegendItem('community-event', 'communityEvent')
  };

  Object.entries(legends).forEach(([key, item]) => {
    if (existsMarkedDays(key)) {
      legendElement.appendChild(item);
    }
  });
}
