import { t } from "../i18n";
import type { TranslationKey } from "../types/i18n";

function existsMarkedDays(className: string): boolean {
    const calendarGrid = document.querySelector('#calendar-grid');
    if (!calendarGrid) return false;

    return calendarGrid.querySelector(`.day.${className}`) !== null;
}

function addLegendItem(legendElement: HTMLElement, className: string, labelKey: TranslationKey) {
    const div = document.createElement('div');
    div.innerHTML = `<span class="day ${className}"></span> <span>${t(labelKey)}</span>`;
    legendElement.appendChild(div);
}

export function renderLegend() {
    const legendElement = document.querySelector<HTMLElement>('.legend');
    if (!legendElement) return;

    legendElement.innerHTML = '';

    if (existsMarkedDays('marked')) {
        addLegendItem(legendElement, 'marked weekday', 'noActivity');
    }

    if (existsMarkedDays('marked.half')) {
        addLegendItem(legendElement, 'marked half weekday', 'halfDay');
    }

    if (existsMarkedDays('period')) {
        addLegendItem(legendElement, 'period', 'periodStartEnd');
    }
}