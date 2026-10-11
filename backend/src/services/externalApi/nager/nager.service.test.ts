import { EEventState, EEventType } from '@cv/shared';
import { createDeferred } from '../../../test/utils/createDeferred';
import { createFetchResponse } from '../../../test/utils/createFetchMock';
import { createNagerTestService } from './nager.service.factory';

describe('Nager holiday cache', () => {
    it('returns the whole year, preserving dates and both translations', async () => {
        const { service, fetchMock } = createNagerTestService({ json: [
            { date: '2026-01-01', name: 'New Year', localName: 'Новый год' },
            { date: '2026-05-01', name: 'Labour Day', localName: 'Праздник труда' },
            { date: '2026-12-31', name: 'Year End', localName: 'Конец года' },
        ] });

        expect(await service.getHolidaysEvents(2026)).toEqual([
            { date: '2026-01-01', eventEng: 'New Year', eventRu: 'Новый год', type: EEventType.Holiday, state: EEventState.Single },
            { date: '2026-05-01', eventEng: 'Labour Day', eventRu: 'Праздник труда', type: EEventType.Holiday, state: EEventState.Single },
            { date: '2026-12-31', eventEng: 'Year End', eventRu: 'Конец года', type: EEventType.Holiday, state: EEventState.Single },
        ]);
        expect(fetchMock).toHaveBeenCalledWith('https://date.nager.at/api/v3/PublicHolidays/2026/RU');
        expect(service.hasFetchedYear(2026)).toBe(true);
        expect(service.hasFetchedYear(2027)).toBe(false);
    });

    it.each([undefined, null])('falls back to English when localName is %s', async localName => {
        const { service } = createNagerTestService({ json: [{ date: '2026-01-01', name: 'New Year', localName }] });

        expect(await service.getHolidaysEvents(2026)).toEqual([
            { date: '2026-01-01', eventEng: 'New Year', eventRu: 'New Year', type: EEventType.Holiday, state: EEventState.Single },
        ]);
    });

    it('loads an inclusive year range and fetches only missing years on overlap', async () => {
        const { service, fetchMock } = createNagerTestService({ json: [] });
        fetchMock.mockImplementation(async (input: string) => {
            const year = new URL(input).pathname.split('/').at(-2);
            return createFetchResponse({ json: [{ date: `${year}-01-01`, name: 'New Year' }] });
        });

        expect((await service.getHolidaysEvents(2024, 2026)).map(event => event.date)).toEqual([
            '2024-01-01', '2025-01-01', '2026-01-01',
        ]);
        expect((await service.getHolidaysEvents(2025, 2027)).map(event => event.date)).toEqual([
            '2025-01-01', '2026-01-01', '2027-01-01',
        ]);
        expect(fetchMock).toHaveBeenCalledTimes(4);
        expect(fetchMock.mock.calls.map(([input]) => new URL(input).pathname.split('/').at(-2)))
            .toEqual(['2024', '2025', '2026', '2027']);
    });

    it('shares the request for a year across concurrent callers', async () => {
        const { service, fetchMock } = createNagerTestService({ json: [] });
        const request = createDeferred<ReturnType<typeof createFetchResponse>>();
        fetchMock.mockReturnValueOnce(request.promise);

        const first = service.getHolidaysEvents(2027);
        const second = service.getHolidaysEvents(2027);
        expect(fetchMock).toHaveBeenCalledTimes(1);
        request.resolve(createFetchResponse({ json: [{ date: '2027-01-01', name: 'New Year' }] }));

        const [firstEvents, secondEvents] = await Promise.all([first, second]);
        expect(firstEvents).toHaveLength(1);
        expect(secondEvents).toEqual(firstEvents);
    });

    it('keeps an empty year cached instead of requesting it again', async () => {
        const { service, fetchMock } = createNagerTestService({ json: [] });

        await expect(service.getHolidaysEvents(2027)).resolves.toEqual([]);
        await expect(service.getHolidaysEvents(2027)).resolves.toEqual([]);
        expect(service.hasFetchedYear(2027)).toBe(true);
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('rejects HTTP errors and allows the year to be retried', async () => {
        const { service, fetchMock } = createNagerTestService({ json: [] });
        fetchMock.mockResolvedValueOnce(createFetchResponse({ ok: false, status: 429 }));

        await expect(service.getHolidaysEvents(2027)).rejects.toThrow('Nager request failed for 2027: HTTP 429');
        expect(service.hasFetchedYear(2027)).toBe(false);
        await expect(service.getHolidaysEvents(2027)).resolves.toEqual([]);
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it.each([
        {}, [null], [{ date: '2027-01-01' }],
        [{ date: 2027, name: 'New Year' }],
        [{ date: '2027-01-01', name: 'New Year', localName: 123 }],
    ].map(json => ({ json })))('rejects malformed data and does not cache it: %j', async ({ json }) => {
        const { service, fetchMock } = createNagerTestService({ json: [] });
        fetchMock.mockResolvedValueOnce(createFetchResponse({ json }));

        await expect(service.getHolidaysEvents(2027)).rejects.toThrow('Invalid Nager response for 2027');
        expect(service.hasFetchedYear(2027)).toBe(false);
        await expect(service.getHolidaysEvents(2027)).resolves.toEqual([]);
    });

    it('retries network failures without refetching successful years', async () => {
        const { service, fetchMock } = createNagerTestService({ json: [] });
        await service.getHolidaysEvents(2026);
        fetchMock.mockRejectedValueOnce(new Error('Unavailable'));

        await expect(service.getHolidaysEvents(2026, 2027)).rejects.toThrow('Unavailable');
        expect(service.hasFetchedYear(2026)).toBe(true);
        expect(service.hasFetchedYear(2027)).toBe(false);
        await expect(service.getHolidaysEvents(2026, 2027)).resolves.toEqual([]);
        expect(fetchMock.mock.calls.map(([input]) => new URL(input).pathname.split('/').at(-2)))
            .toEqual(['2026', '2027', '2027']);
    });
});
