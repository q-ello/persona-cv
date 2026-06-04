import { Language } from "@cv/shared";
import { createNotionService } from "../notion/notion.service";

export type LocalizationEntry = Record<Language, string>

export type LocalizationCache = Map<string, LocalizationEntry>

export const createLocalizationService = (notionService: ReturnType<typeof createNotionService>) => {
    let cachedLocales: LocalizationCache = new Map();

    const init = () => {
        console.log("Started initializing localization cache");
        refreshCache();

        setInterval(() => reload(), 24*60*60*1000)
    }

    const reload = () => {
        refreshCache();
    }

    const refreshCache = async () => {
        try {
            cachedLocales = await notionService.getAllLocalizations();
            console.log(`Refreshed ${cachedLocales.size} localization keys`);
        }
        catch (e) {
            console.log("Cache wasn't refreshed:", e);
        }
    }

    const asyncLocalize = async (key: string, locale: Language): Promise<string> => {
        const result = cachedLocales.get(key)?.[locale];
        if (result)
        {
            return result;
        }

        //if we didn't find that let's try refreshing
        await refreshCache();
        return cachedLocales.get(key)?.[locale] || cachedLocales.get(key)?.en || key;
    }

    return {init, asyncLocalize}
}