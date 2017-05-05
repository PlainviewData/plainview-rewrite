const DEFAULT_OPTIONS = {
  'ignore_article_min_time_passed': function(b){ //ignores minimum time to check for article revision
    if (typeof b !== 'boolean') return true;
    return b || false;
  },
  'post_to_archive_is': function(b){
    if (typeof b !== 'boolean') return true;
    return b && true;
  }
}

var sanitizeOptions = function(options){
  options = options || {};
  for (key in DEFAULT_OPTIONS) options[key] = DEFAULT_OPTIONS[key](options[key]);
  return options;
};

var sanitizeUrl = function(url){
  return url;
};

var sanitizeQuote = function(quote){
  return quote;
};

module.exports = {
  sanitizePostRequestBody : function(body){
    body = body || {};
    body.url = sanitizeUrl(body.url);
    body.quote = sanitizeQuote(body.quote);
    body.options = sanitizeOptions(body.options);
    return body;
  }
};
