import { Language, LANGUAGES } from '@cv/shared';
import en from '../../locales/en.json'
import ru from '../../locales/ru.json'
import { languageStorage } from './languageStore';

const localization = {
    en,
    ru
}

type LocalizationKey = keyof typeof en;

export function isLanguage(value: string): value is Language {
    return LANGUAGES.includes(value as Language);
}

export function localize(key: string, params?: any) {
    const lang = languageStorage.getLanguage();

    const locale = localization[lang];

    const locKey = key as LocalizationKey;

    let result: string | string[];

    if (locKey in locale) {
        result = locale[locKey];
    }
    else if (locKey in localization.en) {
        console.warn(`Did not find localization for key ${key} in locale ${locale}. Falling back to english localization`)
        result = localization.en[locKey];
    }
    else {
        console.warn(`Did not find any localization for key ${key}. Returning the key instead.`)
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