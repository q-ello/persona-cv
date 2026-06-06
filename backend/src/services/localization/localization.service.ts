import { Language } from "@cv/shared";
import { createNotionService } from "../notion/notion.service";

export type LocalizationEntry = Record<Language, string>
export type LocalizationCache = Map<string, LocalizationEntry>

export const createLocalizationService = (notionService: ReturnType<typeof createNotionService>) => {
    let cachedLocales: LocalizationCache = new Map();
    let lastFetchedTime: Date;

    const init = () => {
        console.log("Started initializing localization cache");
        refreshCache();

        setInterval(() => reload(), 24*60*60*1000)
    }

    const reload = async () => {
        await refreshCache();
    }

    const refreshCache = async () => {
        try {
            //first call will be with time = undefined. that is how it is designed, so we compare lastEditedTime only when we do have cache
            const freshLocales = await notionService.getAllLocalizations(lastFetchedTime);
            lastFetchedTime = new Date();

            if (freshLocales.size > 0)
            {
                cachedLocales = freshLocales;
                console.log(`Refreshed ${cachedLocales.size} localization keys`);
            }
            else
            {
                console.log("Didn't refresh locales: database didn't change from the last fetch");
            }

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
        const trueResult = cachedLocales.get(key)?.[locale];
        if (trueResult)
        {
            return trueResult;
        }

        const enResult = cachedLocales.get(key)?.en;
        if (enResult)
        {
            console.warn(`No ${locale} locale for the key ${key}. Falling back to english one`);
            return enResult;
        }

        console.warn(`No locales for the key ${key}. Returning the key back`);

        return key.split(".").pop() as string; 
    }

    return {init, asyncLocalize, reload}
}