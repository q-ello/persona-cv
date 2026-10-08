import { EEventState, EEventType, getGeneralString, IHoliday } from '@cv/shared';
import { IRawEvent } from '../../../types/events.types';

export const createNagerService = (fetchFn: typeof fetch) => {
    const holidaysCache = new Map<number, Promise<IHoliday[]>>();

    const getHolidays = async (year: number): Promise<IHoliday[]> => {
        const cached = holidaysCache.get(year);
        if (cached) return cached;

        const request = fetchHolidays(year);
        holidaysCache.set(year, request);
        void request.catch(() => holidaysCache.delete(year));
        return request;
    }

    const fetchHolidays = async (year: number): Promise<IHoliday[]> => {
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

    const isHoliday = (value: unknown): value is IHoliday => {
        if (typeof value !== 'object' || value === null) return false;
        return 'date' in value && typeof value.date === 'string'
            && 'name' in value && typeof value.name === 'string'
            && (!('localName' in value) || value.localName == null || typeof value.localName === 'string');
    }

    const getHolidaysEvents = async (startYear: number, endYear?: number): Promise<IRawEvent[]> => {
        const years = [];

        if (endYear !== undefined) {
            for (let i = startYear; i <= endYear; i++) {
                years.push(i);
            }
        } else {
            years.push(startYear);
        }

        const holidaysByYear = await Promise.all(years.map(year => getHolidays(year)));

        const allEvents: IRawEvent[] = [];

        holidaysByYear.forEach(holidays => {
            const events: IRawEvent[] = holidays
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

    const hasFetchedYear = (year: number): boolean => {
        return holidaysCache.has(year);
    }

    return { getHolidaysEvents, hasFetchedYear };
}
