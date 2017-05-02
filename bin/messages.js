module.exports = {
  INVALID_ID: {description: "Invalid id", status: 400},
  INVALID_URL: {description: "Invalid url", status: 400},
  INVALID_QUOTE: {description: "Invalid quote", status: 400},
  COULD_NOT_FIND_QUOTE: {description: "Could not find quote", status: 400},
  UNSUPPORTED_WEBSITE: {description: "Website not supported", status: 400},
  COULD_NOT_FIND_ARTICLE: {description: "Could not find article", status: 404},
  COULD_NOT_FIND_ARCHIVE: {description: "Could not find archive", status: 404},
  COULD_NOT_GET_ARTICLE_INFO: {description: "Could not get article info", status: 500},
  GENERIC_SERVER_ERROR: {description: "Internal server error", status: 500}
};
