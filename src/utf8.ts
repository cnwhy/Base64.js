import {isArray, isArrayBuffer, isUint8Array} from './poliyfill';
const ERR_CODE = '\ufffd';
type LikeUint8Array = number[] | Uint8Array;

/**
 * 字符串utf8编码
 *
 * @param {string} str
 * @returns
 */
function utf8Encode(str: string): LikeUint8Array {
	str = String(str);
	let bf: number[] = [];
	let length = str.length;
	let add = function(codePoint: number) {
		if (codePoint < 0x80) {
			return bf.push(codePoint);
		}
		if (codePoint < 0x800) {
			return bf.push(0xc0 | (codePoint >> 6), 0x80 | (codePoint & 0x3f));
		}
		if (codePoint < 0x10000) {
			return bf.push(
				0xe0 | (codePoint >> 12),
				0x80 | ((codePoint >> 6) & 0x3f),
				0x80 | (codePoint & 0x3f)
			);
		}
		if (codePoint < 0x200000) {
			return bf.push(
				0xf0 | (codePoint >> 18),
				0x80 | ((codePoint >> 12) & 0x3f),
				0x80 | ((codePoint >> 6) & 0x3f),
				0x80 | (codePoint & 0x3f)
			);
		}
		// 肯定不会用到的 注释掉 减少打包代码量
		// if (codePoint < 0x4000000) {
		// 	return bf.push(
		// 		0xf8 | (codePoint >> 24),
		// 		0x80 | ((codePoint >> 18) & 0x3f),
		// 		0x80 | ((codePoint >> 12) & 0x3f),
		// 		0x80 | ((codePoint >> 6) & 0x3f),
		// 		0x80 | (codePoint & 0x3f)
		// 	);
		// }
		// return bf.push(
		// 	0xfc | (codePoint >> 30),
		// 	0x80 | ((codePoint >> 24) & 0x3f),
		// 	0x80 | ((codePoint >> 18) & 0x3f),
		// 	0x80 | ((codePoint >> 12) & 0x3f),
		// 	0x80 | ((codePoint >> 6) & 0x3f),
		// 	0x80 | (codePoint & 0x3f)
		// );
	};

	for (let i = 0; i < length; i++) {
		let code = str.charCodeAt(i);
		let cod1;
		if (code < 0xd800 || code > 0xdfff) {
			add(code);
		} else if (code < 0xdc00 && (cod1 = str.charCodeAt(i + 1)) >= 0xdc00 && cod1 < 0xe000) {
			//四字节字符处理
			i++;
			add(0x10000 + (((code & 0x3ff) << 10) | (cod1 & 0x3ff)));
		} else {
			//不自行处理 不正常编码
			add(code);
		}
	}
	return bf;
}

/**
 * buffer以utf8转字符串
 *
 * @param {(ArrayBuffer | Uint8Array | number[])} buffer
 * @returns {string}
 */
function utf8Decode(buffer: ArrayBuffer | Uint8Array | number[]): string {
	let u8: Uint8Array | number[];
	let str = '';
	let index = 0;
	if (isArray(buffer) || isUint8Array(buffer)) {
		u8 = buffer;
	} else if (isArrayBuffer(buffer)) {
		u8 = new Uint8Array(buffer);
	} else {
		return String(buffer);
	}
	while (index < u8.length) {
		let c0 = u8[index++];
		if (c0 < 0x80) {
			str += String.fromCharCode(c0);
		} else if (c0 < 0xc2 || c0 > 0xfd) {
			//  多字节 `u+0080` 转第一位最小值是 1100 0010 , 0000 0000
			//  多字节 第一字节 最大位是 `1111 1101`
			// throw 'code err';
			str += ERR_CODE;
			continue;
		} else {
			let _i = index;
			let code = 0;
			let n = 0;
			if (c0 < 0xe0) {
				code |= (c0 & 31) << 6;
				n = 1;
			} else if (c0 < 0xf0) {
				n = 2;
				code |= (c0 & 15) << 12;
			} else if (c0 < 0xf8) {
				n = 3;
				code |= (c0 & 7) << 18;
			} else if (c0 < 0xfc) {
				n = 4;
				code |= (c0 & 3) << 24;
			} else {
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
			// Unicode -> Utf16
			if (code > 0xffff) {
				let _code = code - 0x10000;
				str += String.fromCharCode(0xd800 | (_code >> 10));
				str += String.fromCharCode(0xdc00 | (_code & 0x3ff));
			} else if (code > 0) {
				str += String.fromCharCode(code);
			} else {
				str += ERR_CODE;
				continue;
			}
			index = _i;
		}
	}
	return str;
}

export { utf8Encode, utf8Decode };
