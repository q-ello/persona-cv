import { EventResponse, IEvent, Language } from "@cv/shared";
import { createGoogleCalendarService } from "../../externalApi/googleCalendar/googleCalendar.service";
import { createNagerService } from "../../externalApi/nager/nager.service";
import { IRawEvent } from "../../../types/events.types";

export const createEventSerivce = (
    googleCalendar: ReturnType<typeof createGoogleCalendarService>,
    nagerService: ReturnType<typeof createNagerService>
) => {
    //first key: year-month, second: date string
    const cachedEvents: Record<string, Record<string, IRawEvent[]>> = {};

    const getEvents = (locale: Language, month: number, year: number): EventResponse => {
        return localizeEvents(locale, cachedEvents[`${month}-${year}`]);
    }

    const init = () => {
        console.log("Started initializing events cache");
        initializeCache();
    }

    const initializeCache = async () => {
        const startDate = new Date(2022, 0, 1);
        const now = new Date();
        const endDate = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());

        const [googleEvents, nagerEvents] = await Promise.all([
            googleCalendar.getGoogleCalendarEvents(startDate, endDate),
            nagerService.getHolidaysEvents(startDate, endDate)
        ]);

        const allEvents = [...googleEvents, ...nagerEvents];

        mergeEventsIntoCache(allEvents);
        console.log(`Cached ${googleEvents.length} events from google and ${nagerEvents.length} holidays from nager since ${startDate.toDateString()} to ${endDate.toDateString()}`)
    }

    const localizeEvents = (locale: Language, rawEvents: Record<string, IRawEvent[]>): EventResponse => {
        const localizedEventsRecord: Record<string, IEvent[]> = {};

        for (const key in Object.keys(rawEvents)) {
            const localizedEvents = rawEvents[key].map(rawEvent => ({
                state: rawEvent.state,
                eventText: (locale && locale == "ru") ? rawEvent.eventRu : rawEvent.eventEng,
                type: rawEvent.type
            }));

            localizedEventsRecord[key] = localizedEvents;
        }

        return localizedEventsRecord;
    }

    const mergeEventsIntoCache = (events: IRawEvent[]): void => {
        const addToCache = (firstKey: string, secondKey: string, event: IRawEvent) => {
            if (cachedEvents[firstKey] && cachedEvents[firstKey][secondKey]) {
                cachedEvents[firstKey][secondKey].push(event);
            } else if (cachedEvents[firstKey]) {
                cachedEvents[firstKey][secondKey] = [event];
            } else {
                cachedEvents[firstKey] = {[secondKey]: [event]};
            }
        };

        events.forEach(rawEvent => {
            const dateString = rawEvent.date;
            //the string is in y-m-d format, we just need y-m
            addToCache(`${dateString.substring(0, dateString.lastIndexOf('-'))}`, rawEvent.date, rawEvent);
        }
        );
    }

    //todo: webhooks for google calendar
    //todo: tests
    
    return { getEvents, init }
}