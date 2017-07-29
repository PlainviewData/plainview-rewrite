const jsonUpdate = require('json-update');
const path = require('path');
const USER_AGENT = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.78 Safari/537.36";
jsonUpdate.update(path.join(__dirname, './node_modules/noodlejs/lib/config.json'), {"userAgent": USER_AGENT})
