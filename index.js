'use strict';

//
// ngDocParser
// a ngDoc parser
// Inspired by the jsdoc parser of [dgeni-packages](https://github.com/angular/dgeni-packages)
//

var esprima = require('esprima');
var _ = require('lodash');
var through = require('through2');
var DocCommentParser = require('./lib/DocCommentParser');

var LEADING_STAR = /^[^\S\r\n]*\*[^\S\n\r]?/gm;


module.exports = function ngDocParser(opts) {

  var defaults = {
    START_TAG: '@ngdoc'
  };

  var options = _.assign({}, defaults, opts);

  return through.obj(function (chunk, enc, callback) {

    var parsingResult = esprima.parse(String(chunk.contents), {
      loc: true,
      range: true,
      comment: true
    });

    var jsdoc = _(parsingResult.comments)
      .filter(function (comment) {
        comment.uncommentedValue = comment.value.replace(LEADING_STAR, '').trim();

        // To test for a jsdoc comment (i.e. starting with /** ), we need to check for a leading
        // star since the parser strips off the first "/*"
        // Don't treat block that don't start with @ngdoc
        return comment.type === 'Block' &&
          comment.value.charAt(0) === '*' &&
          comment.uncommentedValue.substr(0, options.START_TAG.length) === options.START_TAG;
      })

      .filter(function (comment) {
        return comment.value.charAt(0) === '*';
      })

      .map(function (comment) {
        var parser = new DocCommentParser(comment.uncommentedValue);
        parser.run();
        return parser.data;
      })
      .value();

    chunk.contents = new Buffer(JSON.stringify(jsdoc));
    return callback(null, chunk);
  });


};


