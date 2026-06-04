import { createMockServices } from "./createMockServices";
import express from "express";
import { createTimelineRouter } from "../../routes/timeline";

export const createTestApp = (serviceOverrides?: Partial<any>) => {
    const services = createMockServices(serviceOverrides);
    const app = express();

    app.use("/api/timeline", createTimelineRouter(
        services.notionService,
        services.googleCalendarService,
        services.nagerService,
        services.localizationService
    ));

    return { app, ...services };
}
