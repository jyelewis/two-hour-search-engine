import {Client} from "@elastic/elasticsearch";
import {config} from "../config";
import {IWebpageSearchResult} from "../types";

const client = new Client({node: config.elasticSearchUrl});

export async function initElasticIndexes() {
  try {
    await client.indices.create({
      index: "webpages",
      body: {
        mappings: {
          properties: {
            pageText: {
              type: "text"
            },
            title: {
              type: "text"
            },
            url: {
              type: "text"
            }
          }
        }
      }
    });
    console.log("Created new indexes");
  } catch (e) {
    console.log("Did not create indexes, they likely already exist");
  }
}

export async function addWebpageToIndex(url: string, title: string, pageText: string) {
  await client.index({
    index: "webpages",
    body: {
      url,
      title,
      pageText
    }
  });
}

export async function search(searchText: string): Promise<IWebpageSearchResult[]> {
  const elasticResults = await client.search({
    index: "webpages",
    body: {
      "_source": ["url", "title"],
      "query": {
        "multi_match" : {
          "query": searchText,
          "fields": ["title^5", "url^3", "pageText"] // title is worth 5 times more than page text
        }
      },
      "highlight": {
        "fields": {
          "pageText": {}
        }
      }
    }
  });

  const results = elasticResults.body.hits.hits.map(hit => ({
    url: hit._source.url,
    title: hit._source.title,
    previewText: hit.highlight ? hit.highlight.pageText.join(". ") : ""
  }));
  return results;
}
