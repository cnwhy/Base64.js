import Benchmark from 'benchmark';
import { encode, utf8Encode } from '../../../src/Base64';
import { TextDecoder, TextEncoder } from 'util';

function getSuite() {
	return new Benchmark.Suite()
		.on('cycle', function(event: any) {
			console.log(event.target.toString());
		})
		.on('complete', function(this: any) {
			console.table(
				Array.from(this).map(v => {
					// @ts-ignore
					v.hzk = (v.hz / 1000).toFixed(2) + 'K';
					return v;
				}),
				['name', 'hzk']
			);
		});
}
const ERR_CODE = '\ufffd';
// const str = 'fdsfjsdlfs,dfsdkf sdkfa lkdfjlksdf kldsfsdkfdslfksdjfjdsfjsdlfjlksdjflkfdsfjsdlfs,dfsdkf sdkfa lkdfjlksdf kldsfsdkfdslfksdjfjdsfjsdlfjlksdjflkfdsfjsdlfs,dfsdkf sdkfa lkdfjlksdf kldsfsdkfdslfksdjfjdsfjsdlfjlksdjflkfdsfjsdlfs,dfsdkf sdkfa lkdfjlksdf kldsfsdkfdslfksdjfjdsfjsdlfjlksdjflkfdsfjsdlfs,dfsdkf sdkfa lkdfjlksdf kldsfsdkfdslfksdjfjdsfjsdlfjlksdjflkfdsfjsdlfs,dfsdkf sdkfa lkdfjlksdf kldsfsdkfdslfksdjfjdsfjsdlfjlksdjflkfdsfjsdlfs,dfsdkf sdkfa lkdfjlksdf kldsfsdkfdslfksdjfjdsfjsdlfjlksdjflk';
const str =
	'近些年来借着NodeJS的春风，前端经历了一波大洗牌式得的发展。使得前端开发在效率，质量上有了质的飞跃。可以说NodeJS已经是前端不可欠缺的技能了。但是是事实上大部分的前端对于本地安装的NodeJS的使用可能仅限于node -v和npm了😂。其实NodeJS作为真正意义上的服务端语言，在我们开发的时候可以运用NodeJS强大的模块和众多的npm包来为我们自己服务。';
const strB64 = encode(str);
const TE = new TextEncoder();
const TD = new TextDecoder();
const utf8arr = TE.encode(str);

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
//
function utf8EncodeV0_2_2(str: string): number[] | Uint8Array {
	let utf8: number[] = [];
	let codePoints: number[] = [];
	//将字符串(ucs2)转为Unicode
	for (let i = 0; i < str.length; i++) {
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
	//UTF8编码Unicode
	for (let i = 0; i < codePoints.length; i++) {
		let v = codePoints[i];
		utf8.push.apply(utf8, u2utf8(v));
	}
	return utf8;
}

function s2u8_use_array(str: string): number[] | Uint8Array {
	let bf: number[] = [];
	let length = str.length;
	let add = function(codePoint: number) {
		if (codePoint < 0x80) {
			bf.push(codePoint);
			return;
		}
		let n = 11;
		while (codePoint >= 2 ** n) {
			n += 5;
		}
		let length = Math.ceil(n / 6);
		let i = 1;
		bf.push((0xff ^ (2 ** (8 - length) - 1)) | (codePoint >> (6 * (length - 1))));
		while (i++ < length) {
			bf.push(0x80 | ((codePoint >> (6 * (length - i))) & 0x3f));
		}
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

function utf8EncodeV0_2_3(str: string): number[] | Uint8Array {
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
		if (codePoint < 0x4000000) {
			return bf.push(
				0xf8 | (codePoint >> 24),
				0x80 | ((codePoint >> 18) & 0x3f),
				0x80 | ((codePoint >> 12) & 0x3f),
				0x80 | ((codePoint >> 6) & 0x3f),
				0x80 | (codePoint & 0x3f)
			);
		}
		// bf.push(0x80 | ((codePoint >> 24) & 0x3f));
		return bf.push(
			0xfc | (codePoint >> 30),
			0x80 | ((codePoint >> 24) & 0x3f),
			0x80 | ((codePoint >> 18) & 0x3f),
			0x80 | ((codePoint >> 12) & 0x3f),
			0x80 | ((codePoint >> 6) & 0x3f),
			0x80 | (codePoint & 0x3f)
		);
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

function s2u8_use_array2(str: string): number[] | Uint8Array {
	let bf: number[] = [];
	let length = str.length;
	let add = function(codePoint: number) {
		let gitBit = function(n: number) {
			return 0x80 | ((codePoint >> (n * 6)) & 0x3f);
		};
		if (codePoint < 0x80) {
			return bf.push(codePoint);
		}
		if (codePoint < 0x800) {
			return bf.push(0xc0 | (codePoint >> 6), gitBit(0));
		}
		if (codePoint < 0x10000) {
			return bf.push(0xe0 | (codePoint >> 12), gitBit(1), gitBit(0));
		}
		if (codePoint < 0x200000) {
			return bf.push(0xf0 | (codePoint >> 18), gitBit(2), gitBit(1), gitBit(0));
		}
		if (codePoint < 0x4000000) {
			return bf.push(0xf8 | (codePoint >> 24), gitBit(3), gitBit(2), gitBit(1), gitBit(0));
		}
		// bf.push(0x80 | ((codePoint >> 24) & 0x3f));
		return bf.push(0xfc | (codePoint >> 30), gitBit(4), gitBit(3), gitBit(2), gitBit(1), gitBit(0));
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

function s2u8_use_array3(str: string): number[] | Uint8Array {
	let bf: number[] = [];
	let length = str.length;
	let add = function(codePoint: number) {
		if (codePoint < 0x80) return bf.push(codePoint);
		let arr = [];
		arr.push(0x80 | (codePoint & 0x3f));
		if (codePoint < 0x800) {
			return arr.unshift(0xc0 | (codePoint >> 6)), bf.push.apply(bf, arr);
		}
		arr.unshift(0x80 | ((codePoint >> 6) & 0x3f));
		if (codePoint < 0x10000) {
			return arr.unshift(0xe0 | (codePoint >> 12)), bf.push.apply(bf, arr);
		}
		arr.unshift(0x80 | ((codePoint >> 12) & 0x3f));
		if (codePoint < 0x200000) {
			return arr.unshift(0xf0 | (codePoint >> 18)), bf.push.apply(bf, arr);
		}
		arr.unshift(0x80 | ((codePoint >> 18) & 0x3f));
		if (codePoint < 0x4000000) {
			return arr.unshift(0xf8 | (codePoint >> 24)), bf.push.apply(bf, arr);
		}
		arr.unshift(0x80 | ((codePoint >> 24) & 0x3f));
		return arr.push(0xfc | (codePoint >> 30)), bf.push.apply(bf, arr);
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

function s2u8_use_uint8arr(str: string): number[] | Uint8Array {
	let length = str.length;
	let btLength = 0; // UTF8编码后的字节长度
	let Unicodes = []; // 字符串转Unicode;
	// 字符串转Unicode值 并 计算UTF8编码后的字节长度;
	for (let i = 0; i < length; i++) {
		let code = str.charCodeAt(i);
		let cod1;
		if (code < 0xd800 || code > 0xdfff) {
			Unicodes.push(code);
			btLength += code < 0x80 ? 1 : code < 0x800 ? 2 : 3;
		} else if (code < 0xdc00 && (cod1 = str.charCodeAt(i + 1)) >= 0xdc00 && cod1 < 0xe000) {
			//四字节字符处理
			i++;
			code = 0x10000 + (((code & 0x3ff) << 10) | (cod1 & 0x3ff));
			Unicodes.push(code);
			btLength += code < 0x10000 ? 3 : 4;
		} else {
			//不自行处理 不正常编码
			Unicodes.push(code);
			btLength += 3;
		}
	}
	let bf = new Uint8Array(btLength);
	let index = 0;
	let add = function(codePoint: number) {
		if (codePoint < 0x80) {
			// utf8.push(codePoint);
			bf[index++] = codePoint;
			return;
		}
		let n = 11;
		while (codePoint >= 2 ** n) {
			n += 5;
		}
		let length = Math.ceil(n / 6);
		let i = 1;
		// utf8.push((0xff ^ (2 ** (8 - length) - 1)) | (codePoint >> (6 * (length - 1))));
		bf[index++] = (0xff ^ (2 ** (8 - length) - 1)) | (codePoint >> (6 * (length - 1)));
		while (i++ < length) {
			// utf8.push(0x80 | ((codePoint >> (6 * (length - i))) & 0x3f));
			bf[index++] = 0x80 | ((codePoint >> (6 * (length - i))) & 0x3f);
		}
	};
	let ulength = Unicodes.length;
	for (let i = 0; i < ulength; i++) {
		add(Unicodes[i]);
	}
	// Unicodes.forEach(function(v){
	// 	add(v);
	// })
	return bf;
}

function s2u8_use_uint8arr1(str: string): number[] | Uint8Array {
	let length = str.length;
	// let btLength = 0; // UTF8编码后的字节长度
	// let Unicodes = []; // 字符串转Unicode;
	let bf = new Uint8Array(length * 4); // 直接申请可能最长的字节长度
	let index = 0;
	let add = function(codePoint: number) {
		if (codePoint < 0x80) {
			// utf8.push(codePoint);
			bf[index++] = codePoint;
			return;
		}
		let n = 11;
		while (codePoint >= 2 ** n) {
			n += 5;
		}
		let length = Math.ceil(n / 6);
		let i = 1;
		// utf8.push((0xff ^ (2 ** (8 - length) - 1)) | (codePoint >> (6 * (length - 1))));
		bf[index++] = (0xff ^ (2 ** (8 - length) - 1)) | (codePoint >> (6 * (length - 1)));
		while (i++ < length) {
			// utf8.push(0x80 | ((codePoint >> (6 * (length - i))) & 0x3f));
			bf[index++] = 0x80 | ((codePoint >> (6 * (length - i))) & 0x3f);
		}
	};
	// 字符串转Unicode值 并 计算UTF8编码后的字节长度;
	for (let i = 0; i < length; i++) {
		let code = str.charCodeAt(i);
		let cod1;
		if (code < 0xd800 || code > 0xdfff) {
			add(code);
			// Unicodes.push(code);
			// btLength += code < 0x80 ? 1 : code < 0x800 ? 2 : 3;
		} else if (code < 0xdc00 && (cod1 = str.charCodeAt(i + 1)) >= 0xdc00 && cod1 < 0xe000) {
			//四字节字符处理
			i++;
			add(0x10000 + (((code & 0x3ff) << 10) | (cod1 & 0x3ff)));
			// Unicodes.push(code);
			// btLength += code < 0x10000 ? 3 : 4;
		} else {
			//不自行处理 不正常编码
			add(code);
			// Unicodes.push(code);
			// btLength += 3;
		}
	}
	return bf.slice(0, index);
}

function utf8DecodeV0_2_3(u8: any) {
	let str = '';
	let index = 0;
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

function utf8Decode1(u8: any) {
	let str = '';
	let index = 0;
	function setChar() {
		let _i = index;
		let c0 = u8[_i++];
		try {
			if (c0 < 0x80) {
				str += String.fromCharCode(c0);
				index = _i;
			} else if (c0 < 0xc2 || c0 > 0xfd) {
				//  多字节 `u+0080` 转第一位最小值是 1100 0010 , 0000 0000
				//  多字节 第一字节 最大位是 `1111 1101`
				throw 'code err';
			} else {
				let code = 0;
				let n = 0;
				if (c0 >= 0xfc) {
					n = 5;
					code |= (c0 & 1) << 30;
				} else if (c0 >= 0xf8) {
					n = 4;
					code |= (c0 & 3) << 24;
				} else if (c0 >= 0xf0) {
					n = 3;
					code |= (c0 & 7) << 18;
				} else if (c0 >= 0xe0) {
					n = 2;
					code |= (c0 & 15) << 12;
				} else {
					code |= (c0 & 31) << 6;
					n = 1;
				}
				while (n--) {
					let c = u8[_i++];
					if (c >> 6 != 2) throw 'code err';
					code |= (c & 0x3f) << (n * 6);
				}
				// Unicode -> Utf16
				if (code > 0xffff) {
					let _code = code - 0x10000;
					str += String.fromCharCode(0xd800 | (_code >> 10));
					str += String.fromCharCode(0xdc00 | (_code & 0x3ff));
				} else {
					str += String.fromCharCode(code);
				}
				index = _i;
			}
		} catch (e) {
			// 不正常的UTF8字节数据, 替换为 �
			// 注:此处与utf8Encode的不正常编码不同;
			// UTF8编码时不考虑代理区, UTF16需要考虑代理区;
			str += ERR_CODE;
			index++;
		}
	}
	while (index < u8.length) {
		setChar();
	}
	return str;
}

// 
function utf8DecodeV0_2_4(u8: any) {
	let str = '';
	let index = 0;
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
					// throw 'code err';
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

function utf8Decode3(u8: any) {
	let str = '';
	let index = 0;
	while (index < u8.length) {
		let c0 = u8[index++];
		if (c0 < 0x80) {
			str += String.fromCharCode(c0);
			continue;
		}
		if (c0 >= 0xc2 && c0 <= 0xfd) {
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
					// throw 'code err';
					code = -1;
					break;
				}
				code |= (c & 0x3f) << (n * 6);
			}
			// Unicode -> Utf16
			if (code > 0) {
				if (code > 0xffff) {
					let _code = code - 0x10000;
					str += String.fromCharCode(0xd800 | (_code >> 10));
					str += String.fromCharCode(0xdc00 | (_code & 0x3ff));
				} else {
					str += String.fromCharCode(code);
				}
				index = _i;
				continue;
			}
		}
		str += ERR_CODE;
	}
	return str;
}

console.log('TextEncoder', strB64 == encode(TE.encode(str)));
console.log('utf8EncodeV0_2_2', strB64 == encode(utf8EncodeV0_2_2(str)));
console.log('s2u8_use_array', strB64 == encode(s2u8_use_array(str)));
console.log('utf8EncodeV0_2_3', strB64 == encode(utf8EncodeV0_2_3(str)));
console.log('s2u8_use_array2', strB64 == encode(s2u8_use_array2(str)));
console.log('s2u8_use_array3', strB64 == encode(s2u8_use_array3(str)));
console.log('s2u8_use_uint8arr', strB64 == encode(s2u8_use_uint8arr(str)));
console.log('s2u8_use_uint8arr1', strB64 == encode(s2u8_use_uint8arr1(str)));

console.log('TextDecoder', str == TD.decode(utf8arr));
console.log('utf82string', str == utf8DecodeV0_2_3(utf8arr));
console.log('utf8Decode1', str == utf8Decode1(utf8arr));
console.log('utf8DecodeV0_2_4', str == utf8DecodeV0_2_4(utf8arr));
console.log('utf8Decode3', str == utf8Decode3(utf8arr));

// console.log(encode_use_array1(str) == encode_te(str));
// console.log(encode_use_array2(str) == encode_te(str));
// console.log(encode(str))
// console.log(encode_te(str))

getSuite()
	.add('use', function() {
		utf8Encode(str);
	})
	.add('TextEncoder', function() {
		TE.encode(str);
	})
	.add('utf8EncodeV0_2_2', function() {
		utf8EncodeV0_2_2(str);
	})
	.add('s2u8_use_array', function() {
		s2u8_use_array(str);
	})
	.add('utf8EncodeV0_2_3', function() {
		utf8EncodeV0_2_3(str);
	})
	.add('s2u8_use_array2', function() {
		s2u8_use_array2(str);
	})
	.add('s2u8_use_array3', function() {
		s2u8_use_array3(str);
	})
	// .add('s2u8_use_uint8arr', function() {
	// 	s2u8_use_uint8arr(str);
	// })
	// .add('s2u8_use_uint8arr1', function() {
	// 	s2u8_use_uint8arr1(str);
	// })
	.run();

getSuite()
	.add('TextDecoder', function() {
		var s = TD.decode(utf8arr);
	})
	// .add('utf8DecodeV0_2_3', function() {
	// 	var s = utf8DecodeV0_2_3(utf8arr);
	// })
	// .add('utf8Decode1', function() {
	// 	var s = utf8Decode1(utf8arr);
	// })
	.add('utf8DecodeV0_2_4', function() {
		var s = utf8DecodeV0_2_4(utf8arr);
	})
	.add('utf8Decode3', function() {
		var s = utf8Decode3(utf8arr);
	})
	.run();
