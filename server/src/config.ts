
export const config = {
  port: 3001,
  redisUrl: "redis://localhost:6379/",
  elasticSearchUrl: "http://localhost:9200",
  indexBlacklist: [
    /[^e][^n]\.wikipedia.org/,
    /archive\.org/,
    /\.(pdf|jpg|jpeg|png|gif|exe|zip|dmg|mp3|mov)(\?.+)?$/
  ],
  indexBaseSoftBlacklist: [
    /wikipedia\.org/
  ],
  softBlacklistRestore: 60, // how often to restore the soft blacklist to indexBaseSoftBlacklist (in seconds)
  numberOfCrawlerThreads: 60
};
