/*!
 * @cnwhy/base64  v0.2.4
 * Homepage https://github.com/cnwhy/Base64.js#readme
 * License MIT
 */

const isArray = Array.isArray ||
    function (obj) {
        return Object.prototype.toString.call(obj) == '[object Array]';
    };
const hasArrayBuffer = typeof ArrayBuffer === 'function';
const MyLikeUint8array = hasArrayBuffer ? Uint8Array : Array;
const isUint8Array = function (obj) {
    return hasArrayBuffer && obj instanceof Uint8Array;
};
const isArrayBuffer = function (obj) {
    return hasArrayBuffer && obj instanceof ArrayBuffer;
};

const ERR_CODE = '\ufffd';
function utf8Encode(str) {
    str = String(str);
    let bf = [];
    let length = str.length;
    let add = function (codePoint) {
        if (codePoint < 0x80) {
            return bf.push(codePoint);
        }
        if (codePoint < 0x800) {
            return bf.push(0xc0 | (codePoint >> 6), 0x80 | (codePoint & 0x3f));
        }
        if (codePoint < 0x10000) {
            return bf.push(0xe0 | (codePoint >> 12), 0x80 | ((codePoint >> 6) & 0x3f), 0x80 | (codePoint & 0x3f));
        }
        if (codePoint < 0x200000) {
            return bf.push(0xf0 | (codePoint >> 18), 0x80 | ((codePoint >> 12) & 0x3f), 0x80 | ((codePoint >> 6) & 0x3f), 0x80 | (codePoint & 0x3f));
        }
    };
    for (let i = 0; i < length; i++) {
        let code = str.charCodeAt(i);
        let cod1;
        if (code < 0xd800 || code > 0xdfff) {
            add(code);
        }
        else if (code < 0xdc00 && (cod1 = str.charCodeAt(i + 1)) >= 0xdc00 && cod1 < 0xe000) {
            i++;
            add(0x10000 + (((code & 0x3ff) << 10) | (cod1 & 0x3ff)));
        }
        else {
            add(code);
        }
    }
    return bf;
}
function utf8Decode(buffer) {
    let u8;
    let str = '';
    let index = 0;
    if (isArray(buffer) || isUint8Array(buffer)) {
        u8 = buffer;
    }
    else if (isArrayBuffer(buffer)) {
        u8 = new Uint8Array(buffer);
    }
    else {
        return String(buffer);
    }
    while (index < u8.length) {
        let c0 = u8[index++];
        if (c0 < 0x80) {
            str += String.fromCharCode(c0);
        }
        else if (c0 < 0xc2 || c0 > 0xfd) {
            str += ERR_CODE;
            continue;
        }
        else {
            let _i = index;
            let code = 0;
            let n = 0;
            if (c0 < 0xe0) {
                code |= (c0 & 31) << 6;
                n = 1;
            }
            else if (c0 < 0xf0) {
                n = 2;
                code |= (c0 & 15) << 12;
            }
            else if (c0 < 0xf8) {
                n = 3;
                code |= (c0 & 7) << 18;
            }
            else if (c0 < 0xfc) {
                n = 4;
                code |= (c0 & 3) << 24;
            }
            else {
                n = 5;
                code |= (c0 & 1) << 30;
            }
            while (n--) {
                let c = u8[_i++];
                if (c >> 6 != 2) {
                    code = -1;
                    break;
                }
                code |= (c & 0x3f) << (n * 6);
            }
            if (code > 0xffff) {
                let _code = code - 0x10000;
                str += String.fromCharCode(0xd800 | (_code >> 10));
                str += String.fromCharCode(0xdc00 | (_code & 0x3ff));
            }
            else if (code > 0) {
                str += String.fromCharCode(code);
            }
            else {
                str += ERR_CODE;
                continue;
            }
            index = _i;
        }
    }
    return str;
}

const BASE64_TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const PAD = '=';
function getPad(pad, table) {
    let _pad = String(pad || PAD);
    if (_pad.length !== 1) {
        throw new TypeError('The apd must be char');
    }
    if (~table.join('').indexOf(_pad)) {
        throw new TypeError('The table as _pad');
    }
    return _pad;
}
function getTable(table) {
    let _table;
    table = table || BASE64_TABLE;
    if (typeof table == 'string') {
        _table = table.split('');
    }
    else if (isArray(table)) {
        _table = Array.prototype.slice.call(table, 0);
    }
    else {
        throw new TypeError(`The "table" must be Array or a String.`);
    }
    checkTable(_table);
    return _table;
}
function checkTable(table) {
    if (table.length < 64) {
        throw new TypeError('The length of "table" is not 64!');
    }
    for (let i = 0; i < 64; i++) {
        let char = table[i];
        if (char.length != 1) {
            throw new TypeError(`table item "${char}" must be a single character`);
        }
        for (let k = i + 1; k < 64; k++) {
            if (char == table[k]) {
                throw new TypeError(`Code table character "${char}" is repeated`);
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
    const TABLE = getTable(table);
    const PAD = getPad(pad, TABLE);
    return function (input) {
        let _u8arr;
        if (isArray(input) || isUint8Array(input)) {
            _u8arr = input;
        }
        else if (isArrayBuffer(input)) {
            _u8arr = new Uint8Array(input);
        }
        else if (typeof strEncode == 'function') {
            _u8arr = strEncode(String(input));
        }
        else {
            throw TypeError(`Input type is not supported, "strEncode" is not function`);
        }
        var base64 = '';
        var _l = _u8arr.length % 3;
        var padLength = _l ? _l === 2 ? 1 : 2 : 0;
        var loopLength = _u8arr.length - _l;
        var a0, a1, a2, i = 0;
        while (i < loopLength) {
            a0 = _u8arr[i++];
            a1 = _u8arr[i++];
            a2 = _u8arr[i++];
            base64 =
                base64 +
                    TABLE[a0 >> 2] +
                    TABLE[((a0 << 4) | (a1 >> 4)) & 0x3f] +
                    TABLE[((a1 << 2) | (a2 >> 6)) & 0x3f] +
                    TABLE[a2 & 0x3f];
        }
        if (padLength) {
            a0 = _u8arr[i++];
            a1 = _u8arr[i++] || 0;
            base64 =
                base64 +
                    TABLE[a0 >> 2] +
                    TABLE[((a0 << 4) | (a1 >> 4)) & 0x3f] +
                    (padLength === 2 ? PAD + PAD : TABLE[(a1 << 2) & 0x3f] + PAD);
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
    const TABLE = getTable(table);
    const PAD = getPad(pad, TABLE);
    const TABLE_JOIN = TABLE.join('');
    let _strDecode, toString = typeof strDecode == 'function'
        ? ((_strDecode = strDecode),
            function () {
                return _strDecode(this);
            })
        : null;
    const getV = function (char) {
        let index = TABLE_JOIN.indexOf(char);
        if (index == -1)
            throw new TypeError(`"${char}" not base64 char`);
        return index;
    };
    const getPads = function (base64Str) {
        let index = base64Str.length;
        let pads = 0;
        while (index-- > 0 && base64Str.charAt(index) === PAD) {
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
        let buffer = new MyLikeUint8array(Math.floor((indexMax * 6) / 8));
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
        toString && (buffer.toString = toString);
        return buffer;
    };
}

const BASE64_URL_TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
const encode = createEncode(utf8Encode);
const decode = createDecode(utf8Decode);
const encodeURL = createEncode(BASE64_URL_TABLE, PAD, utf8Encode);
const decodeURL = createDecode(BASE64_URL_TABLE, PAD, utf8Decode);

export { BASE64_TABLE, BASE64_URL_TABLE, PAD, createDecode, createEncode, decode, decodeURL, encode, encodeURL, utf8Decode, utf8Encode };
