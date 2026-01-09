import { t } from '../i18n';
import type { EventType } from '../types/calendar';

export const EVENT_LEGEND_TRANSLATION: Record<EventType, string> = {
  'no-activity': t('noActivity'),
  'half-day': t('halfDay'),
  'internal-activity': t('internalActivity'),
  'administrative-event': t('administrativeEvent'),
  'community-event': t('communityEvent'),
  'start-end-period': t('startEndPeriod')
};

export function getEventLegendLabel(type: EventType): string {
  return EVENT_LEGEND_TRANSLATION[type] || t('noActivity');
}
