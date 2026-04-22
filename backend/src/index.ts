import dotenv from "dotenv";
import express from "express";
import timelineRoute from "./routes/timeline";
import {loadConfig} from "./config";
import { initNotionClient } from "./services/notion.service";

dotenv.config();
loadConfig();
initNotionClient();

const app = express();
const PORT = 3001;

app.use("/api/timeline", timelineRoute);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
