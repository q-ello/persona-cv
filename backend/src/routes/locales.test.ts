import { createTestApp } from "../test/factories/createTestApp";
import request from "supertest";

describe("/locales route", () => {
    it("reloads localization data", async () => {
        const reloadMock = jest.fn().mockResolvedValue([]);
        
        const {app} = createTestApp({
            localizationService: {reload: reloadMock}
        });

        const response = await request(app).get("/api/locales");

        expect(response.status).toBe(200);
        expect(reloadMock).toHaveBeenCalled();
    });
});