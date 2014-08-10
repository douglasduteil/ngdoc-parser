//
// https://github.com/angular/dgeni-packages/blob/3cadfff5593b32671e7c20a5d253f8d8cefd7a9f/jsdoc/services/transforms/extract-name.js
//

// Matches:
// name, [name], [name=default], name text, [name] text, [name=default] text, name - text, [name] - text or [name=default] - text
var NAME_AND_DESCRIPTION = /^\s*(\[([^\]=]+)(?:=([^\]]+))?\]|\S+)((?:[ \t]*\-\s*|\s+)(\S[\s\S]*))?\s*$/;

/**
 * @typedef {Object} nameExtractionResult
 * @property {string} next The rest of the text to process
 * @property {string} name The name of the param/propriety
 * @property {boolean} optional True is the result name is optional
 * @property {string} defaultValue The param/propriety default value
 * @property {string} alias The param/propriety alias name
 */

/**
 * Extract the name information from a tag
 * @param {string} value The text to process
 * @returns {nameExtractionResult} The extraction result
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
