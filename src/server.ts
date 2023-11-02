// src/crawler.ts
import express from "express";
import cors from "cors";
import { Cluster } from "puppeteer-cluster";
import { crawlWebsite } from "./crawler";

const app = express();
const port = process.env.PORT || 3000;
const MAX_CONCURRENT_CRAWLERS = 10;

/* PUPPTR */
(async () => {
  // Create a cluster with 2 workers
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: MAX_CONCURRENT_CRAWLERS,
    puppeteerOptions: { headless: "new", args: ["--no-sandbox"] },
  });

  // Define a task
  await cluster.task(async ({ page, data: url }) => {
    const content = await crawlWebsite(page, url);
    return content;
  });

  /* EXPRESS */
  // Express middleware
  const corsOptions = {
    origin: "https://service-broker-aaf4c0b60b14.herokuapp.com",
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  };
  app.use(cors(corsOptions));
  app.get("/scrape", async (req, res) => {
    if (!req.query.url) {
      return res.end("Please specify url like this: ?url=example.com");
    }
    try {
      const content = await cluster.execute(req.query.url);

      // respond with image
      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Length": content.length,
      });
      res.end(content);
    } catch (err) {
      // catch error
      res.end("Error: " + (err as Error).message);
    }
  });

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
})();
