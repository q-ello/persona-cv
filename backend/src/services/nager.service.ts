import { EEventState, EEventType, getGeneralString, getMonthFromDateString, IEvent, IHoliday } from '@cv/shared';
import { IRawEvent } from '../types/events.types';

export const createNagerService = (fetchFn: typeof fetch) => {

    const holidaysCache = new Map<number, IHoliday[]>();

    async function getHolidays(year: number): Promise<IHoliday[]> {
        if (holidaysCache.has(year)) {
            return holidaysCache.get(year)!;
        }
        const res = await fetchFn(`https://date.nager.at/api/v3/PublicHolidays/${year}/RU`);
        const holidays = await res.json();
        holidaysCache.set(year, holidays);

        return holidays;
    }

    const getHolidaysEvents = async (year: number, month: number): Promise<IRawEvent[]> => {
        const holidays = await getHolidays(year);

        if (!holidays) return []

        const events: IRawEvent[] = (holidays.map((item: IHoliday) => {
            if (getMonthFromDateString(item.date) !== month + 1) {
                return null;
            }

            const eventEng: string = item.name;
            const eventRu: string = item.localName ?? eventEng;
            const date: string = item.date;
            const event: IEvent = { eventEng, eventRu, type: EEventType.Holiday, state: EEventState.Single }

            return { date, event };
        })).filter((event: IRawEvent | null): event is IRawEvent => event !== null);

        console.log(events)

        return events;
    };

    return { getHolidaysEvents };
}