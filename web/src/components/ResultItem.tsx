import * as React from "react";
import "./ResultItem.scss";
import { IWebpageSearchResult } from "../types";

export interface IResultItemProps {
  result: IWebpageSearchResult
}

export const ResultItem: React.FC<IResultItemProps> = ({ result }) => {
  return (
    <div className="component-ResultItem">
      <div className="title-container">
        <div className="title">{result.title}</div>
        <a href={result.url} target="_blank" rel="noopener noreferrer" className="url">{result.url}</a>
      </div>
      <div dangerouslySetInnerHTML={{ __html: result.previewText }} className="preview-text" />
    </div>
  );
};
