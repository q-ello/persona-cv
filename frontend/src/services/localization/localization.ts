import { IEvent } from '@cv/shared';
import en from '../../locales/en.json'
import ru from '../../locales/ru.json'
import { languageStorage } from './languageStore';

const localization = {
    en,
    ru
}

export const LANGUAGES = ["en", "ru"] as const;

export type Language = typeof LANGUAGES[number];

type LocalizationKey = keyof typeof en | keyof typeof ru;

export function isLanguage(value: string): value is Language 
{
    return LANGUAGES.includes(value as Language);
}

export function localize(key: LocalizationKey, params?: any)
{
    const lang = languageStorage.getLanguage();

    const locale = localization[lang];

    if (key in locale)
    {
        return locale[key];
    }
    return localization.en[key];
}

export function localizeEvent(event: IEvent) {
    const lang = languageStorage.getLanguage();

    if (lang === "ru") {
        return event.eventRu;
    }

    return event.eventEng;
}