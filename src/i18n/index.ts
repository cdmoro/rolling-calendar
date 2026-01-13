import en from './en';
import es from './es';
import fr from './fr';
import it from './it';
import pt from './pt';
import de from './de';
import el from './el';
import ar from './ar';
import { state } from '../state/app';
import type { LanguageKey, TranslationKey } from '../types/i18n';

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
    ...DICTS[state.language],
    ...languageTranslation
  };
}

export function applyTranslations() {
  const dict = getTranslations();

  translateElement();

  document.documentElement.setAttribute('lang', state.language);
  document.documentElement.setAttribute(
    'dir',
    RTL_LANGUAGES.includes(state.language as LanguageKey) ? 'rtl' : 'ltr'
  );
  document.title = dict.title;
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

export function t(key: TranslationKey) {
  const dict = getTranslations();
  return dict[key] || `[${key}]`;
}
