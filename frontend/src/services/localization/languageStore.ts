import { Language } from "./localization";

export const languageStorage = {
    getLanguage(): Language {
        let lang = localStorage.getItem("lang");
        if (!lang) {
            this.setLanguage("en");
            lang = "en";
        }
        return lang as Language;
    },

    setLanguage(language: Language) {
        localStorage.setItem("lang", language);
    }
}

