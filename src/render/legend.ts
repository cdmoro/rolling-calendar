import { t } from "../i18n";
import type { TranslationKey } from "../types/i18n";

function createLegendItem(className: string, labelKey: TranslationKey) {
    const div = document.createElement('div');
    div.innerHTML = `<span class="day ${className}"></span> <span>${t(labelKey)}</span>`;
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
        marked: createLegendItem('marked weekday', 'noActivity'),
        half: createLegendItem('marked half weekday', 'halfDay'),
        period: createLegendItem('period', 'periodStartEnd')
    }

    Object.entries(legends).forEach(([key, item]) => {
        if (existsMarkedDays(key)) {
            legendElement.appendChild(item);
        }
    });
}