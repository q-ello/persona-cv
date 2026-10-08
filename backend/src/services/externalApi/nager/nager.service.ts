import { EEventState, EEventType, IHoliday } from '@cv/shared';
import { IRawEvent } from '../../../types/events.types';

export const createNagerService = (fetchFn: typeof fetch) => {
    async function getHolidays(year: number): Promise<IHoliday[]> {
        const res = await fetchFn(`https://date.nager.at/api/v3/PublicHolidays/${year}/RU`);
        const holidays = await res.json();
        return holidays;
    }

    const getHolidaysEvents = async (startDate: Date, endDate: Date): Promise<IRawEvent[]> => {
        const years = [];
        for (let i = startDate.getFullYear(); i <= endDate.getFullYear(); i++) {
            years.push(i);
        }

        const holidaysByYear = await Promise.all(years.map(year => getHolidays(year)));

        if (!holidaysByYear) return [];

        const allEvents: IRawEvent[] = [];

        holidaysByYear.forEach(holidays => {
            const events: IRawEvent[] = (holidays.map((item: IHoliday) => {
                const eventEng: string = item.name;
                const eventRu: string = item.localName ?? eventEng;
                const event: IRawEvent = { date: item.date, eventEng, eventRu, type: EEventType.Holiday, state: EEventState.Single }

                return event;
            })).filter((event: IRawEvent | null): event is IRawEvent => event !== null);

            allEvents.push(...events);
        })

        return allEvents;
    };

    return { getHolidaysEvents };
}