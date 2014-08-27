# ngdoc-parser [![NPM version][npm-image]][npm-url]

> Get the ngdoc data form you source comments

Extract all the ngdoc data form your sources to a big json.


## Install

```sh
$ npm install --save-dev ngdoc-parser
```


## Usage

```js
var fs = require('vinyl-fs');
var path = require('path');
var through = require('through2');

var ngdocParser = require('ngdoc-parser');

fs.src('./src/*.js')
  .pipe(ngdocParser())
  .pipe(through.obj(function(file, e, callback){
    file.path = path.join(file.base, 'ngdoc-rawdata.json');
    callback(null, file);
  }))
  .pipe(fs.dest('./out'));
```

## Output example

```js
[ // Array of ngdoc comments
  {
    "ngdoc": "directive",
    "name": "ngRepeat",
    "description": "The `ngRepeat` directive instantiates a template once per item from a collection. [...]",
    "animations": "[...]",
    "element": "ANY",
    "scope": "",
    "priority": "1000",
    "params": [
      {
        "type": {
          "typeExpression": "repeat_expression",
          "type": {"type": "NameExpression", "name": "repeat_expression"},
          "typeList": ["repeat_expression"]
        },
        "name": {"name": "ngRepeat"},
        "description": "The expression indicating how to enumerate a collection. [...]"
      }
    ]
  },
  // ...
]
```

## API

### ngdocParser()

TODO

## Demo

```sh
npm run demo
```

[demo result](https://gist.github.com/douglasduteil/5bff06c0fc3be08f19b6)

## License

    Copyright © 2014 Douglas Duteil <douglasduteil@gmail.com>
    This work is free. You can redistribute it and/or modify it under the
    terms of the Do What The Fuck You Want To Public License, Version 2,
    as published by Sam Hocevar. See the LICENCE file for more details.



[npm-url]: https://npmjs.org/package/ngdoc-parser
[npm-image]: http://img.shields.io/npm/v/ngdoc-parser.svg
