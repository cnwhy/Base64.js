// @ts-nocheck
import test from 'ava';
import * as Base64 from '../src/Base64.ts';
import * as GBK from 'gbk.js';
import { split } from 'ts-node';

//正常字符
let strs = [
	['sfsf2342342*Y*&^&()*)', '普通字符串'],
	['火车头aĉc', '混合字符串1'],
	['123火车头aĉc', '混合字符串2'],
	['123火车头aĉc车头', '混合字符串3'],
	['a\u{10126}ĉc车头', '带4字节的字符串']
];
let strs1 = [['a\ud812bc', '非正常字符串1']];

function testFn(str, buffer, exp) {
	test.serial(`type string ${exp}`, t => {
		t.plan(3);
		t.true(typeof str === 'string');
		let b64 = Base64.encode(str);
		// t.log(Base64.decode(b64),buffer);
		// t.log(Base64.decode(b64).tostring(),str);

		t.is(b64, buffer.toString('base64'));
		t.is(Base64.decode(b64).toString(), buffer.toString());
	});
	test.serial(`type buffer ${exp}`, t => {
		t.plan(3);
		t.true(buffer instanceof Buffer);
		let b64 = Base64.encode(buffer);
		t.is(b64, buffer.toString('base64'));
		t.is(Base64.decode(b64).toString(), buffer.toString());
	});
	test.serial(`type Array ${exp}`, t => {
		t.plan(3);
		let bf = Array.from(buffer);
		t.true(Array.isArray(bf));
		// @ts-nocheck
		let b64 = Base64.encode(bf);
		t.is(b64, buffer.toString('base64'));
		let darr = Array.from(Base64.decode(b64));
		t.is(Base64.utf8Decode(darr), buffer.toString());
	});
	test.serial(`type Uint8Array ${exp}`, t => {
		t.plan(3);
		let bf = new Uint8Array(Array.from(buffer));
		t.true(bf instanceof Uint8Array);
		let b64 = Base64.encode(bf);
		t.is(b64, buffer.toString('base64'));
		t.is(Base64.decode(b64).toString(), buffer.toString());
	});
	test.serial(`type ArrayBuffer ${exp}`, t => {
		t.plan(3);
		let bf = new Uint8Array(Array.from(buffer));
		// console.log('=======',bf);
		t.true(bf.buffer instanceof ArrayBuffer);
		let b64 = Base64.encode(bf.buffer);
		t.is(b64, buffer.toString('base64'));
		t.is(Base64.decode(b64).toString(), buffer.toString());
	});
}

//非正常字符串 编码解码;
function testFn1(str, exp) {
	test.serial(`type ${exp}`, t => {
		let b64 = Base64.encode(str);
		t.is(Base64.decode(b64).toString(), str);
	});
}

strs.map(arr => {
	let [str, exp] = arr;
	testFn(str, Buffer.from(str), exp);
});

strs1.map(arr => {
	let [str, exp] = arr;
	testFn1(str, exp);
});

test.serial(`Base64.decode 非正常base64字符串`, t => {
	t.plan(2);
	t.throws(() => {
		Base64.decode('dfj}');
	});
	t.throws(() => {
		Base64.decode('dfjaf');
	});
});

test.serial(`Base64.utf8Decode 参数测试`, t => {
	t.plan(4);
	let str = 'Base64.utf8Decode 参数测试';
	let bf = Buffer.from(str, 'utf8');
	let ab = bf.buffer.slice(bf.byteOffset, bf.byteOffset + bf.byteLength);
	let arr = Array.from(bf);
	let u8 = new Uint8Array(arr);
	t.is(Base64.utf8Decode(bf), str);
	t.is(Base64.utf8Decode(ab), str);
	t.is(Base64.utf8Decode(arr), str);
	t.is(Base64.utf8Decode(u8), str);
});

test.serial(`Base64.utf8Decode utf8数据错误`, t => {
	t.plan(4);
	let arr1 = [0xc1];
	let arr2 = [0xc3];
	let arr3 = [0xc3, 0x7f, 0xffff, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80];
	t.is(Base64.utf8Decode(arr1), '\ufffd');
	t.is(Base64.utf8Decode(arr2), '\ufffd');
	t.is(Base64.utf8Decode(arr3), '\ufffd\u007f\ufffd\ufffd\ufffd\ufffd\ufffd\ufffd\ufffd');
	t.is(Base64.utf8Decode({ toString: () => '123' }), '123');
});

// test.serial(`2进制数据编码/解码`, t => {
// 	var bf = new Buffer(100);
// 	var bf1 = Base64.decode(Base64.encode(bf));
// 	t.deepEqual(Array.from(bf),Array.from(bf1));
// })

test.serial(`2进制数据编码/解码`, t => {
	var bf = Buffer.alloc(100);
	for (let i = 0; i < bf.length; i++) {
		bf[i] = (Math.random() * 256) >> 0;
	}
	var bf1 = Base64.decode(Base64.encode(bf));
	t.deepEqual(Array.from(bf), Array.from(bf1));
});

test.serial(`乱码字符串编码/解码`, t => {
	let loop = 10000;
	t.plan(loop);
	function getStr() {
		let str = '';
		for (let i = 0; i < 100; i++) {
			str += String.fromCodePoint((Math.random() * 0x10ffff) >> 0);
		}
		return str;
	}
	for (let i = 0; i < loop; i++) {
		let str = getStr();
		let str1 = Base64.decode(Base64.encode(str)).toString();
		t.is(str, str1);
	}
	// t.deepEqual(Array.from(str),Array.from(bf1));
});

test.serial(`自定义 参数检查`, t => {
	t.plan(8);
	t.throws(() => {
		Base64.createEncode('123', null, GBK.encode);
	});
	t.throws(() => {
		Base64.createEncode({}, null, GBK.encode);
	});
	t.throws(() => {
		Base64.createEncode(Base64.BASE64_TABLE.replace('0', '1'), null, GBK.encode);
	});
	t.throws(() => {
		Base64.createEncode(Base64.BASE64_TABLE, '==', GBK.encode);
	});
	t.throws(() => {
		Base64.createEncode(Base64.BASE64_TABLE, 'a', GBK.encode);
	});
	let table = Base64.BASE64_TABLE.split('');
	table[0] = table[0] + table[0];
	t.throws(() => {
		Base64.createEncode(table, 'a', GBK.encode);
	});

	let myBase64Encode = Base64.createEncode();
	let myBase64Decode = Base64.createDecode();
	let arr = [1, 2, 3];
	let k = myBase64Encode([1, 2, 3]);
	let _arr = myBase64Decode(k);
	t.deepEqual(arr,Array.from(_arr));
	t.throws(() => {
		myBase64Encode('123');
	});
});

test.serial(`GBK 编码,解码`, t => {
	const Base64EncodeGBK = Base64.createEncode(null, null, GBK.encode);
	const Base64DecodeGBK = Base64.createDecode(null, null, GBK.decode);
	const str = 'GBK 编码,解码';
	t.is(str, Base64DecodeGBK(Base64EncodeGBK(str)).toString());
});

test.serial(`UTF16 编码,解码`, t => {
	const Base64EncodeU16 = Base64.createEncode(null, null, function(str) {
		let cods = str.split('').map(s => s.charCodeAt(0));
		return new Uint8Array(new Uint16Array(cods).buffer);
	});
	const Base64DecodeU16 = Base64.createDecode(null, null, function(arr) {
		let u16 = Array.from(new Uint16Array(arr.buffer));
		return u16.map(c => String.fromCharCode(c)).join('');
	});
	const str = 'UTF16 编码,解码';
	t.is(str, Base64DecodeU16(Base64EncodeU16(str)).toString());
});
// test.serial(`Base64.encode 非正常字符串`, t => {
// 	t.plan(2);
// 	let str = "a\ud801\u{10046}cd"
// 	let b64 = Base64.encode(str);
// 	let str1 = Base64.decode(b64).toString();

// })
