import { t } from '../i18n';
import { state } from '../state/app';
import type { EventType } from '../types/calendar';
import type { TranslationKey } from '../types/i18n';

export const EVENT_LEGEND: Record<EventType, TranslationKey> = {
  'no-activity': 'noActivity',
  'half-day': 'halfDay',
  'internal-activity': 'internalActivity',
  'administrative-event': 'administrativeEvent',
  'community-event': 'communityEvent',
  'start-end-period': 'startEndPeriod'
};

export function getEventLegendLabel(type: EventType): string {
  return t(EVENT_LEGEND[type]) || t('noActivity');
}

export function formatLongDate(
  dateStr: string,
  locale: string = state.language
): string {
  const date = new Date(dateStr);
  const formatter = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  return formatter.format(date);
}