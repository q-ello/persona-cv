import { IRawEvent } from "../../../types/events.types";
import { createNagerService } from "./nager.service";

const describeIntegration = process.env.RUN_INTEGRATION_TESTS === "true" ? describe : describe.skip;

export const checkRawEventData = (result: IRawEvent[]) =>
{
    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toHaveProperty("date");
    expect(result[0]).toHaveProperty("eventEng");
    expect(result[0]).toHaveProperty("eventRu");
    expect(result[0]).toHaveProperty("state");
    expect(result[0]).toHaveProperty("type");
}

describeIntegration('Nager Integration', () => {
    it('fetches real holidays data', async () => {
        const service = createNagerService(fetch);

        const result = await service.getHolidaysEvents(2024); // January 2024
        checkRawEventData(result);
    });
});
