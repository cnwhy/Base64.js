/*!
 * Base64.js
 * https://github.com/cnwhy/Base64.js#readme
 */
const BASE64_TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('');
const BASE64_URL_TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'.split('');
const PAD = '=';
const ERR_CODE = '\ufffd';
// function isTypeArray(obj: any) {
// 	return (
// 		obj &&
// 		obj.buffer instanceof ArrayBuffer &&
// 		typeof obj.byteOffset === 'number' &&
// 		typeof obj.byteLength === 'number'
// 	);
// }
// function typeArray2Uint8Array(obj: any): Uint8Array {
// 	if (obj instanceof Uint8Array) {
// 		return obj;
// 	} else {
// 		return new Uint8Array(obj.buffer, obj.byteOffset, obj.byteLength);
// 	}
// }
function u2utf8(codePoint) {
    if (codePoint < 0 || codePoint > 0x7fffffff)
        throw new SyntaxError('Undefined Unicode code-point');
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
    for (var i = 0; i < str.length; i++) {
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
    codePoints.forEach(v => {
        utf8.push.apply(utf8, u2utf8(v));
    });
    return new Uint8Array(utf8);
}
function utf8Decode(buffer) {
    let u8;
    let str = '';
    let index = 0;
    if (buffer instanceof Uint8Array) {
        // Uint8Array & Buffer
        u8 = buffer;
    }
    else if (buffer instanceof ArrayBuffer || Array.isArray(buffer)) {
        // ArrayBuffer & number[]
        u8 = new Uint8Array(buffer);
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
                if (code > 0xFFFF) {
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
            // str += String.fromCharCode(c0);
            // 不正常的UTF8字节数据, 替换为 � 
            // console.log(e);
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
        if (u8arr instanceof Uint8Array) {
            _u8arr = u8arr;
        }
        else if (u8arr instanceof ArrayBuffer || Array.isArray(u8arr)) {
            _u8arr = new Uint8Array(u8arr);
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
            codes[index++] = ((a0 << 4) | (a1 >> 4)) & 63;
            codes[index++] = ((a1 << 2) | (a2 >> 6)) & 63;
            codes[index++] = a2 & 63;
        }
        return codes.reduce((d, code, i) => {
            return (d += i > bitLength - 1 ? pad : table[code]);
        }, '');
    };
}
function getDecode(table, pad) {
    const getV = function (char) {
        let index = table.indexOf(char);
        if (index == -1)
            throw new TypeError(`"${char}" not base64 char`);
        return index;
    };
    const padreg = new RegExp(`${pad}*$`);
    return function (base64Str) {
        base64Str = base64Str.trim();
        let _str64 = base64Str.replace(padreg, '');
        let mc4 = _str64.length % 4;
        if (mc4 === 1)
            throw new TypeError('The parameter is not a base64 string!');
        let bitLength = Math.floor((_str64.length * 6) / 8);
        _str64 += mc4 ? (mc4 === 2 ? 'AA' : 'A') : '';
        let buffer = new Uint8Array(bitLength);
        let index = 0;
        for (let i = 0; i < base64Str.length;) {
            let c0 = getV(_str64.charAt(i++));
            let c1 = getV(_str64.charAt(i++));
            let c2 = getV(_str64.charAt(i++));
            let c3 = getV(_str64.charAt(i++));
            buffer[index++] = (c0 << 2) | (c1 >> 4);
            buffer[index++] = (c1 << 4) | (c2 >> 2);
            buffer[index++] = (c2 << 6) | c3;
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
