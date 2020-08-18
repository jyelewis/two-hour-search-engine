import {initElasticIndexes, search} from "./integration/elasticsearch";
import * as express from "express";
import {config} from "./config";
import * as helmet from "helmet";
import * as cors from "cors";

async function bootstrapServer() {
  console.log("Hello world! for server");

  // bootstrap
  await initElasticIndexes();

  // start api server
  const app = express();

  app.use(cors());
  app.use(helmet());

  app.get('/search', (req, res) => {
    const searchText = req.query["q"];
    if (!searchText) {
      res.send("No q provided");
      return;
    }

    (async () => {
      const searchResults = await search(searchText);
      res.send(searchResults);
    })().catch(console.error);
  });

  app.listen(config.port, () => {
    console.log(`Api server listening at http://localhost:${config.port}`);
  });
}


bootstrapServer().catch(console.error);
