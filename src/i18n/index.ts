import en from './en';
import es from './es';
import fr from './fr';
import it from './it';
import pt from './pt';
import { state } from '../state/app';

const dicts = { en, es, fr, it, pt };

export function applyTranslations() {
  const dict = dicts[state.language];

  document.querySelectorAll<HTMLElement>('[data-label]').forEach((el) => {
    const key = el.dataset.label as keyof typeof dict;
    el.textContent = dict[key];
  });
}

export function getStrings() {
  return dicts[state.language];
}
