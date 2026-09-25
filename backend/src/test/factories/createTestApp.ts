import { createMockServices } from "./createMockServices";
import express from "express";
import { createTimelineRouter } from "../../routes/timeline/timeline";
import { createLocalesRouter } from "../../routes/locales/locales";

export const createTestApp = (serviceOverrides?: Partial<any>) => {
    const services = createMockServices(serviceOverrides);
    const app = express();

    app.use("/api/timeline", createTimelineRouter(
        services.notionService,
        services.googleCalendarService,
        services.nagerService,
        services.localizationService
    ));

    app.use("/api/locales", createLocalesRouter(
        services.localizationService
    ));

    return { app, ...services };
}
