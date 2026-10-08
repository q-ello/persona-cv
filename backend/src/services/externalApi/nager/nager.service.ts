import { EEventState, EEventType, getGeneralString, IHoliday } from '@cv/shared';
import { IRawEvent } from '../../../types/events.types';

export const createNagerService = (fetchFn: typeof fetch) => {
    const holidaysCache = new Map<number, Promise<IHoliday[]>>();

    async function getHolidays(year: number): Promise<IHoliday[]> {
        const cached = holidaysCache.get(year);
        if (cached) return cached;

        const request = fetchHolidays(year);
        holidaysCache.set(year, request);
        void request.catch(() => holidaysCache.delete(year));
        return request;
    }

    async function fetchHolidays(year: number): Promise<IHoliday[]> {
        const res = await fetchFn(`https://date.nager.at/api/v3/PublicHolidays/${year}/RU`);
        if (!res.ok) {
            throw new Error(`Nager request failed for ${year}: HTTP ${res.status}`);
        }

        const holidays: unknown = await res.json();
        if (!Array.isArray(holidays) || !holidays.every(isHoliday)) {
            throw new Error(`Invalid Nager response for ${year}: expected a holidays array`);
        }
        return holidays;
    }

    function isHoliday(value: unknown): value is IHoliday {
        if (typeof value !== 'object' || value === null) return false;
        return 'date' in value && typeof value.date === 'string'
            && 'name' in value && typeof value.name === 'string'
            && (!('localName' in value) || value.localName == null || typeof value.localName === 'string');
    }

    const getHolidaysEvents = async (startDate: Date, endDate: Date): Promise<IRawEvent[]> => {
        const years = [];
        for (let i = startDate.getFullYear(); i <= endDate.getFullYear(); i++) {
            years.push(i);
        }

        const holidaysByYear = await Promise.all(years.map(year => getHolidays(year)));

        const allEvents: IRawEvent[] = [];
        const startDateString = getGeneralString(startDate);
        const endDateString = getGeneralString(endDate);

        holidaysByYear.forEach(holidays => {
            const events: IRawEvent[] = holidays
                .filter(item => item.date >= startDateString && item.date < endDateString)
                .map((item: IHoliday) => {
                const eventEng: string = item.name;
                const eventRu: string = item.localName ?? eventEng;
                const event: IRawEvent = { date: item.date, eventEng, eventRu, type: EEventType.Holiday, state: EEventState.Single }

                return event;
            });

            allEvents.push(...events);
        })

        return allEvents;
    };

    return { getHolidaysEvents };
}
