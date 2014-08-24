'use strict';

var fs = require('vinyl-fs');
var path = require("path");
var through = require('through2');
var marked = require('marked');
var nunjucksTransform = require('./tasks/nunjucksTransform.js');
var _ = require('lodash');

var ngDocParser = require('./../index');

var defaultNgdocSectionOrder = ['function',  'directive', 'object', 'type', 'service', 'provider', 'filter'];
var defaultMainNgDocTemplatePath = './demo/templates/ngdoc.md.nunjucks';

function ngDocMarkdown(){
  return through.obj(function(file, enc, callback){
    var data = JSON.parse(file.contents.toString());

    // Precompile the params descriptions
    _(data).pluck('params').flatten().each(function(param){
      param.description = param.description && marked(param.description);
    });

    var sortedByNgdoc = _.groupBy(data, 'ngdoc');

    // intersection sorted as the default array order.
    var ngdocSectionOrder = _.intersection(defaultNgdocSectionOrder, Object.keys(sortedByNgdoc));

    fs.src(defaultMainNgDocTemplatePath)
      .pipe(nunjucksTransform({
        sectionOrder : ngdocSectionOrder,
        sections : sortedByNgdoc
      }))
      .pipe(through.obj(function(mdFile){
        callback(null, mdFile);
      }));

  });
}

fs.src('./demo/src/*.js')
  .pipe(ngDocParser())
  .pipe(ngDocMarkdown())
  .pipe(through.obj(function(file, e, callback){
    file.path = path.join(file.base, 'api.md');
    callback(null, file);
  }))
  .pipe(fs.dest('./out'));
