(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory(global.Base64 = {}));
}(this, function (exports) { 'use strict';

    /*!
     * @cnwhy/base64  v0.1.3
     * Homepage https://github.com/cnwhy/Base64.js#readme
     * License MIT
     */
    var BASE64_TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('');
    var BASE64_URL_TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'.split('');
    var PAD = '=';
    var ERR_CODE = "\uFFFD";

    var isArray = Array.isArray || function (obj) {
      Object.prototype.toString.call(obj) == '[object Array]';
    };

    var hasArrayBuffer = typeof ArrayBuffer === 'function';
    var MyArrayBuffer = hasArrayBuffer ? ArrayBuffer : function () {};
    var myUint8arrayClass = hasArrayBuffer ? Uint8Array : Array;
    var getUint8Array = hasArrayBuffer ? function (arr) {
      return new Uint8Array(arr);
    } : function (arr) {
      return typeof arr === 'number' ? new Array(arr) : arr;
    };

    function u2utf8(codePoint) {
      if (codePoint < 0x80) return [codePoint];
      var n = 11;

      while (codePoint >= Math.pow(2, n)) {
        n += 5;
      }

      var length = Math.ceil(n / 6);
      var u8 = new Array(length);
      var i = 0;
      u8[0] = 0xff ^ Math.pow(2, 8 - length) - 1 | codePoint >> 6 * (length - 1);

      while (i < length - 1) {
        u8[length - 1 - i] = 0x80 | codePoint >> i * 6 & 0x3f;
        i++;
      }

      return u8;
    }

    function utf8Encode(str) {
      var utf8 = [];
      var codePoints = [];

      for (var i = 0; i < str.length; i++) {
        var code = str.charCodeAt(i);
        var cod1 = void 0;

        if (code < 0xd800 || code > 0xdfff) {
          codePoints.push(code);
        } else if (code < 0xdc00 && (cod1 = str.charCodeAt(i + 1)) >= 0xdc00 && cod1 < 0xe000) {
          i++;
          codePoints.push(0x10000 + ((code & 0x3ff) << 10 | cod1 & 0x3ff));
        } else {
          codePoints.push(code);
        }
      }

      for (var _i2 = 0; _i2 < codePoints.length; _i2++) {
        var v = codePoints[_i2];
        utf8.push.apply(utf8, u2utf8(v));
      }

      return getUint8Array(utf8);
    }

    function utf8Decode(buffer) {
      var u8;
      var str = '';
      var index = 0;

      if (buffer instanceof myUint8arrayClass) {
        u8 = buffer;
      } else if (buffer instanceof MyArrayBuffer || isArray(buffer)) {
        u8 = getUint8Array(buffer);
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

    function toStringUTF8() {
      return utf8Decode(this);
    }

    function getEncode(table, pad) {
      return function (u8arr) {
        var _u8arr;

        if (u8arr instanceof myUint8arrayClass) {
          _u8arr = u8arr;
        } else if (u8arr instanceof MyArrayBuffer || isArray(u8arr)) {
          _u8arr = getUint8Array(u8arr);
        } else {
          _u8arr = utf8Encode(u8arr.toString());
        }

        var bitLength = Math.ceil(_u8arr.length * 8 / 6);
        var str64Length = Math.ceil(_u8arr.length / 3) * 4;
        var codes = new Array(str64Length);
        var index = 0;

        for (var i = 0; i < _u8arr.length;) {
          var a0 = _u8arr[i++];
          var a1 = _u8arr[i++];
          var a2 = _u8arr[i++];
          codes[index++] = a0 >> 2;
          codes[index++] = (a0 << 4 | a1 >> 4) & 0x3f;
          codes[index++] = (a1 << 2 | a2 >> 6) & 0x3f;
          codes[index++] = a2 & 0x3f;
        }

        var base64 = '';

        for (var _i3 = 0; _i3 < codes.length; _i3++) {
          var code = codes[_i3];
          base64 += _i3 > bitLength - 1 ? pad : table[code];
        }

        return base64;
      };
    }

    function getDecode(table, pad) {
      var tableStr = table.join('');

      var getV = function getV(_char) {
        var index = tableStr.indexOf(_char);
        if (index == -1) throw new TypeError("\"".concat(_char, "\" not base64 char"));
        return index;
      };

      var getPads = function getPads(base64Str) {
        var index = base64Str.length;
        var pads = 0;

        while (index-- > 0 && base64Str.charAt(index) === pad) {
          pads++;
        }

        return pads;
      };

      return function (base64Str) {
        var length = base64Str.length;
        var indexMax = length - getPads(base64Str);
        var mc4 = indexMax % 4;
        if (mc4 === 1) throw new TypeError('The parameter is not a base64 string!');
        var buffer = new myUint8arrayClass(Math.floor(indexMax * 6 / 8));
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

        buffer.toString = toStringUTF8;
        return buffer;
      };
    }

    var encode = getEncode(BASE64_TABLE, PAD);
    var decode = getDecode(BASE64_TABLE, PAD);
    var encodeURL = getEncode(BASE64_URL_TABLE, PAD);
    var decodeURL = getDecode(BASE64_URL_TABLE, PAD);
    var lib = {
      getEncode: getEncode,
      getDecode: getDecode
    };

    exports.decode = decode;
    exports.decodeURL = decodeURL;
    exports.encode = encode;
    exports.encodeURL = encodeURL;
    exports.lib = lib;
    exports.utf8Decode = utf8Decode;
    exports.utf8Encode = utf8Encode;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
