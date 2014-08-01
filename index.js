'use strict';

//
// ngDocParser
// a ngDoc parser
// Inspired by the jsdoc parser of [dgeni-packages](https://github.com/angular/dgeni-packages)
//

var esprima = require('esprima');
var _ = require('lodash');
var through = require('through2');

var tagDefMap = require('./lib/jsdoc/tag-defs');

var LEADING_STAR = /^[^\S\r\n]*\*[^\S\n\r]?/gm;

/**
 * Inspired by https://github.com/angular/dgeni-packages/blob/master/jsdoc/file-readers/jsdoc.js
 */
module.exports = function ngDocParser(opts) {

  var defaults = {
    TAG_MARKER: /^\s*@(\S+)\s*(.*)$/,
    END_OF_LINE: /\r?\n/,
    START_TAG: '@ngdoc'
  };

  var options = _.assign({}, defaults, opts);

  return through.obj(function (chunk, enc, callback) {

    var parsingResult = esprima.parse(String(chunk.contents), {
      loc: true,
      range: true,
      comment: true
    });

    chunk.jsdoc = _(parsingResult.comments)
      .filter(function(comment) {
        comment.uncommentedValue = comment.value.replace(LEADING_STAR, '').trim();

        // To test for a jsdoc comment (i.e. starting with /** ), we need to check for a leading
        // star since the parser strips off the first "/*"
        // Don't treat block that don't start with @ngdoc
        return comment.type === 'Block' &&
          comment.value.charAt(0) === '*' &&
          comment.uncommentedValue.substr(0, options.START_TAG.length) === options.START_TAG;
      })

      .filter(function(comment) {
        return comment.value.charAt(0) === '*';
      })

      .map(function(comment) {

        var lines = comment.uncommentedValue.split(options.END_OF_LINE);
        var length = lines.length;
        var lineNumber = 0;
        var blockData = {};


        var line, match, tagDef, parsedData;


        /**
         * Inspired by https://github.com/angular/dgeni-packages/blob/master/jsdoc/file-readers/jsdoc.js
         */
        while(lineNumber < length) {
          line = lines[lineNumber];

          // We ignore tags if we are in a code block
          match = options.TAG_MARKER.exec(line);
          tagDef = match && tagDefMap[match[1]];
          if ( match && tagDef) {

            if (tagDef.multi){
              blockData[tagDef.docProperty] = (blockData[tagDef.docProperty]  || {});
              parsedData = tagDef.parse(match[2]);
              blockData[tagDef.docProperty][parsedData.key] = parsedData.value;
            }else {
              blockData[match[1]] = match[2];
            }
          }

          ++lineNumber;
        }
        return blockData;
      })
      .value();
    return callback(null, chunk);
  });


};


