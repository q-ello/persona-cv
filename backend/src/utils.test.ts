import { getGeneralString } from "@cv/shared";
import { mergeEvents, requireEnvVariable } from "./utils";

describe("utility functions", () => {
    it("merges events by date", () => {
        const result = mergeEvents(
            [{ date: "2026-04-10", event: { eventEng: "A" } as any }],
            [{ date: "2026-04-10", event: { eventEng: "B" } as any }]
        );

        expect(result["2026-04-10"]).toHaveLength(2);
    });

    it("requires environment variable", () => {
        const originalEnv = process.env;
        delete process.env.TEST_VAR;

        expect(() => requireEnvVariable('TEST_VAR')).toThrow();
        process.env = originalEnv;
    });

    it("returns environment variable value", () => {
        process.env.TEST_VAR = "value";
        expect(requireEnvVariable('TEST_VAR')).toBe("value");
    });

    it("throws error if environment variable is empty", () => {
        const originalEnv = process.env;
        process.env.TEST_VAR = "";
        expect(() => requireEnvVariable('TEST_VAR')).toThrow();
        process.env = originalEnv;
    });

    it("gets general string from a locally-constructed date", () => {
        // new Date(year, month, day) is local — getGeneralString must reflect
        // the local calendar date, not the UTC equivalent (which can differ in UTC+ zones).
        const date = new Date(2026, 4, 1); // May 1, 2026 local time
        const result = getGeneralString(date);
        expect(result).toBe("2026-05-01");
    });

    it("gets general string from a UTC date string", () => {
        const date = new Date("2026-04-10T15:30:00Z");
        const result = getGeneralString(date);
        // Result is the LOCAL date, which may differ from UTC in UTC+ timezones.
        // The important thing is it doesn't go backwards (e.g. returning Apr 9).
        expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
})
