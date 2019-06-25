import Benchmark from 'benchmark';
import { encode, decode } from '../../../src/Base64';
function getSuite() {
	return new Benchmark.Suite()
		.on('cycle', function(event: any) {
			console.log(event.target.toString());
		})
		.on('complete', function(this: any) {
			console.log(`字节长度 ${Max} :`);
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

const TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('');
const TABLE_JOIN = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const PAD = '=';
const Max = 64;
const Data: number[] = [];
const Data1: number[] = [];
const Data2: number[] = [];
for (let i = 0; i < Max; i++) {
	Data.push((Math.random() * 256) >> 0);
}
for (let i = 0; i < Max + 1; i++) {
	Data1.push((Math.random() * 256) >> 0);
}
for (let i = 0; i < Max + 2; i++) {
	Data2.push((Math.random() * 256) >> 0);
}
const DataB64 = encode(Data);
const DataB64_1 = encode(Data1);
const DataB64_2 = encode(Data2);

const getV = function(char: string): number {
	let index = TABLE_JOIN.indexOf(char);
	if (index == -1) throw new TypeError(`"${char}" not base64 char`);
	return index;
};
const getPads = function(base64Str: string): number {
	let index = base64Str.length;
	let pads = 0;
	while (index-- > 0 && base64Str.charAt(index) === PAD) {
		pads++;
	}
	return pads;
};
function B64DecodeV0_2_3(base64Str: string): Uint8Array | number[] {
	// base64Str = base64Str.trim();
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
	// toString && (buffer.toString = toString);
	return buffer;
}

const getV1 = function(char: string): number {
	if (char === PAD) return -2;
	return TABLE_JOIN.indexOf(char);
};

function B64Decode(base64Str: string) {
	let index = 0;
	let i = 0;
	let sLength = base64Str.length;
	let buffer = [];
	while (index < sLength) {
		let c0 = TABLE_JOIN.indexOf(base64Str.charAt(index++));
		let c1 = TABLE_JOIN.indexOf(base64Str.charAt(index++));
		let c2 = TABLE_JOIN.indexOf(base64Str.charAt(index++));
		let c3 = TABLE_JOIN.indexOf(base64Str.charAt(index++));
		buffer[i++] = ((c0 << 2) | (c1 >> 4)) & 0xff;
		if (c2 == -1) break;
		buffer[i++] = ((c1 << 4) | (c2 >> 2)) & 0xff;
		if (c3 == -1) break;
		buffer[i++] = ((c2 << 6) | c3) & 0xff;
	}
	return buffer;
}

function B64Decode1(base64Str: string): Uint8Array | number[] {
	// base64Str = base64Str.trim();
	let length = base64Str.length;
	let indexMax = length - getPads(base64Str);
	let mc4 = indexMax % 4;
	if (mc4 === 1) throw new TypeError('The parameter is not a base64 string!');
	let buffer = new Uint8Array(Math.floor((indexMax * 6) / 8));
	let index = 0;
	let i = 0;
	let next = function() {
		let char = base64Str.charAt(i++)
		let index = TABLE_JOIN.indexOf(char);
		if (index == -1) throw new TypeError(`"${char}" not base64 char`);
		return index;
	};
	for (let loopLength = indexMax - mc4; i < loopLength; ) {
		let [c0, c1, c2, c3] = [next(), next(), next(), next()];
		buffer[index++] = (c0 << 2) | (c1 >> 4);
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
	// toString && (buffer.toString = toString);
	return buffer;
}


function test(fn: any) {
	return (
		Data.join(',') == fn(DataB64) && Data1.join(',') == fn(DataB64_1) && Data2.join(',') == fn(DataB64_2)
	);
}

console.log('B64DecodeV0_2_3', test(B64DecodeV0_2_3));
console.log('B64Decode', test(B64Decode));
console.log('B64Decode1', test(B64Decode1));
// console.log(Data,B64Decode(DataB64));

DataB64;

getSuite()
	.add('B64DecodeV0_2_3', function() {
		var a1 = B64DecodeV0_2_3(DataB64);
		var a2 = B64DecodeV0_2_3(DataB64_1);
		var a3 = B64DecodeV0_2_3(DataB64_2);
	})
	.add('B64Decode', function() {
		var a1 = B64Decode(DataB64);
		var a2 = B64Decode(DataB64_1);
		var a3 = B64Decode(DataB64_2);
	})
	.add('B64Decode1', function() {
		var a1 = B64Decode1(DataB64);
		var a2 = B64Decode1(DataB64_1);
		var a3 = B64Decode1(DataB64_2);
	})
	.run();
