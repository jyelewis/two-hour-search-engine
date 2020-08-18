
// e.g. "https://eonin.io/hello-world?test=1" -> "https://eonin.io"
// returns null if the url is not a valid http uri
export function getBaseUrl(url) {
  // match URL up to, but not including, the first slash, enforce http/s only
  // https?:\/\/([^\/]+)
  const result = /(https?:\/\/[^\/]+)/.exec(url);
  if (!result) {
    return null;
  }

  return result[1]; // capture group 1 is the base url
}

// "https://eonin.io/hello-world?test=1" -> "https://eonin.io/hello-world"
// "/hello-world?test=1" -> "https://eonin.io/hello-world"
// returns null if the url is not a valid http uri
export function getAbsoluteUrl(baseUrl, fromUrl, url) {
  if (!url) {
    return null; // no url (likely no href)
  }
  if (url === "") {
    return null; // invalid url
  }
  if (url.startsWith("#")) {
    return null; // invalid url
  }

  // remove any hash value from url
  url = url.split("#")[0];

  if (url.startsWith("javascript")) {
    return null; // invalid url
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    // direct url
    return url;
  }

  if (url.startsWith("//")) {
    // direct url, copy parent protocol
    return baseUrl.split("//")[0] + url;
  }

  if (url.startsWith("/")) {
    // absolute url
    return (baseUrl + url)
  }

  // assume relative url
  return ((fromUrl.split("?")[0].split("#")[0]) + url);
}

