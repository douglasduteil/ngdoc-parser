//
// https://github.com/angular/dgeni-packages/blob/3cadfff5593b32671e7c20a5d253f8d8cefd7a9f/jsdoc/services/transforms/extract-type.js
//


var catharsis = require('catharsis');
var util = require('util');

var TYPE_EXPRESSION_START = /\{[^@]/;


/** @private */
function getTypeStrings(parsedType) {
  var types = [];

  var TYPES = catharsis.Types;

  switch (parsedType.type) {
    case TYPES.AllLiteral:
      types.push('*');
      break;
    case TYPES.FunctionType:
      types.push(catharsis.stringify(parsedType));
      break;
    case TYPES.NameExpression:
      types.push(parsedType.name);
      break;
    case TYPES.NullLiteral:
      types.push('null');
      break;
    case TYPES.RecordType:
      types.push('Object');
      break;
    case TYPES.TypeApplication:
      types.push(catharsis.stringify(parsedType));
      break;
    case TYPES.TypeUnion:
      parsedType.elements.forEach(function (element) {
        types = types.concat(getTypeStrings(element));
      });
      break;
    case TYPES.UndefinedLiteral:
      types.push('undefined');
      break;
    case TYPES.UnknownLiteral:
      types.push('?');
      break;
    default:
      // this shouldn't happen
      throw new Error(util.format('unrecognized type %s in parsed type: %j', parsedType.type, parsedType));
  }

  return types;
}

/**
 * @typedef {Object} typeExtractionResult
 * @property {string} next The rest of the text to process
 * @property {string} typeExpression The type expression that was parsed.
 * @property {string} type The type of the param/propriety/return
 * @property {array} typeList The list of type for the param/propriety/return
 * @property {boolean} optional True is the result type is optional
 */

/**
 * Extract a type expression from the tag text.
 * @module {extractTypeTransform}
 * @param {string} value The text to process
 * @returns {typeExtractionResult} The extraction result
 */
module.exports = function extractTypeTransform(value) {
  var start, position, count, length;
  var res = {};

  start = value.search(TYPE_EXPRESSION_START);
  length = value.length;
  if (start !== -1) {
    // advance to the first character in the type expression
    position = start + 1;
    count = 1;

    while (position < length) {
      switch (value[position]) {
        case '\\':
          // backslash is an escape character, so skip the next character
          position++;
          break;
        case '{':
          count++;
          break;
        case '}':
          count--;
          break;
        default:
        // do nothing
      }

      if (count === 0) {
        break;
      }
      position++;
    }

    res.typeExpression = value.slice(start + 1, position).trim().replace('\\}', '}').replace('\\{', '{');

    res.type = catharsis.parse(res.typeExpression, {jsdoc: true});
    res.typeList = getTypeStrings(res.type);
    if (res.type.optional) {
      res.optional = true;
    }
    res.next = (value.substring(0, start) + value.substring(position + 1)).trim();

    return res;
  } else {
    return value;
  }


};
