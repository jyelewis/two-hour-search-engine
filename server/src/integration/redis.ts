import { RedisClient, createClient } from "redis";
import { promisify } from "util";
import {config} from "../config";

const redisClient = createClient(config.redisUrl);

// async functions
const sadd = promisify(redisClient.sadd).bind(redisClient);
const spop = promisify(redisClient.spop).bind(redisClient);
const scard = promisify(redisClient.scard).bind(redisClient);
const sismember = promisify(redisClient.sismember).bind(redisClient);

// set constants
const SEEN_URLS = "SEEN_URLS";
const PENDING_INDEX_URLS = "PENDING_INDEX_URLS";

export function markUrlPendingIndex(url: string): void {
  (async () => {
    // ignore errors

    // check if this has already been seen! if so, don't index
    if (await sismember(SEEN_URLS, url)) {
      // already seen this url, bail
      return;
    }

    // mark as seen
    sadd(SEEN_URLS, url);

    // mark as pending
    sadd(PENDING_INDEX_URLS, url);

  })().catch(console.error);
}

export async function getRandomUrlPendingIndex(): Promise<null | string> {
  // get random url from index (and remove it in the process)
  return await spop(PENDING_INDEX_URLS);
}

export async function getNumberOfItemsPendingIndex(): Promise<number> {
  return await scard(PENDING_INDEX_URLS);
}
