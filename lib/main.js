"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const poliyfill_1 = require("./poliyfill");
const BASE64_TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
exports.BASE64_TABLE = BASE64_TABLE;
const PAD = '=';
exports.PAD = PAD;
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
    else if (poliyfill_1.isArray(table)) {
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
        if (poliyfill_1.isArray(input) || poliyfill_1.isUint8Array(input)) {
            _u8arr = input;
        }
        else if (poliyfill_1.isArrayBuffer(input)) {
            _u8arr = new Uint8Array(input);
        }
        else if (typeof strEncode == 'function') {
            // 其它都当成 string 处理
            _u8arr = strEncode(String(input));
        }
        else {
            // 未初始化 strEncode 函数则不支持string类型
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
exports.createEncode = createEncode;
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
    // const padreg = new RegExp(`${pad}*$`);
    return function (base64Str) {
        // base64Str = base64Str.trim();
        let length = base64Str.length;
        let indexMax = length - getPads(base64Str);
        let mc4 = indexMax % 4;
        if (mc4 === 1)
            throw new TypeError('The parameter is not a base64 string!');
        let buffer = new poliyfill_1.MyLikeUint8array(Math.floor((indexMax * 6) / 8));
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
        // 复写toString以UTF8编码输出;
        toString && (buffer.toString = toString);
        return buffer;
    };
}
exports.createDecode = createDecode;
