import dotenv from "dotenv";
import express from "express";
import {config, loadConfig} from "./config";
import Client from "@notionhq/client/build/src/Client";
import { createTimelineRouter } from "./routes/timeline/timeline";
import { createGoogleCalendarService } from "./services/externalApi/googleCalendar/googleCalendar.service";
import cors from "cors";
import { createNotionService } from "./services/externalApi/notion/notion.service";
import { createNagerService } from "./services/externalApi/nager/nager.service";
import { createLocalesRouter } from "./routes/locales/locales";
import { createEventService } from "./services/dataConstructors/event/event.service";
import { createLocalizationService } from "./services/helpers/localization/localization.service";
import { Octokit } from "octokit";
import { createGithubService } from "./services/externalApi/github/github.service";
import { createDailyLogsService } from "./services/dataConstructors/dailyLogs/dailyLogs.service";
import { createDetailFormatterService } from "./services/helpers/detailFormatter/detailFormatter.service";

dotenv.config();
loadConfig();

//external apis
const notionClient = new Client({ auth: config.notion.secret });
const notionService = createNotionService(notionClient, config.notion);

const githubOctokit = new Octokit({auth: config.github.token});
const githubService = createGithubService(githubOctokit, config.github);

const googleCalendarService = createGoogleCalendarService(config.googleCalendar, fetch);
const nagerService = createNagerService(fetch);

//helpers
const localizationService = createLocalizationService(notionService);
localizationService.init();

const detailFormatterService = createDetailFormatterService(localizationService);

//data constructors
const eventService = createEventService(googleCalendarService, nagerService);
eventService.init();

const logService = createDailyLogsService([notionService], detailFormatterService);
logService.init();

const app = express();
const PORT = 3001;

app.use(cors({
  origin: "http://localhost:5173",
}));

app.use("/api/timeline", createTimelineRouter(notionService, eventService, localizationService, logService));
app.use("/api/locales", createLocalesRouter(localizationService));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
