//
// https://github.com/angular/dgeni-packages/blob/3cadfff5593b32671e7c20a5d253f8d8cefd7a9f/jsdoc/services/transforms/extract-name.js
//

var _ = require('lodash');

// Matches:
// name, [name], [name=default], name text, [name] text, [name=default] text, name - text, [name] - text or [name=default] - text
var NAME_AND_DESCRIPTION = /^\s*(\[([^\]=]+)(?:=([^\]]+))?\]|\S+)((?:[ \t]*\-\s*|\s+)(\S[\s\S]*))?\s*$/;

/**
 * Extract the name information from a tag
 */
module.exports = function extractNameTransform(value) {
  var res = {};

  res.next = value.replace(NAME_AND_DESCRIPTION, function (match, name, optionalName, defaultValue, description, dashDescription) {
    res.name = optionalName || name;

    if (optionalName) {
      res.optional = true;
    }

    if (defaultValue) {
      res.defaultValue = defaultValue;
    }

    var aliasParts = res.name.split('|');
    res.name = aliasParts[0];
    res.alias = aliasParts[1];

    return dashDescription || description || '';
  });

  return res;

};
