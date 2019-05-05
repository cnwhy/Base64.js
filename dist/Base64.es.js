/*!
 * @cnwhy/base64  v0.1.2
 * Homepage https://github.com/cnwhy/Base64.js#readme
 * License MIT
 */

const BASE64_TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('');
const BASE64_URL_TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'.split('');
const PAD = '=';
const ERR_CODE = '\ufffd';
const isArray = Array.isArray ||
    function (obj) {
        Object.prototype.toString.call(obj) == '[object Array]';
    };
const hasArrayBuffer = typeof ArrayBuffer === 'function';
const MyArrayBuffer = hasArrayBuffer ? ArrayBuffer : function () { };
const myUint8arrayClass = hasArrayBuffer ? Uint8Array : Array;
const getUint8Array = hasArrayBuffer
    ? function (arr) {
        return new Uint8Array(arr);
    }
    : function (arr) {
        return typeof arr === 'number' ? new Array(arr) : arr;
    };
function u2utf8(codePoint) {
    if (codePoint < 0x80)
        return [codePoint];
    let n = 11;
    while (codePoint >= Math.pow(2, n)) {
        n += 5;
    }
    let length = Math.ceil(n / 6);
    let u8 = new Array(length);
    let i = 0;
    u8[0] = (0xff ^ (Math.pow(2, (8 - length)) - 1)) | (codePoint >> (6 * (length - 1)));
    while (i < length - 1) {
        u8[length - 1 - i] = 0x80 | ((codePoint >> (i * 6)) & 0x3f);
        i++;
    }
    return u8;
}
function utf8Encode(str) {
    let utf8 = [];
    let codePoints = [];
    for (let i = 0; i < str.length; i++) {
        let code = str.charCodeAt(i);
        let cod1;
        if (code < 0xd800 || code > 0xdfff) {
            codePoints.push(code);
        }
        else if (code < 0xdc00 && (cod1 = str.charCodeAt(i + 1)) >= 0xdc00 && cod1 < 0xe000) {
            i++;
            codePoints.push(0x10000 + (((code & 0x3ff) << 10) | (cod1 & 0x3ff)));
        }
        else {
            codePoints.push(code);
        }
    }
    for (let i = 0; i < codePoints.length; i++) {
        let v = codePoints[i];
        utf8.push.apply(utf8, u2utf8(v));
    }
    return getUint8Array(utf8);
}
function utf8Decode(buffer) {
    let u8;
    let str = '';
    let index = 0;
    if (buffer instanceof myUint8arrayClass) {
        u8 = buffer;
    }
    else if (buffer instanceof MyArrayBuffer || isArray(buffer)) {
        u8 = getUint8Array(buffer);
    }
    else {
        return String(buffer);
    }
    function setChar(i) {
        let _i = i;
        let c0 = u8[_i++];
        try {
            if (c0 < 0x80) {
                str += String.fromCharCode(c0);
                return _i;
            }
            else if (c0 < 0xc2 || c0 > 0xfd) {
                throw 'code err';
            }
            else {
                let mk = 0x80;
                let w = 6;
                let cs = [];
                let code = 0;
                while (c0 >= (mk | (Math.pow(2, w)))) {
                    let cn = u8[_i++];
                    if ((cn & 0xc0) ^ 0x80)
                        throw 'code err';
                    cs.push(cn);
                    mk = mk | (Math.pow(2, w));
                    w--;
                }
                cs = cs.reverse();
                for (let k = 0; k < cs.length; k++) {
                    let _c = cs[k] & 0x3f;
                    code |= _c << (k * 6);
                }
                code |= (c0 & (Math.pow(2, w) - 1)) << (cs.length * 6);
                if (code > 0xffff) {
                    let _code = code - 0x10000;
                    str += String.fromCharCode(0xd800 | (_code >> 10));
                    str += String.fromCharCode(0xdc00 | (_code & 0x3ff));
                }
                else {
                    str += String.fromCharCode(code & 0xffff);
                }
                return _i;
            }
        }
        catch (e) {
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
        let _u8arr;
        if (u8arr instanceof myUint8arrayClass) {
            _u8arr = u8arr;
        }
        else if (u8arr instanceof MyArrayBuffer || isArray(u8arr)) {
            _u8arr = getUint8Array(u8arr);
        }
        else {
            _u8arr = utf8Encode(u8arr.toString());
        }
        let bitLength = Math.ceil((_u8arr.length * 8) / 6);
        let str64Length = Math.ceil(_u8arr.length / 3) * 4;
        let codes = new Array(str64Length);
        let index = 0;
        for (let i = 0; i < _u8arr.length;) {
            let a0 = _u8arr[i++];
            let a1 = _u8arr[i++];
            let a2 = _u8arr[i++];
            codes[index++] = a0 >> 2;
            codes[index++] = ((a0 << 4) | (a1 >> 4)) & 0x3f;
            codes[index++] = ((a1 << 2) | (a2 >> 6)) & 0x3f;
            codes[index++] = a2 & 0x3f;
        }
        let base64 = '';
        for (let i = 0; i < codes.length; i++) {
            const code = codes[i];
            base64 += i > bitLength - 1 ? pad : table[code];
        }
        return base64;
    };
}
function getDecode(table, pad) {
    const tableStr = table.join('');
    const getV = function (char) {
        let index = tableStr.indexOf(char);
        if (index == -1)
            throw new TypeError(`"${char}" not base64 char`);
        return index;
    };
    const getPads = function (base64Str) {
        let index = base64Str.length;
        let pads = 0;
        while (index-- > 0 && base64Str.charAt(index) === pad) {
            pads++;
        }
        return pads;
    };
    return function (base64Str) {
        let length = base64Str.length;
        let indexMax = length - getPads(base64Str);
        let mc4 = indexMax % 4;
        if (mc4 === 1)
            throw new TypeError('The parameter is not a base64 string!');
        let buffer = new myUint8arrayClass(Math.floor((indexMax * 6) / 8));
        let index = 0;
        let i = 0;
        const next = function () {
            return getV(base64Str.charAt(i++));
        };
        for (let loopLength = indexMax - mc4; i < loopLength;) {
            let [c0, c1, c2, c3] = [next(), next(), next(), next()];
            buffer[index++] = ((c0 << 2) | (c1 >> 4)) & 0xff;
            buffer[index++] = ((c1 << 4) | (c2 >> 2)) & 0xff;
            buffer[index++] = ((c2 << 6) | c3) & 0xff;
        }
        if (mc4) {
            let c1;
            buffer[index++] = ((next() << 2) | ((c1 = next()) >> 4)) & 0xff;
            if (mc4 === 3) {
                buffer[index++] = ((c1 << 4) | (next() >> 2)) & 0xff;
            }
        }
        buffer.toString = toStringUTF8;
        return buffer;
    };
}
const encode = getEncode(BASE64_TABLE, PAD);
const decode = getDecode(BASE64_TABLE, PAD);
const encodeURL = getEncode(BASE64_URL_TABLE, PAD);
const decodeURL = getDecode(BASE64_URL_TABLE, PAD);

export { decode, decodeURL, encode, encodeURL, utf8Decode, utf8Encode };
