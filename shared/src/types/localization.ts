export const LANGUAGES = ["en", "ru"] as const;

export type Language = typeof LANGUAGES[number];