"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const poliyfill_1 = require("./poliyfill");
const ERR_CODE = '\ufffd';
function u2utf8(codePoint) {
    // 未暴露的方法, 内部调用无需判断;
    // if (codePoint < 0 || codePoint > 0x7fffffff) throw new SyntaxError('Undefined Unicode code-point');
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
/**
 * 字符串utf8编码
 *
 * @param {string} str
 * @returns
 */
function utf8Encode(str) {
    let utf8 = [];
    let codePoints = [];
    //将字符串(ucs2)转为Unicode
    for (let i = 0; i < str.length; i++) {
        let code = str.charCodeAt(i);
        let cod1;
        if (code < 0xd800 || code > 0xdfff) {
            codePoints.push(code);
        }
        else if (code < 0xdc00 && (cod1 = str.charCodeAt(i + 1)) >= 0xdc00 && cod1 < 0xe000) {
            //四字节字符处理
            i++;
            codePoints.push(0x10000 + (((code & 0x3ff) << 10) | (cod1 & 0x3ff)));
        }
        else {
            //不自行处理 不正常编码
            codePoints.push(code);
        }
    }
    //UTF8编码Unicode
    for (let i = 0; i < codePoints.length; i++) {
        let v = codePoints[i];
        utf8.push.apply(utf8, u2utf8(v));
    }
    return poliyfill_1.getUint8Array(utf8);
}
exports.utf8Encode = utf8Encode;
/**
 * buffer以utf8转字符串
 *
 * @param {(ArrayBuffer | Uint8Array | number[])} buffer
 * @returns {string}
 */
function utf8Decode(buffer) {
    let u8;
    let str = '';
    let index = 0;
    if (buffer instanceof poliyfill_1.myUint8arrayClass) {
        // Uint8Array & Buffer
        u8 = buffer;
    }
    else if (buffer instanceof poliyfill_1.MyArrayBuffer || poliyfill_1.isArray(buffer)) {
        // ArrayBuffer & number[]
        u8 = poliyfill_1.getUint8Array(buffer);
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
                //  多字节 `u+0080` 转第一位最小值是 1100 0010 , 0000 0000
                //  多字节 第一字节 最大位是 `1111 1101`
                throw 'code err';
            }
            else {
                let mk = 0x80;
                let w = 6;
                let cs = [];
                let code = 0;
                while (c0 >= (mk | (Math.pow(2, w)))) {
                    let cn = u8[_i++];
                    // if(cn < 0x80 || cn > 0xfb) throw 'code err';
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
            // 不正常的UTF8字节数据, 替换为 � 
            // 注:此处与utf8Encode的不正常编码不同;
            // UTF8编码时不考虑代理区, UTF16需要考虑代理区;
            str += ERR_CODE;
            return i + 1;
        }
    }
    while (index < u8.length) {
        index = setChar(index);
    }
    return str;
}
exports.utf8Decode = utf8Decode;
