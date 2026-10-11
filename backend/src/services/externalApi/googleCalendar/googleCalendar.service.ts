import { EEventState, EEventType, getGeneralString, IEvent, MIN_TIMELINE_DATE } from '@cv/shared';
import { IRawEvent } from '../../../types/events.types';
import { IGoogleCalendarConfig } from '../../../types/config.types';

export const createGoogleCalendarService = (deps: IGoogleCalendarConfig, fetchFn: typeof fetch) => {
    const cachedEventsIds: Set<string> = new Set();
    const pendingToCacheEventsIds: Set<string> = new Set();
    let lastFetchedTime: Date | null = null;

    //todo: check id

    const getGoogleCalendarEvents = async (): Promise<IRawEvent[]> => {
        const rawEvents: IRawEvent[] = [];

        const fetchUpdated = async (calendarId: string) => {
            const apiUrl = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`;
            const params = new URLSearchParams({
                key: deps.apiKey,
                fields: "updated"
            });

            const response = await fetchFn(`${apiUrl}?${params}`);
            if (!response.ok) {
                throw new Error(`Google HTTP ${response.status}`);
            }
            
            const {updated} = await response.json();
            return updated;
        }

        let updateCommonCalendar = true;
        let updateDeadlineCalendar = true;

        let newFetchedTime = new Date();
        
        if (lastFetchedTime !== null) {
            updateCommonCalendar = new Date(await fetchUpdated(deps.commonCalendarId)) > (lastFetchedTime as Date);
            updateDeadlineCalendar = new Date(await fetchUpdated(deps.deadlinesCalendarId)) > (lastFetchedTime as Date);
        }

        const fetchEvents = async (calendarId: string, eventType: EEventType, pageToken?: string) => {
            const apiUrl = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`;
            const params = new URLSearchParams({
                key: deps.apiKey,
                timeMin: MIN_TIMELINE_DATE.toISOString(),
            });

            if (pageToken) {
                params.append('pageToken', pageToken);
            }

            const response = await fetchFn(`${apiUrl}?${params.toString()}`);
            if (!response.ok) {
                throw new Error(`Google HTTP ${response.status}`);
            }

            const data = await response.json();

            if (!data.items) return;

            const nextPageToken = data.nextPageToken;

            data.items.forEach((item: any) => {
                if (!item.summary || !item.id) {
                    return;
                }

                const uniqueId = `${calendarId}:${item.id}`;

                if (cachedEventsIds.has(uniqueId)) {
                    return;
                }

                pendingToCacheEventsIds.add(uniqueId);

                const eventEng: string = item.summary
                const eventRu: string = item.description ?? eventEng

                // if there is a time the date is for a day
                if (item.start.dateTime) {
                    const eventStart: Date = new Date(item.start.dateTime)
                    const eventState: EEventState = EEventState.Single
                    const newEvent: IRawEvent = {
                        eventEng, eventRu, type: eventType, state: eventState,
                        date: getGeneralString(eventStart)
                    }
                    rawEvents.push(newEvent);
                }
                // if event is going for days we need to add every day into the map
                else if (item.start.date) {
                    const eventStart = new Date(item.start.date)
                    // event end is exclusive
                    const eventEnd = new Date(item.end.date)

                    eventEnd.setDate(eventEnd.getDate() - 1)

                    const eventState: EEventState = eventStart.toDateString() === eventEnd.toDateString() ? EEventState.Single : EEventState.Start
                    const newEvent: IRawEvent = {
                        eventEng, eventRu, type: eventType, state: eventState,
                        date: getGeneralString(eventStart)
                    }
                    rawEvents.push(newEvent);

                    //if the start end end are the same then it is a single event, no need to make everything else
                    if (eventStart.toDateString() === eventEnd.toDateString()) {
                        return
                    }

                    let d: Date = new Date(eventStart)
                    d.setDate(d.getDate() + 1)
                    while (d.toDateString() != eventEnd.toDateString()) {
                        const middleRawEvent = { date: getGeneralString(d), eventEng, eventRu, type: eventType, state: EEventState.Middle };
                        rawEvents.push(middleRawEvent);
                        d.setDate(d.getDate() + 1);
                    }

                    const finalEvent = { date: getGeneralString(d), eventEng, eventRu, type: eventType, state: EEventState.End };
                    rawEvents.push(finalEvent);
                }
            })

            if (nextPageToken) {
                await fetchEvents(calendarId, eventType, nextPageToken);
            } 
        }

        if (updateCommonCalendar) {
            await fetchEvents(deps.commonCalendarId, EEventType.Common);
        }

        if (updateDeadlineCalendar) {
            await fetchEvents(deps.deadlinesCalendarId, EEventType.Deadline);
        }

        lastFetchedTime = newFetchedTime;

        return rawEvents;
    }

    const commitCachedEventsIds = (): void => {
        pendingToCacheEventsIds.forEach(id => cachedEventsIds.add(id));
        pendingToCacheEventsIds.clear();
    }

    return { getGoogleCalendarEvents, commitCachedEventsIds }
}