import { EEventState, EEventType, IEvent } from '@shared/types/event';
import { IRawEvent } from '../types/events.types';
import { config } from '../config';

export const getGoogleCalendarEvents = async (year: number, month: number): Promise<IRawEvent[]> => {
    const rawEvents: IRawEvent[] = [];

    const fetchEvents = async (calendarId: string, eventType: EEventType) => {
        const apiUrl = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`;
        const params = new URLSearchParams({
            key: config.googleCalendar.apiKey,
            timeMin: new Date(year, month).toISOString(),
            timeMax: new Date(year, month + 1).toISOString()
        });
        const response = await fetch(`${apiUrl}?${params.toString()}`);

        const data = await response.json();

        if (!data.items) return;

        data.items.forEach((item: any) => {
            if (!item.summary)
            {
                return;
            }

            const eventEng: string = item.summary
            const eventRu: string = item.description ?? eventEng

            // if there is a time the date is for a day
            if (item.start.dateTime) {
                const eventStart: Date = new Date(item.start.dateTime)
                const eventState: EEventState = EEventState.Single
                const newEvent: IEvent = { eventEng, eventRu, type: eventType, state: eventState }
                const date = eventStart.toLocaleDateString();
                rawEvents.push({ date, event: newEvent });
            }
            // if event is going for days we need to add every day into the map
            else if (item.start.date) {
                const eventStart = new Date(item.start.date)
                // event end is exclusive
                const eventEnd = new Date(item.end.date)

                eventEnd.setDate(eventEnd.getDate() - 1)

                const eventState: EEventState = eventStart.toDateString() === eventEnd.toDateString() ? EEventState.Single : EEventState.Start
                const newEvent: IEvent = { eventEng, eventRu, type: eventType, state: eventState }
                const date = eventStart.toLocaleDateString()
                rawEvents.push({ date, event: newEvent });

                //if the start end end are the same then it is a single event, no need to make everything else
                if (eventStart.toDateString() === eventEnd.toDateString()) {
                    return
                }

                let d: Date = eventStart
                d.setDate(d.getDate() + 1)
                while (d.toDateString() != eventEnd.toDateString()) {
                    const middleEvent = { eventEng, eventRu, type: eventType, state: EEventState.Middle }
                    rawEvents.push({ date: d.toLocaleDateString(), event: middleEvent })
                    d.setDate(d.getDate() + 1)
                }

                const finalEvent = { eventEng, eventRu, type: eventType, state: EEventState.End }
                rawEvents.push({ date: d.toLocaleDateString(), event: finalEvent })
            }
        })
    }

    await fetchEvents(config.googleCalendar.commonCalendarId, EEventType.Common);
    await fetchEvents(config.googleCalendar.deadlinesCalendarId, EEventType.Deadline);

    return rawEvents;
}
