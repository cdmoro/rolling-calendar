import en from './en';
import es from './es';
import fr from './fr';
import it from './it';
import pt from './pt';
import de from './de';
import el from './el';
import ar from './ar';
import { store } from '../store';
import type { LanguageKey, TranslationKey } from '../types/i18n';
import { updateMetaTitle } from '../modules/calendars';

const DICTS = { en, es, fr, it, pt, de, el, ar };
const RTL_LANGUAGES: string[] = ['ar'];

export const languageTranslation: Record<LanguageKey, string> = {
  english: 'English',
  spanish: 'Español',
  italian: 'Italiano',
  french: 'Français',
  portuguese: 'Português',
  german: 'Deutsch',
  greek: 'Ελληνικά',
  arabic: 'العربية'
};

export function getTranslations() {
  return {
    ...DICTS[store.language],
    ...languageTranslation
  };
}

export function applyTranslations() {
  translateElement();
  updateMetaTitle();

  document.documentElement.setAttribute('lang', store.language);
  document.documentElement.setAttribute(
    'dir',
    RTL_LANGUAGES.includes(store.language as LanguageKey) ? 'rtl' : 'ltr'
  );
}

export function translateElement(el = document.body as HTMLElement) {
  const dict = getTranslations();

  el.querySelectorAll<HTMLElement>('[data-label]').forEach((el) => {
    const key = el.dataset.label as keyof typeof dict;
    el.textContent = dict[key];
  });

  el.querySelectorAll<HTMLElement>('[data-title]').forEach((el) => {
    const key = el.dataset.title as keyof typeof dict;
    el.setAttribute('title', dict[key]);
  });

  el.querySelectorAll<HTMLElement>('[data-placeholder]').forEach((el) => {
    const key = el.dataset.placeholder as keyof typeof dict;
    el.setAttribute('placeholder', dict[key]);
  });
}

export function t(
  key: TranslationKey | LanguageKey,
  placeholders?: Record<string, string | undefined>
) {
  const dict = getTranslations();
  let translation = dict[key] || `[${key}]`;

  if (placeholders) {
    for (const [placeholderKey, value] of Object.entries(placeholders)) {
      const regex = new RegExp(`\\{${placeholderKey}\\}`, 'g');

      if (value === undefined) continue;
      translation = translation.replace(regex, value);
    }
  }

  return translation;
}

export function tv2(key: TranslationKey, ...values: string[]) {
  const dict = getTranslations();
  let translation = dict[key] || `[${key}]`;

  values.forEach((value) => {
    translation = translation.replace('{}', value);
  });

  return translation;
}
