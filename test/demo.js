const { encode, decode, createEncode, createDecode } = require('../dist/Base64.umd.js');
// 1. 字符串 
let str = '中国𐄡美国';
let b64 = encode(str);
console.log(b64);
let _str = decode(b64).toString(); // 必须调用toString()方法还原为字符串.
console.log('string:', str === _str);  // true

// 2. 字节数组
// let buffer = fs.readFileSync('./test.js');
let buffer = new Uint8Array([0,255,127,33,0,5]);
let fb64 = encode(buffer); // encode支持 Buffer , Stirng, Array<number>
let fu8arr = decode(fb64); // decode 返回Uint8Array对像
console.log('buffer:', Array.from(buffer).join() == Array.from(fu8arr).join());

// 3. 自定义 Base64 转换方法

// 自定义码表与补位符
const TABLE = 'xQh}s7*y~A|nkj4Bf%z1R,P+)mMS{(&EWCKegp6r!OX</LuY-l9^ZJ#cTU[vHda$'; 
const PAD = '.'; 

// 自定义字符串编码/解码方法
const Utf16Encode = function(str) { //
	let cods = str.split('').map(s => s.charCodeAt(0));
	return new Uint8Array(new Uint16Array(cods).buffer);
}
const Utf16Decode = function(arr) {
	let u16 = Array.from(new Uint16Array(arr.buffer));
	return u16.map(c => String.fromCharCode(c)).join('');
}

//创建自定义转码函数
const myEncode = createEncode(TABLE,PAD,Utf16Encode);
const myDecode = createDecode(TABLE,PAD,Utf16Decode);

console.log('\n自定义转码:');
let myb64 = myEncode(str);
console.log(myb64);
let my_str = myDecode(myb64).toString(); // 调用toString() 会用 Utf16Decode 方法将字节数组转为字符串
console.log('my:',str == my_str);