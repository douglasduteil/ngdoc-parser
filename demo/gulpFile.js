'use strict';

var gulp = require('gulp');
var through = require('through2');
var Promise = require("bluebird");

//var nunjucksTransform = require('./tasks/nunjucksTransform');

var ngDocParser = require('./../index');

global.d = function () {
  var args = Array.prototype.slice.call(arguments);
  var time = new Date().toISOString();
  console.log(time + ' - break : ' + util.inspect.call(null, args.length === 1 ? args[0] : args, false, 10, true));
};


gulp.task('default', function () {

  function extractNgDoc() {
    var def = Promise.defer();

    var ngDocs = [];
    gulp.src('src/*.js')
      .pipe(ngDocParser())
      .pipe(through.obj(function (chunk, enc, callback) {
        ngDocs.push(chunk.jsdoc);
        process.stdout.write(JSON.stringify(chunk.jsdoc));
        return callback(null, chunk);
      }))
      .on('end', function () {
        def.resolve(ngDocs);
      });

    return def.promise;
  }


  return extractNgDoc()
    .then(function (data) {
      d(data);
    })

});
