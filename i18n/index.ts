import { tr } from './tr';
import { en } from './en';
import { AppLanguage, Translations } from './types';

export type { AppLanguage, Translations };

const translations: Record<AppLanguage, Translations> = { tr, en };

export function getTranslations(lang: AppLanguage): Translations {
  return translations[lang];
}

export const LANGUAGE_LABELS: Record<AppLanguage, string> = {
  tr: 'Türkçe',
  en: 'English',
};
