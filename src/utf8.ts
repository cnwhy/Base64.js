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

export { utf8Encode, utf8Decode };
