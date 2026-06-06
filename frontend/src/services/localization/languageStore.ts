import { isLanguage, Language } from "@cv/shared";
import { useEffect, useState } from "react";

type Listener = (lang: Language) => void;
const listeners = new Set<Listener>();

const fallBack: Language = "en";

const resolve = (value: string | null): Language => value && isLanguage(value) ? value : fallBack;

export const languageStore = {
    lang: resolve(localStorage.getItem("lang")) as Language,

    setLanguage(lang: Language) {
        this.lang = lang;
        localStorage.setItem("lang", lang);
        listeners.forEach(l => l(lang));
    },

    subscribe(listener: Listener) {
        listeners.add(listener);
        return () => { listeners.delete(listener); };
    }
};

export const useLanguage = (): Language => {
    const [lang, setLang] = useState(languageStore.lang);
    useEffect(() => languageStore.subscribe(setLang), []);
    return lang;
}