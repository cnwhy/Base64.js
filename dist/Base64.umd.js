(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory(global.Base64 = {}));
}(this, function (exports) { 'use strict';

    /*!
     * @cnwhy/base64  v0.2.3
     * Homepage https://github.com/cnwhy/Base64.js#readme
     * License MIT
     */
    var isArray = Array.isArray || function (obj) {
      return Object.prototype.toString.call(obj) == '[object Array]';
    };

    var hasArrayBuffer = typeof ArrayBuffer === 'function';
    var MyLikeUint8array = hasArrayBuffer ? Uint8Array : Array;

    var isUint8Array = function isUint8Array(obj) {
      return hasArrayBuffer && obj instanceof Uint8Array;
    };

    var isArrayBuffer = function isArrayBuffer(obj) {
      return hasArrayBuffer && obj instanceof ArrayBuffer;
    };

    var ERR_CODE = "\uFFFD";

    function utf8Encode(str) {
      str = String(str);
      var bf = [];
      var length = str.length;

      var add = function add(codePoint) {
        if (codePoint < 0x80) {
          return bf.push(codePoint);
        }

        if (codePoint < 0x800) {
          return bf.push(0xc0 | codePoint >> 6, 0x80 | codePoint & 0x3f);
        }

        if (codePoint < 0x10000) {
          return bf.push(0xe0 | codePoint >> 12, 0x80 | codePoint >> 6 & 0x3f, 0x80 | codePoint & 0x3f);
        }

        if (codePoint < 0x200000) {
          return bf.push(0xf0 | codePoint >> 18, 0x80 | codePoint >> 12 & 0x3f, 0x80 | codePoint >> 6 & 0x3f, 0x80 | codePoint & 0x3f);
        }
      };

      for (var i = 0; i < length; i++) {
        var code = str.charCodeAt(i);
        var cod1 = void 0;

        if (code < 0xd800 || code > 0xdfff) {
          add(code);
        } else if (code < 0xdc00 && (cod1 = str.charCodeAt(i + 1)) >= 0xdc00 && cod1 < 0xe000) {
          i++;
          add(0x10000 + ((code & 0x3ff) << 10 | cod1 & 0x3ff));
        } else {
          add(code);
        }
      }

      return bf;
    }

    function utf8Decode(buffer) {
      var u8;
      var str = '';
      var index = 0;

      if (isArray(buffer) || isUint8Array(buffer)) {
        u8 = buffer;
      } else if (isArrayBuffer(buffer)) {
        u8 = new Uint8Array(buffer);
      } else {
        return String(buffer);
      }

      function setChar(i) {
        var _i = i;
        var c0 = u8[_i++];

        try {
          if (c0 < 0x80) {
            str += String.fromCharCode(c0);
            return _i;
          } else if (c0 < 0xc2 || c0 > 0xfd) {
            throw 'code err';
          } else {
            var mk = 0x80;
            var w = 6;
            var cs = [];
            var code = 0;

            while (c0 >= (mk | Math.pow(2, w))) {
              var cn = u8[_i++];
              if (cn & 0xc0 ^ 0x80) throw 'code err';
              cs.push(cn);
              mk = mk | Math.pow(2, w);
              w--;
            }

            cs = cs.reverse();

            for (var k = 0; k < cs.length; k++) {
              var _c = cs[k] & 0x3f;

              code |= _c << k * 6;
            }

            code |= (c0 & Math.pow(2, w) - 1) << cs.length * 6;

            if (code > 0xffff) {
              var _code = code - 0x10000;

              str += String.fromCharCode(0xd800 | _code >> 10);
              str += String.fromCharCode(0xdc00 | _code & 0x3ff);
            } else {
              str += String.fromCharCode(code & 0xffff);
            }

            return _i;
          }
        } catch (e) {
          str += ERR_CODE;
          return i + 1;
        }
      }

      while (index < u8.length) {
        index = setChar(index);
      }

      return str;
    }

    var BASE64_TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    var PAD = '=';

    function getPad(pad, table) {
      var _pad = String(pad || PAD);

      if (_pad.length !== 1) {
        throw new TypeError('The apd must be char');
      }

      if (~table.join('').indexOf(_pad)) {
        throw new TypeError('The table as _pad');
      }

      return _pad;
    }

    function getTable(table) {
      var _table;

      table = table || BASE64_TABLE;

      if (typeof table == 'string') {
        _table = table.split('');
      } else if (isArray(table)) {
        _table = Array.prototype.slice.call(table, 0);
      } else {
        throw new TypeError("The \"table\" must be Array or a String.");
      }

      checkTable(_table);
      return _table;
    }

    function checkTable(table) {
      if (table.length < 64) {
        throw new TypeError('The length of "table" is not 64!');
      }

      for (var i = 0; i < 64; i++) {
        var _char = table[i];

        if (_char.length != 1) {
          throw new TypeError("table item \"".concat(_char, "\" must be a single character"));
        }

        for (var k = i + 1; k < 64; k++) {
          if (_char == table[k]) {
            throw new TypeError("Code table character \"".concat(_char, "\" is repeated"));
          }
        }
      }
    }

    function createEncode(table, pad, strEncode) {
      if (typeof table == 'function') {
        strEncode = table;
        table = undefined;
        pad = undefined;
      }

      var TABLE = getTable(table);
      var PAD = getPad(pad, TABLE);
      return function (input) {
        var _u8arr;

        if (isArray(input) || isUint8Array(input)) {
          _u8arr = input;
        } else if (isArrayBuffer(input)) {
          _u8arr = new Uint8Array(input);
        } else if (typeof strEncode == 'function') {
          _u8arr = strEncode(String(input));
        } else {
          throw TypeError("Input type is not supported, \"strEncode\" is not function");
        }

        var base64 = '';

        var _l = _u8arr.length % 3;

        var padLength = _l ? _l === 2 ? 1 : 2 : 0;
        var loopLength = _u8arr.length - _l;
        var a0,
            a1,
            a2,
            i = 0;

        while (i < loopLength) {
          a0 = _u8arr[i++];
          a1 = _u8arr[i++];
          a2 = _u8arr[i++];
          base64 = base64 + TABLE[a0 >> 2] + TABLE[(a0 << 4 | a1 >> 4) & 0x3f] + TABLE[(a1 << 2 | a2 >> 6) & 0x3f] + TABLE[a2 & 0x3f];
        }

        if (padLength) {
          a0 = _u8arr[i++];
          a1 = _u8arr[i++] || 0;
          base64 = base64 + TABLE[a0 >> 2] + TABLE[(a0 << 4 | a1 >> 4) & 0x3f] + (padLength === 2 ? PAD + PAD : TABLE[a1 << 2 & 0x3f] + PAD);
        }

        return base64;
      };
    }

    function createDecode(table, pad, strDecode) {
      if (typeof table == 'function') {
        strDecode = table;
        table = undefined;
        pad = undefined;
      }

      var TABLE = getTable(table);
      var PAD = getPad(pad, TABLE);
      var TABLE_JOIN = TABLE.join('');

      var _strDecode,
          toString = typeof strDecode == 'function' ? (_strDecode = strDecode, function () {
        return _strDecode(this);
      }) : null;

      var getV = function getV(_char2) {
        var index = TABLE_JOIN.indexOf(_char2);
        if (index == -1) throw new TypeError("\"".concat(_char2, "\" not base64 char"));
        return index;
      };

      var getPads = function getPads(base64Str) {
        var index = base64Str.length;
        var pads = 0;

        while (index-- > 0 && base64Str.charAt(index) === PAD) {
          pads++;
        }

        return pads;
      };

      return function (base64Str) {
        var length = base64Str.length;
        var indexMax = length - getPads(base64Str);
        var mc4 = indexMax % 4;
        if (mc4 === 1) throw new TypeError('The parameter is not a base64 string!');
        var buffer = new MyLikeUint8array(Math.floor(indexMax * 6 / 8));
        var index = 0;
        var i = 0;

        var next = function next() {
          return getV(base64Str.charAt(i++));
        };

        for (var loopLength = indexMax - mc4; i < loopLength;) {
          var _ref = [next(), next(), next(), next()],
              c0 = _ref[0],
              c1 = _ref[1],
              c2 = _ref[2],
              c3 = _ref[3];
          buffer[index++] = (c0 << 2 | c1 >> 4) & 0xff;
          buffer[index++] = (c1 << 4 | c2 >> 2) & 0xff;
          buffer[index++] = (c2 << 6 | c3) & 0xff;
        }

        if (mc4) {
          var c1;
          buffer[index++] = (next() << 2 | (c1 = next()) >> 4) & 0xff;

          if (mc4 === 3) {
            buffer[index++] = (c1 << 4 | next() >> 2) & 0xff;
          }
        }

        toString && (buffer.toString = toString);
        return buffer;
      };
    }

    var BASE64_URL_TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    var encode = createEncode(utf8Encode);
    var decode = createDecode(utf8Decode);
    var encodeURL = createEncode(BASE64_URL_TABLE, PAD, utf8Encode);
    var decodeURL = createDecode(BASE64_URL_TABLE, PAD, utf8Decode);

    exports.BASE64_TABLE = BASE64_TABLE;
    exports.BASE64_URL_TABLE = BASE64_URL_TABLE;
    exports.PAD = PAD;
    exports.createDecode = createDecode;
    exports.createEncode = createEncode;
    exports.decode = decode;
    exports.decodeURL = decodeURL;
    exports.encode = encode;
    exports.encodeURL = encodeURL;
    exports.utf8Decode = utf8Decode;
    exports.utf8Encode = utf8Encode;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
