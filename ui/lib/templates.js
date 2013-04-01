var templates = require('./gen/templates.js');

module.exports.build = function(path, vars) {
  return templates[path] && $(templates[path](vars));
}