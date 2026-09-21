import Benchmark from 'benchmark';
import { encode, decode, createEncode } from '../../src/main';
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
// const str = 'fdsfjsdlfs,dfsdkf sdkfa lkdfjlksdf kldsfsdkfdslfksdjfjdsfjsdlfjlksdjflkfdsfjsdlfs,dfsdkf sdkfa lkdfjlksdf kldsfsdkfdslfksdjfjdsfjsdlfjlksdjflkfdsfjsdlfs,dfsdkf sdkfa lkdfjlksdf kldsfsdkfdslfksdjfjdsfjsdlfjlksdjflkfdsfjsdlfs,dfsdkf sdkfa lkdfjlksdf kldsfsdkfdslfksdjfjdsfjsdlfjlksdjflkfdsfjsdlfs,dfsdkf sdkfa lkdfjlksdf kldsfsdkfdslfksdjfjdsfjsdlfjlksdjflkfdsfjsdlfs,dfsdkf sdkfa lkdfjlksdf kldsfsdkfdslfksdjfjdsfjsdlfjlksdjflkfdsfjsdlfs,dfsdkf sdkfa lkdfjlksdf kldsfsdkfdslfksdjfjdsfjsdlfjlksdjflk';
const str =
	'近些年来借着NodeJS的春风，前端经历了一波大洗牌式得的发展。使得前端开发在效率，质量上有了质的飞跃。可以说NodeJS已经是前端不可欠缺的技能了。但是是事实上大部分的前端对于本地安装的NodeJS的使用可能仅限于node -v和npm了😂。其实NodeJS作为真正意义上的服务端语言，在我们开发的时候可以运用NodeJS强大的模块和众多的npm包来为我们自己服务。';
// const str = "abc";
const TE = new TextEncoder();
const encode_te = createEncode(function(s: string) {
	return TE.encode(s);
});
const encode_u16 = createEncode(function(s: string) {
	let arr = [];
	let max = s.length;
	for (let i = 0; i < max; i++) {
		let code = str.charCodeAt(i);
		arr.push(code & 0xff);
		arr.push(code >> 8);
	}
	// let cods = str.split('').map(s => s.charCodeAt(0));
	// return TE.encode(s);
	return arr;
});

// const b64encode_te = createEncode(encode_te);
const b64encode_u16 = createEncode(encode_u16);
const b64encode_buffer = function(str: string) {
	return Buffer.from(str).toString('base64');
};

var b64 = encode(str);
console.log('encode_te', encode_te(str) == b64);
console.log('b64encode_buffer', b64encode_buffer(str) == b64);

getSuite()
	.add('encode', function() {
		var k = encode(str);
	})
	.add('encode_te', function() {
		var k = encode_te(str);
	})
	.add('b64encode_buffer', function() {
		var k = b64encode_buffer(str);
	})
	.run();
