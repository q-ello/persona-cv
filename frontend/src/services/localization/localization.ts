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

type LocalizationKey = keyof typeof en;

export function isLanguage(value: string): value is Language {
    return LANGUAGES.includes(value as Language);
}

export function localize(key: string, params?: any) {
    console.log("localize", { key, params });

    const lang = languageStorage.getLanguage();

    const locale = localization[lang];

    const locKey = key as LocalizationKey;

    let result: string | string[];

    if (locKey in locale) {
        result = locale[locKey];
    }
    else if (locKey in localization.en) {
        result = localization.en[locKey];
    }
    else {
        result = key;
    }

    if (Array.isArray(result)) {
        return result;
    }

    let resultStr = result as string;

    if (params) {
        Object.keys(params).forEach(paramKey => {
            const regex = new RegExp(`{${paramKey}}`, 'g');
            resultStr = resultStr.replace(regex, params[paramKey]);
        });
    }

    return resultStr;
}

export function localizeEvent(event: IEvent) {
    const lang = languageStorage.getLanguage();

    if (lang === "ru") {
        return event.eventRu;
    }

    return event.eventEng;
}