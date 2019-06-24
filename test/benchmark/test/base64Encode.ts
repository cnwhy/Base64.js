import Benchmark from 'benchmark';
import { encode } from '../../../src/Base64';
function getSuite() {
	return new Benchmark.Suite()
		.on('cycle', function(event: any) {
			console.log(event.target.toString());
		})
		.on('complete', function(this: any) {
			console.log(`字节长度 ${Max} :`)
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
const PAD = '=';
const Max = 512;
const Data: number[] = [];
const Data1: number[] = [];
const Data2: number[] = [];
for (let i = 0; i < Max; i++) {
	Data.push((Math.random() * 256) >> 0);
}
for (let i = 0; i < Max+1; i++) {
	Data1.push((Math.random() * 256) >> 0);
}
for (let i = 0; i < Max+2; i++) {
	Data2.push((Math.random() * 256) >> 0);
}
const DataB64 = encode(Data);

function encode1(_u8arr: Uint8Array | number[]): string {
	let base64 = '';
	let bitLength = Math.ceil((_u8arr.length * 8) / 6);
	let str64Length = Math.ceil(_u8arr.length / 3) * 4;
	let codes = new Array(str64Length);
	let index = 0;
	let a0, a1, a2;
	for (let i = 0; i < _u8arr.length; ) {
		a0 = _u8arr[i++];
		a1 = _u8arr[i++];
		a2 = _u8arr[i++];
		codes[index++] = a0 >> 2;
		codes[index++] = ((a0 << 4) | (a1 >> 4)) & 0x3f;
		codes[index++] = ((a1 << 2) | (a2 >> 6)) & 0x3f;
		codes[index++] = a2 & 0x3f;
	}
	for (let i = 0; i < codes.length; i++) {
		const code = codes[i];
		base64 += i > bitLength - 1 ? PAD : TABLE[code];
	}
	return base64;
}

function encode1_(_u8arr: Uint8Array | number[]): string {
	var base64 = '';
	var _l = _u8arr.length % 3;
	var padLength = _l ? _l === 2 ? 1 : 2 : 0;
	var loopLength = _u8arr.length - _l;
	var a0, a1, a2, i = 0;
	while (i < loopLength) {
		a0 = _u8arr[i++];
		a1 = _u8arr[i++];
		a2 = _u8arr[i++];
		base64 += TABLE[a0 >> 2];
		base64 += TABLE[((a0 << 4) | (a1 >> 4)) & 0x3f];
		base64 += TABLE[((a1 << 2) | (a2 >> 6)) & 0x3f];
		base64 += TABLE[a2 & 0x3f];
	}
	if (padLength) {
		a0 = _u8arr[i++];
		a1 = _u8arr[i++] || 0;
		base64 += TABLE[a0 >> 2];
		base64 += TABLE[((a0 << 4) | (a1 >> 4)) & 0x3f];
		base64 += (padLength === 2 ? PAD + PAD : TABLE[(a1 << 2) & 0x3f] + PAD);
	}
	return base64;
}

function encode1__(_u8arr: Uint8Array | number[]): string {
	var base64 = '';
	var loopLength = _u8arr.length;
	var a0, a1, a2, i = 0;
	while (i < loopLength) {
		a0 = _u8arr[i++];
		a1 = _u8arr[i++];
		a2 = _u8arr[i++];
		base64 += TABLE[a0 >> 2];
		base64 += TABLE[((a0 << 4) | (a1 >> 4)) & 0x3f];
		if(a2 != undefined){
			base64 += TABLE[((a1 << 2) | (a2 >> 6)) & 0x3f];
			base64 += TABLE[a2 & 0x3f];
		}else if(a1 == undefined){
			base64 += PAD + PAD
		}else{
			base64 += TABLE[(a1 << 2) & 0x3f] + PAD;
		}
	}
	return base64;
}
function encode1_1(_u8arr: Uint8Array | number[]): string {
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
}

const TABLE1 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='.split('');
function encode2(input: Uint8Array | number[]): string {
	var output = '';
	var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
	var i = 0;
	while (i < input.length) {
		chr1 = input[i++];
		chr2 = input[i++];
		chr3 = input[i++];
		enc1 = chr1 >> 2;
		enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
		enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
		enc4 = chr3 & 63;
		if (isNaN(chr2)) {
			enc3 = enc4 = 64;
		} else if (isNaN(chr3)) {
			enc4 = 64;
		}
		output = output + TABLE1[enc1] + TABLE1[enc2] + TABLE1[enc3] + TABLE1[enc4];
	}
	return output;
}

function encode2_(input: Uint8Array | number[]): string {
	var output = '';
	var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
	var _l = input.length % 3;
	var padLength = _l ? _l === 2 ? 1 : 2 : 0;
	var loopLength = input.length - _l;
	var i = 0;
	while (i < loopLength) {
		chr1 = input[i++];
		chr2 = input[i++];
		chr3 = input[i++];
		enc1 = chr1 >> 2;
		enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
		enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
		enc4 = chr3 & 63;
		output = output + TABLE[enc1] + TABLE[enc2] + TABLE[enc3] + TABLE[enc4];
	}
	if (padLength) {
		chr1 = input[i++];
		chr2 = input[i++];
		enc1 = chr1 >> 2;
		enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
		output = output + TABLE[enc1] + TABLE[enc2];
		output += (padLength === 2 ? PAD + PAD : TABLE[((chr2 & 15) << 2)] + PAD);
	}
	return output;
}

console.log('encode1', DataB64 == encode1(Data));
console.log('encode2', DataB64 == encode2(Data));
console.log('encode1_', DataB64 == encode1_(Data));
console.log('encode1_1', DataB64 == encode1_1(Data));
console.log('encode2_', DataB64 == encode2_(Data));
console.log('encode1__', DataB64 == encode1__(Data));

getSuite()
	.add('encode1 old', function() {
		var k = encode1(Data);
		var k1 = encode1(Data1);
		var k2 = encode1(Data2);
	})
	.add('encode1_', function() {
		var k = encode1_(Data);
		var k1 = encode1_(Data1);
		var k2 = encode1_(Data2);
	})
	.add('encode1_1', function() {
		var k = encode1_1(Data);
		var k1 = encode1_1(Data1);
		var k2 = encode1_1(Data2);
	})
	.add('encode1__', function() {
		var k = encode1__(Data);
		var k1 = encode1__(Data1);
		var k2 = encode1__(Data2);
	})
	.add('encode2', function() {
		var k = encode2(Data);
		var k1 = encode2(Data1);
		var k2 = encode2(Data2);
	})
	.add('encode2_', function() {
		var k = encode2_(Data);
		var k1 = encode2_(Data1);
		var k2 = encode2_(Data2);
	})

	.run();
