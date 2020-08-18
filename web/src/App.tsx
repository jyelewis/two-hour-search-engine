import React, {useCallback, useEffect, useRef, useState} from "react";
import './App.scss';
import { ResultItem } from './components/ResultItem';
import {IWebpageSearchResult} from "./types";
import {search} from "./server";

const dummyResult: IWebpageSearchResult = {
  title: "Hello world!",
  url: "https://eonin.io/",
  previewText: "Hello, this is some <i>preview text</i>. It may go over multiple lines"
};

function App() {
  const [isFull, setIsFull] = useState<boolean>(true);
  const [searchResults, setSearchResults] = useState<null | IWebpageSearchResult[]>(null);
  const [searchText, setSearchText] = useState<string>("");

  const latestSearchText = useRef<string>("");
  latestSearchText.current = searchText;

  const handleSearchTextUpdate = useCallback((e: any) => {
    const newSearchText = e.target.value;
    setSearchText(newSearchText);

    if (newSearchText === "") {
      setIsFull(false);
      setSearchResults(null);
      return;
    }

    if (newSearchText.length >= 3) {
      (async () => {
        const searchResults = await search(newSearchText);
        if (newSearchText !== latestSearchText.current) {
          return; // search changed since we sent off this request, ignore the response
        }
        setSearchResults(searchResults);
        setIsFull(true);
      })().catch(console.error);
    }
  }, []);

  useEffect(() => {
    // make request, get results
    if (searchText.length >= 3 && isFull) {
      setIsFull(false);
    }

    if (searchText.length === 0 && !isFull) {
      setIsFull(true);
    }
  }, [searchText, isFull]);

  return (
    <div className={"App" + (isFull ? " full" : "")}>
      <div id="search-header">
        <div id="logo">&nbsp;</div>
        <div id="searchInputContainer">
          <input type="text" id="searchInput" placeholder="Search" value={searchText} onChange={handleSearchTextUpdate} />
        </div>
        <div id="statsContainer">

        </div>
      </div>

      <div id="searchResults">
        {
          searchResults && searchResults.map(result =>
            <ResultItem result={result} />
          )
        }
        {
          searchResults !== null && searchResults.length === 0 &&
          <div className="no-results">No results found for '{searchText}' 😭</div>
        }
        {
          searchResults === null &&
          <div>Loading</div>
        }
      </div>
    </div>
  );
}

export default App;
