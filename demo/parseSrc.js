'use strict';

var fs = require('vinyl-fs');
var path = require("path");
var through = require('through2');

var ngdocParser = require('./../index');

fs.src('./demo/src/*.js')
  .pipe(ngdocParser())
  .pipe(through.obj(function(file, e, callback){
    file.path = path.join(file.base, 'ngdoc-rawdata.json');
    callback(null, file);
  }))
  .pipe(fs.dest('./out'));

