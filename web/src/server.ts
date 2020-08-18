import axios from "axios";
import {IWebpageSearchResult} from "./types";

const serverUrl = "http://localhost:3001";
// const serverUrl = "http://home.jyelewis.com:3001";
// const serverUrl = ":3001";

export async function search(textQuery: string): Promise<IWebpageSearchResult[]> {
  const res = await axios.get(serverUrl + "/search", {
    params: {
      q: textQuery
    }
  });

  return res.data;
}
