import { createNagerService } from "./nager.service";

describe('Nager Integration', () => {
    it('fetches real holidays data', async () => {
        const service = createNagerService(fetch);

        const result = await service.getHolidaysEvents(2024, 0); // January 2024
        expect(Array.isArray(result)).toBe(true);
        expect(result[0]).toHaveProperty("date");
        expect(result[0]).toHaveProperty("event");
    });
});