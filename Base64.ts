/*!
 * Base64.js
 * https://github.com/cnwhy/Base64.js#readme
 */
const BASE64_TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('');
const BASE64_URL_TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'.split('');
const PAD = '=';
const ERR_CODE = '\ufffd';

function u2utf8(codePoint: number): number[] {
	// 未暴露的方法, 内部调用无需判断;
	// if (codePoint < 0 || codePoint > 0x7fffffff) throw new SyntaxError('Undefined Unicode code-point');
	if (codePoint < 0x80) return [codePoint];
	let n = 11;
	while (codePoint >= 2 ** n) {
		n += 5;
	}
	let length = Math.ceil(n / 6);
	let u8 = new Array(length);
	let i = 0;
	u8[0] = (0xff ^ (2 ** (8 - length) - 1)) | (codePoint >> (6 * (length - 1)));
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
function utf8Encode(str: string):Uint8Array {
	let utf8: number[] = [];
	let codePoints: number[] = [];
	for (var i = 0; i < str.length; i++) {
		let code = str.charCodeAt(i);
		let cod1;
		if (code < 0xd800 || code > 0xdfff) {
			codePoints.push(code);
		} else if (code < 0xdc00 && (cod1 = str.charCodeAt(i + 1)) >= 0xdc00 && cod1 < 0xe000) {
			//四字节字符处理
			i++;
			codePoints.push(0x10000 + (((code & 0x3ff) << 10) | (cod1 & 0x3ff)));
		} else {
			//不自行处理 不正常编码
			codePoints.push(code);
		}
	}
	codePoints.forEach(v => {
		utf8.push.apply(utf8, u2utf8(v));
	});
	return new Uint8Array(utf8);
}

/**
 * buffer以utf8转字符串
 *
 * @param {(ArrayBuffer | Uint8Array | number[])} buffer
 * @returns {string}
 */
function utf8Decode(buffer: ArrayBuffer | Uint8Array | number[]): string {
	let u8: Uint8Array;
	let str = '';
	let index = 0;
	if (buffer instanceof Uint8Array) {
		// Uint8Array & Buffer
		u8 = buffer;
	} else if (buffer instanceof ArrayBuffer || Array.isArray(buffer)) {
		// ArrayBuffer & number[]
		u8 = new Uint8Array(buffer);
	} else {
		return String(buffer);
	}
	function setChar(i: number): number {
		let _i = i;
		let c0 = u8[_i++];
		try {
			if (c0 < 0x80) {
				str += String.fromCharCode(c0);
				return _i;
			} else if (c0 < 0xc2 || c0 > 0xfd) {
				//  多字节 `u+0080` 转第一位最小值是 1100 0010 , 0000 0000
				//  多字节 第一字节 最大位是 `1111 1101`
				throw 'code err';
			} else {
				let mk = 0x80;
				let w = 6;
				let cs: number[] = [];
				let code = 0;
				while (c0 >= (mk | (2 ** w))) {
					let cn = u8[_i++];
					// if(cn < 0x80 || cn > 0xfb) throw 'code err';
					if ((cn & 0xc0) ^ 0x80) throw 'code err';
					cs.push(cn);
					mk = mk | (2 ** w);
					w--;
				}
				cs = cs.reverse();
				for (let k = 0; k < cs.length; k++) {
					let _c = cs[k] & 0x3f;
					code |= _c << (k * 6);
				}
				code |= (c0 & (2 ** w - 1)) << (cs.length * 6);
				if (code > 0xffff) {
					let _code = code - 0x10000;
					str += String.fromCharCode(0xd800 | (_code >> 10));
					str += String.fromCharCode(0xdc00 | (_code & 0x3ff));
				} else {
					str += String.fromCharCode(code & 0xffff);
				}
				return _i;
			}
		} catch (e) {
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

function toStringUTF8(this: Uint8Array):string {
	return utf8Decode(this);
}

function getEncode(table: string[], pad: string) {
	return function(u8arr: ArrayBuffer | Uint8Array | number[] | string): string {
		let _u8arr;
		if (u8arr instanceof Uint8Array) {
			_u8arr = u8arr;
		} else if (u8arr instanceof ArrayBuffer || Array.isArray(u8arr)) {
			_u8arr = new Uint8Array(u8arr);
		} else {
			_u8arr = utf8Encode(u8arr.toString());
		}
		let bitLength = Math.ceil((_u8arr.length * 8) / 6);
		let str64Length = Math.ceil(_u8arr.length / 3) * 4;
		let codes = new Array(str64Length);
		let index = 0;
		for (let i = 0; i < _u8arr.length; ) {
			let a0 = _u8arr[i++];
			let a1 = _u8arr[i++];
			let a2 = _u8arr[i++];
			codes[index++] = a0 >> 2;
			codes[index++] = ((a0 << 4) | (a1 >> 4)) & 0x3f;
			codes[index++] = ((a1 << 2) | (a2 >> 6)) & 0x3f;
			codes[index++] = a2 & 0x3f;
		}
		return codes.reduce((d, code, i) => {
			return (d += i > bitLength - 1 ? pad : table[code]);
		}, '');
	};
}

function getDecode(table: string[], pad: string) {
	const getV = function(char: string): number {
		let index = table.indexOf(char);
		if (index == -1) throw new TypeError(`"${char}" not base64 char`);
		return index;
	};
	const getPads = function(base64Str: string): number {
		let index = base64Str.length;
		let pads = 0;
		while (index-- > 0 && base64Str.charAt(index) === pad) {
			pads++;
		}
		return pads;
	};
	const padreg = new RegExp(`${pad}*$`);
	return function(base64Str: string): Uint8Array {
		base64Str = base64Str.trim();
		let length = base64Str.length;
		let indexMax = length - getPads(base64Str);
		let mc4 = indexMax % 4;
		if (mc4 === 1) throw new TypeError('The parameter is not a base64 string!');
		let buffer = new Uint8Array(Math.floor((indexMax * 6) / 8));
		let index = 0;
		let i = 0;
		const next = function() {
			return getV(base64Str.charAt(i++));
		};
		for (let loopLength = indexMax - mc4; i < loopLength; ) {
			let [c0, c1, c2, c3] = [next(), next(), next(), next()];
			buffer[index++] = (c0 << 2) | (c1 >> 4);
			buffer[index++] = (c1 << 4) | (c2 >> 2);
			buffer[index++] = (c2 << 6) | c3;
		}
		if (mc4) {
			let c0,c1;
			buffer[index++] = ((c0 = next()) << 2) | ((c1 = next()) >> 4);
			if (mc4 === 3) {
				buffer[index++] = (c1 << 4) | ((next()) >> 2);
			}
		}
		// 复写toString以UTF8编码输出;
		buffer.toString = toStringUTF8;
		return buffer;
	};
}

const encode = getEncode(BASE64_TABLE, PAD);
const decode = getDecode(BASE64_TABLE, PAD);

const encodeURL = getEncode(BASE64_URL_TABLE, PAD);
const decodeURL = getDecode(BASE64_URL_TABLE, PAD);

export { decode, encode, encodeURL, decodeURL, utf8Encode, utf8Decode };
