'use strict';

var tagDefMap = require('./jsdoc/tag-defs');
var END_OF_LINE = /\r?\n/;
var TAG_MARKER = /^\s*@(\S+)\s*(.*)$/;

/**
 * @module DocCommentParser
 * @example
 * ```
 * var DocCommentParser = require("DocCommentParser");
 * ```
 */
module.exports = DocCommentParser;

/**
 * A little doc parser to extract inline or multiline comments
 * @alias module:DocCommentParser
 * @param {string} text The text to parse.
 * @constructor
 */
function DocCommentParser(text) {
  this.lines = text.split(END_OF_LINE);
  this.lineNumber = 0;
  this.length = this.lines.length;
  this.line = '';

  this.match = [];
  this.tagDef = {};

  this.mode = this._extractLine;

  this.data = {};
}

DocCommentParser.prototype = {
  /**
   * @private
   */
  _nextLine: function () {
    this.line = this.lines[this.lineNumber++];
  },
  /**
   * @private
   */
  _extractAllLineUntilNextTag: function () {
    var match, tagDef, tag, targetField;

    tag = this.tagDef.docProperty;
    var lastAdded = this.data[tag].length - 1;


    this._nextLine();
    match = TAG_MARKER.exec(this.line);
    tagDef = match && tagDefMap[match[1]];

    while (this.line !== void 0 && !(match && tagDef)) {

      if (this.tagDef.enableMultiTag) {
        // Hard coded description value
        this.data[tag][lastAdded].description += (this.data[tag][lastAdded].description.length ? '\n' : '') + this.line;
      } else {
        this.data[tag] += (this.data[tag].length ? '\n' : '') + this.line;
      }

      // Next line
      this._nextLine();
      match = TAG_MARKER.exec(this.line);
      tagDef = match && tagDefMap[match[1]];
    }

    --this.lineNumber;

    this.mode = this._extractLine;
  },
  _saveData: function (value) {
    if (this.tagDef.enableMultiTag) {
      this.data[this.tagDef.docProperty].push(value);
    } else {
      this.data[this.tagDef.docProperty] = value;
    }
  },
  /**
   * @private
   */
  _extractLine: function _extractLine() {
    this._nextLine();

    /**
     * Inspired by https://github.com/angular/dgeni-packages/blob/master/jsdoc/file-readers/jsdoc.js
     */
    this.match = TAG_MARKER.exec(this.line);
    this.tagDef = this.match && tagDefMap[this.match[1]];


    // We ignore tags if we are in a code bloc
    if (this.match && this.tagDef) {
      if (this.tagDef.enableMultiTag) {
        this.data[this.tagDef.docProperty] = (this.data[this.tagDef.docProperty] || []);
      }

      this.tagDef.docProperty = this.tagDef.docProperty || this.match[1];

      this._saveData(this.tagDef.parse ? this.tagDef.parse(this.match[2]) : this.match[2]);

      if (this.tagDef.isMultiLine) {
        this.mode = this._extractAllLineUntilNextTag;
      }

    }

  },
  /**
   * Run the parsing
   * @public
   * @returns {object} The extracted data
   */
  run: function () {
    while (this.lineNumber < this.length) {
      this.mode();
    }
    return this.data;
  }
};

