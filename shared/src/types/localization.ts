export const LANGUAGES = ["en", "ru"] as const;

export type Language = typeof LANGUAGES[number];

export function isLanguage(value: string): value is Language {
    return LANGUAGES.includes(value as Language);
}