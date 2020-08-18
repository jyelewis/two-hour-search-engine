import {initElasticIndexes, addWebpageToIndex} from "./integration/elasticsearch";
import {getAbsoluteUrl, getBaseUrl} from "./helpers/url";
import { config } from "./config";
import {getRandomUrlPendingIndex, markUrlPendingIndex} from "./integration/redis";
import axios from "axios";
import * as cheerio from "cheerio";

let softBlacklist = config.indexBaseSoftBlacklist;
setInterval(() => {
  softBlacklist = config.indexBaseSoftBlacklist;
}, config.softBlacklistRestore * 1000);

// crawler functions
async function indexUrl(url: string): Promise<void> {
  const baseUrl = getBaseUrl(url);
  if (baseUrl === null) {
    // not a valid url
    console.error(`Invalid URL: '${url}'`);
    return;
  }

  // check if this url is blacklisted
  for (const blacklistCheck of config.indexBlacklist) {
    if (blacklistCheck.test(url)) {
      console.log(`URL '${url}' blacklisted, skipping`);
      return;
    }
  }

  for (const blacklistCheck of softBlacklist) {
    if (blacklistCheck.test(url)) {
      // console.log(`URL '${url}' soft blacklisted, deferring`);
      markUrlPendingIndex(url); // re-queue this url for indexing
      return;
    }
  }

  let $ = null;
  try {
    const req = await axios.request({
      method: "get",
      url
    });

    const html = req.data;
    $ = cheerio.load(html);
  } catch (e) {
    // 429 = too many requests, auto soft blacklist this site
    if (e && e.response && e.response.status === 429) {
      console.log("429 captured, soft blacklisting site");
      softBlacklist.push(
        new RegExp(baseUrl
          .replace(/https?:\/\//g, "")
          .replace(/\./g, "\\.")
        )
      );
      console.log(softBlacklist);

      // queue for re-try
      markUrlPendingIndex(url);
      return;
    }

    console.error(`Unable to index URL: '${url}'`);
    return;
  }

  // scrape out each link & add to index queue
  $("a").each((index, a) => {
    const absUrl = getAbsoluteUrl(baseUrl, url, $(a).attr("href"));
    if (absUrl === null) {
      // invalid url
      return;
    }

    markUrlPendingIndex(absUrl);
  });

  // submit page html to elasticsearch
  const pageTitle = $("title").text();
  const pageText = $("body").text();
  addWebpageToIndex(
    url, pageTitle, pageText
  ).catch(e => {
    // elastic has likely crashed - abort
    console.error(e);
    process.exit();
  }); // add to index in the background

  console.log("Added", url);
}

function crawlerThread() {
  // starts an async function, should never finish
  (async () => {
    while (1) {
      const urlToIndex = await getRandomUrlPendingIndex();
      if (urlToIndex === null) {
        // we have no urls pending index, sleep for 1 second then check again
        await new Promise(r => setTimeout(r, 1000));
        continue;
      }

      await indexUrl(urlToIndex);
    }
  })().catch(e => {
    console.error("Crawler thread crashed, restarting");
    console.error(e);
    crawlerThread();
  }).then(() => {
    console.error("Crawler thread finished??? this should never happen");
    crawlerThread();
  });
}

async function bootstrapCrawler() {
  console.log("Hello world! from crawler");

  // bootstrap
  await initElasticIndexes();

  // seed with some misc urls around the internet
  markUrlPendingIndex("https://eonin.io/");
  markUrlPendingIndex("https://www.apple.com/");
  markUrlPendingIndex("https://bunnings.com.au/");
  markUrlPendingIndex("https://stackexchange.com/questions?tab=hot");
  markUrlPendingIndex("https://en.wikipedia.org/wiki/Elon_Musk");
  markUrlPendingIndex("https://www.smh.com.au/");

  // start many crawler threads
  for (let i = 0; i < config.numberOfCrawlerThreads; i++) {
    crawlerThread();
  }
}


bootstrapCrawler().catch(console.error);
