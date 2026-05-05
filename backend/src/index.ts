import dotenv from "dotenv";
import express from "express";
import {config, loadConfig} from "./config";
import Client from "@notionhq/client/build/src/Client";
import { createNotionService } from "./services/notion.service";
import { createTimelineRouter } from "./routes/timeline";
import { createGoogleCalendarService } from "./services/googleCalendar.service";
import { createNagerService } from "./services/nager.service";
import cors from "cors";

dotenv.config();
loadConfig();

const notionClient = new Client({ auth: config.notion.secret });
const notionService = createNotionService(notionClient, config.notion);
const googleCalendarService = createGoogleCalendarService(config.googleCalendar, fetch);
const nagerService = createNagerService(fetch);

const app = express();
const PORT = 3001;

app.use(cors({
  origin: "http://localhost:5173",
}));

app.use("/api/timeline", createTimelineRouter(notionService, googleCalendarService, nagerService));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
