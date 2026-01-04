import en from './en';
import es from './es';
import fr from './fr';
import it from './it';
import pt from './pt';
import de from './de';
import { state } from '../state/app';
import type { LanguageKey, TranslationKey } from '../types/i18n';

const dicts = { en, es, fr, it, pt, de };

export const languageTranslation: Record<LanguageKey, string> = {
  english: 'English',
  spanish: 'Español',
  italian: 'Italiano',
  french: 'Français',
  portuguese: 'Português',
  german: 'Deutsch'
};

export function getTranslations() {
  return {
    ...dicts[state.language],
    ...languageTranslation
  };
}

export function applyTranslations() {
  const dict = getTranslations();

  document.querySelectorAll<HTMLElement>('[data-label]').forEach((el) => {
    const key = el.dataset.label as keyof typeof dict;
    el.textContent = dict[key];
  });

  document.documentElement.setAttribute('lang', state.language);
  document.title = dict.title;
}

export function t(key: TranslationKey) {
  const dict = getTranslations();
  return dict[key];
}
