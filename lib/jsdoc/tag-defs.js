'use strict';

var extractTypeTransform = require('../transforms/extract-type');
var extractNameTransform = require('../transforms/extract-name');

module.exports = {

  ngdoc: {},
  name: {},
  description: {},


  param: {
    name: 'param',
    multi: true,
    docProperty: 'params',
    parse : function(str){

      var type = extractTypeTransform(str);
      str = type.next;
      delete type.next;

      var name = extractNameTransform(str);
      str = name.next;
      delete name.next;

      return {
        key : name.name,
        value : {
          type : type,
          name : name,
          description : str
        }
      }
    }
  }

};
