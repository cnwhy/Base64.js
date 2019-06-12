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
    return function (u8arr) {
        let _u8arr;
        if (u8arr instanceof poliyfill_1.myUint8arrayClass) {
            _u8arr = u8arr;
        }
        else if (u8arr instanceof poliyfill_1.MyArrayBuffer || poliyfill_1.isArray(u8arr)) {
            _u8arr = poliyfill_1.getUint8Array(u8arr);
        }
        else if (typeof strEncode == 'function') {
            _u8arr = strEncode(String(u8arr));
        }
        else {
            // 未初始化 strEncode 函数则不支持string类型
            throw TypeError('"strEncode" is not function');
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
            base64 += i > bitLength - 1 ? PAD : TABLE[code];
        }
        return base64;
        // return codes.reduce((d, code, i) => {
        // 	return (d += i > bitLength - 1 ? pad : table[code]);
        // }, '');
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
        let buffer = new poliyfill_1.myUint8arrayClass(Math.floor((indexMax * 6) / 8));
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
