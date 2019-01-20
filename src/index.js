import http from "http";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import bodyParser from "body-parser";
import Agenda from "agenda";
import axios from "axios";
import initializeDb from "./db";
import middleware from "./middleware";
import api from "./api";
import models from "./models";
import { initializeJobs } from "./jobs/index";
import notifier from "./api/notifier";
import config from "./config.json";

let agenda = initializeJobs(
  Agenda,
  axios,
  models.httpModel,
  models.configModel,
  notifier
);

let app = express();
app.server = http.createServer(app);

// logger
app.use(morgan("dev"));

// 3rd party middleware
app.use(
  cors({
    exposedHeaders: config.corsHeaders
  })
);

app.use(
  bodyParser.json({
    limit: config.bodyLimit
  })
);

// connect to db
initializeDb(db => {
  // internal middleware
  app.use(middleware({ config, db }));

  // api router
  app.use("/api", api({ config, db, models, agenda, notifier }));

  app.server.listen(process.env.PORT || config.port, () => {
    console.log(`Started on port ${app.server.address().port}`);
  });
});

export default app;
