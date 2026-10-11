import { EventResponse, Language, MIN_TIMELINE_DATE } from "@cv/shared";
import { createGoogleCalendarService } from "../../externalApi/googleCalendar/googleCalendar.service";
import { createNagerService } from "../../externalApi/nager/nager.service";
import { IRawEvent } from "../../../types/events.types";

export const createEventSerivce = (
    googleCalendar: ReturnType<typeof createGoogleCalendarService>,
    nagerService: ReturnType<typeof createNagerService>
) => {
    //first key: year-month, second: date string
    const cachedEvents: Map<string, Map<string, IRawEvent[]>> = new Map();
    const nagerYearLoads = new Map<number, Promise<void>>;
    let cacheInitialization: Promise<void> | null = null;
    let refreshInterval: NodeJS.Timeout | null = null;

    const getEvents = async (locale: Language, month: number, year: number): Promise<EventResponse> => {
        await init();
        await ensureNagerYear(year);

        const monthKey = `${year}-${(month + 1).toString().padStart(2, '0')}`;

        if (!cachedEvents.has(monthKey)) {
            return {};
        } 

        return localizeEvents(locale, cachedEvents.get(monthKey) ?? new Map());
    }

    const init = (): Promise<void> => {
        if (!cacheInitialization) {
            console.log("Started initializing events cache");
            cacheInitialization = initializeCache();
            void cacheInitialization.catch(error => {
                cacheInitialization = null;
                console.error("Failed to initialize events cache:", error);
            });
        }

        if (!refreshInterval) {
            refreshInterval = setInterval(async () => {
                updateGoogleEvents();
            }, 1000*60*60*24);
        }


        return cacheInitialization;
    }

    const updateGoogleEvents = async (): Promise<void> => {
        try {
            const newGoogleEvents = await googleCalendar.getGoogleCalendarEvents();
            mergeEventsIntoCache(newGoogleEvents);
            googleCalendar.commitCachedEventsIds();
            console.log(`Added ${newGoogleEvents.length} new events from google calendar`);
        } catch (error) {
            console.log(`Could not refresh google events. retrying in 5 seconds`);
            setTimeout(() => {
                updateGoogleEvents();
            }, 1000*5);
        }
    }

    const initializeCache = async () => {
        const [googleEvents, nagerEvents] = await Promise.all([
            googleCalendar.getGoogleCalendarEvents(),
            nagerService.getHolidaysEvents(MIN_TIMELINE_DATE.getFullYear(), new Date().getFullYear())
        ]);

        const allEvents = [...googleEvents, ...nagerEvents];

        mergeEventsIntoCache(allEvents);
        googleCalendar.commitCachedEventsIds();
        console.log(`Cached ${googleEvents.length} events from google and ${nagerEvents.length} holidays from nager since ${MIN_TIMELINE_DATE.toDateString()}`)
    }

    const localizeEvents = (locale: Language, rawEvents: Map<string, IRawEvent[]>): EventResponse => {
        const localizedEventsRecord: EventResponse = {};

        rawEvents.forEach((rawEvent, key) => {
            const localizedEvents = rawEvents.get(key)?.map(rawEvent => ({
                state: rawEvent.state,
                eventText: (locale && locale == "ru") ? rawEvent.eventRu : rawEvent.eventEng,
                type: rawEvent.type
            }));

            localizedEventsRecord[key] = localizedEvents ?? [];
        
        })

        return localizedEventsRecord;
    }

    const mergeEventsIntoCache = (events: IRawEvent[]): void => {
        const addToCache = (firstKey: string, secondKey: string, event: IRawEvent) => {
            if (!cachedEvents.has(firstKey)) {
                cachedEvents.set(firstKey, new Map([[secondKey, [event]]]));
            } else if (!cachedEvents.get(firstKey)?.has(secondKey)) {
                cachedEvents.get(firstKey)?.set(secondKey, [event]);
            } else {
                cachedEvents.get(firstKey)?.get(secondKey)?.push(event);
            }
        };

        events.forEach(rawEvent => {
            const dateString = rawEvent.date;
            //the string is in y-m-d format, we just need y-m
            addToCache(`${dateString.substring(0, dateString.lastIndexOf('-'))}`, rawEvent.date, rawEvent);
        });

        //after merge we can successfully commit cached ids in google calendar
        googleCalendar.commitCachedEventsIds();
    }

    //#region nager

    const ensureNagerYear = async (year: number): Promise<void> => {
        if (!nagerYearLoads.has(year)) {
            nagerYearLoads.set(year, loadNagerYear(year));
        }

        try {
            await nagerYearLoads.get(year);
        } catch (error) {
            nagerYearLoads.delete(year);
            throw error;
        }
    }

    const loadNagerYear = async (year: number): Promise<void> => {
        if (nagerService.hasFetchedYear(year)) {
            return;
        }

        const newNagerEvents = await nagerService.getHolidaysEvents(year);
        mergeEventsIntoCache(newNagerEvents);

        console.log(`Added ${newNagerEvents.length} holidays into cache`);
    }

    //#endregion

    return { getEvents, init }
}
