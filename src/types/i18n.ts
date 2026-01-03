export const languagesKeys = [
  'english',
  'spanish',
  'italian',
  'french',
  'portuguese',
  'german'
] as const;

export const translationKeys = [
  'title',
  'newEvent',
  'eventTitle',
  'startDate',
  'endDate',
  'addEvent',
  'events',
  'fullDay',
  'halfDay',
  'light',
  'dark',
  'blue',
  'olive',
  'red',
  'redgrape',
  'orange',
  'teal',
  'pink',
  'cyan',
  'lime',
  'purple',
  'green',
  'grey',
  'burgundy',
  'settings',
  'calendarTitle',
  'calendarSubtitle',
  'startMonth'
] as const;

export type TranslationKey = (typeof translationKeys)[number];
export type LanguageKey = (typeof languagesKeys)[number];
export type Translations = Record<TranslationKey, string>;
