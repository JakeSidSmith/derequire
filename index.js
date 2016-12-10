'use strict';

var acorn = require('acorn');
var escope = require('escope');

var requireRegexp = /\brequire\b/;

function write(arr, str, offset) {
  for (var i = 0, l = str.length; i < l; i++) {
    arr[offset + i] = str[i];
  }
}

function rename(code, tokenTo, tokenFrom, exclude) {

  // Ensure our exclusions are an array
  var excluded = [].concat(exclude)
    .filter(function(ex) {
      // Remove any empty / non-string values
      return ex && typeof ex === 'string';
    });

  var tokens;
  if (!Array.isArray(tokenTo)) {
    tokens = [{
      from: tokenFrom || 'require',
      to: tokenTo || '_dereq_'
    }];
  } else {
    tokens = tokenTo;
  }

  tokens.forEach(function(token) {
    if (token.to.length !== token.from.length) {
      throw new Error('"' + token.to + '" and "' + token.from + '" must be the same length');
    }
  });

  if (tokens.length === 1 &&
      tokens[0].from === 'require' &&
      !requireRegexp.test(code)) {
    return code;
  }

  var ast;
  try {
    ast = acorn.parse(code, {
      ecmaVersion: 6,
      ranges: true,
      allowReturnOutsideFunction: true
    });
  } catch(err) {
    console.error('Derequire failed.');
    // this should probably log something and/or exit violently
    return code;
  }

  code = String(code).split('');

  function walk(obj) {
    if (!obj) {
      return;
    }

    if (typeof obj === 'object') {
      if (Array.isArray(obj)) {
        for (var i = 0; i < obj.length; i += 1) {
          var value = obj[i];

          walk(value);
        }
      } else {
        if (obj.type === 'CallExpression') {
          var name = obj.callee.name;

          for (var i = 0; i < tokens.length; i += 1) {
            var token = tokens[i];

            if (
              name === token.from &&
              obj.arguments.length === 1 &&
              obj.arguments[0].type === 'Literal' &&
              obj.arguments[0].value &&
              excluded.indexOf(obj.arguments[0].value) >= 0
            ) {
              obj.arguments[0].excluded = true;
            }
          }
        } else if (obj.type === 'Identifier' && !obj.excluded) {
          var value = obj.name;

          for (var i = 0; i < tokens.length; i += 1) {
            var token = tokens[i];

            if (value === token.from) {
              write(code, token.to, obj.range[0]);
            }
          }
        }

        for (var key in obj) {
          walk(obj[key]);
        }
      }
    }
  }

  walk(ast);

  return code.join('');
}

module.exports = rename;
