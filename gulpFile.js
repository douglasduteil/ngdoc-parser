'use strict';

var gulp = require('gulp');
var ngDocParser = require('./index');
var through = require('through2');

gulp.task('default', function(){
  return gulp.src('test/*.js')
    .pipe(ngDocParser())
    .pipe(through.obj(function (chunk, enc, callback) {
      process.stdout.write(JSON.stringify(chunk.jsdoc));
      return callback(null, chunk);
    }));
});
