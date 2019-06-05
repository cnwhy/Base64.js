// import Base64 from './Base64';
const Base64 = require('../');
const GBK = require('gbk.js');

let str = 'Base64库\u{10400}\u{d800}';
console.log(str); // Base64库𐐀�

console.log('==Base64.js==');
let b64 = Base64.encode(str);
let _str = Base64.decode(b64).toString();
console.log(b64);
console.log(str === _str); // true

console.log('==Buffer==');
let bf_b64 = Buffer.from(str).toString('base64');
let bf_str = Buffer.from(bf_b64, 'base64').toString();
let bf_str1 = Buffer.from(b64, 'base64').toString();
console.log(bf_b64);
console.log(bf_str1);
console.log(str === bf_str); // false
console.log(bf_str1 === bf_str); // false

console.log('== create ==');
var encode_UTF8 = Base64.encode;
var encode_UTF16 = Base64.createEncode(function(str) {
	let cods = str.split('').map(s => s.charCodeAt(0));
	return new Uint8Array(new Uint16Array(cods).buffer);
});
var encode_GBK = Base64.createEncode(GBK.encode);

var decode_UTF8 = Base64.decode;
var decode_UTF16 = Base64.createDecode(function(arr) {
	let u16 = Array.from(new Uint16Array(arr.buffer));
	return u16.map(c => String.fromCharCode(c)).join('');
});
var decode_GBK = Base64.createDecode(GBK.decode);

var encodes = [
	['UTF8', encode_UTF8, decode_UTF8],
	['UTF16', encode_UTF16, decode_UTF16],
	['GBK', encode_GBK, decode_GBK]
];
var thestr = 'hello world! \u{10121} 我认为javascript才是世界上最好的语言.';
encodes.forEach(([name, encode, decode]) => {
	var b64 = encode(thestr);
	console.log(name + ':\n' + b64 + ':\n' + decode(b64).toString());
});
