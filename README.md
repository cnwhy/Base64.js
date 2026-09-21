# Base64
[![Build Status](https://travis-ci.org/cnwhy/Base64.js.svg?branch=master)](https://travis-ci.org/cnwhy/Base64.js)
[![Coverage Status](https://coveralls.io/repos/github/cnwhy/Base64.js/badge.svg?branch=master)](https://coveralls.io/github/cnwhy/Base64.js?branch=master)  
> **Base64** `编码`,`解码` 库;

## 适用场景

- 二进制数据与 Base64 互转
- 字符串与 Base64 互转

## 安装
```
npm i @cnwhy/base64
```

## 为何重复造轮子?
1. 需要单纯的Base64的库,而且能在浏览器上使用; (利用node的 `Buffer` 对像的方法出局)
2. 支持字符串; (`btoa` , `atob` 只支持 [Latin1](https://zh.wikipedia.org/wiki/ISO/IEC_8859-1));
3. javascript 字符串无损转换 (因为这一点, 现有库几乎全军覆没), [具体例子](https://github.com/cnwhy/Base64.js/wiki/javascript%E5%AD%97%E7%AC%A6%E4%B8%B2%E6%97%A0%E6%8D%9F%E8%BD%AC%E6%8D%A2%E6%8E%A2%E8%AE%A8);
4. `Base64` 编/解码本该与字符串无关, 但现有库几乎只支持字符串;
5. 能用上 `Tree-shaking`, 项目一般只用需要的(`encode` 或 `decode`), 我可不想 copy 代码;
6. 能应付异型 `Base64` 方案;

## 兼容性
通用。对于不支持 `ArrayBuffer` 的环境，将使用普通 `Array` 代替 `Uint8Array`。

## 模块

同时支持 CommonJS 和 ESM：

```js
const { encode, decode } = require('@cnwhy/base64');
```

```js
import { encode, decode } from '@cnwhy/base64';
```

## 使用
```js
const { encode, decode, createEncode, createDecode } = require('@cnwhy/base64');

// 1. 字符串 
let str = '中国𐄡美国';
let b64 = encode(str);
console.log(b64);
let _str = decode(b64).toString(); // 必须调用toString()方法还原为字符串.
console.log('string:', str === _str);  // true

// 2. 字节数组
// let buffer = fs.readFileSync('./test.js');
let buffer = new Uint8Array([0,255,127,33,0,5]);
let fb64 = encode(buffer); // encode 支持 Buffer、字符串、ArrayBuffer、Uint8Array 和 number[]
let fu8arr = decode(fb64); // decode 返回 Uint8Array 或 number[]
console.log('buffer:', Array.from(buffer).join() == Array.from(fu8arr).join());

// 3. 自定义 Base64 转换方法

// 自定义码表与补位符
const TABLE = 'xQh}s7*y~A|nkj4Bf%z1R,P+)mMS{(&EWCKegp6r!OX</LuY-l9^ZJ#cTU[vHda$'; 
const PAD = '.'; 

// 自定义字符串编码/解码方法
const Utf16Encode = function(str) {
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

//output:
/*
5Lit5Zu98JCEoee+juWbvQ==
string: true
buffer: true

自定义转码:
nRvd,W})~(#4E$JP
my: true
*/
```

## API

```ts
const BASE64_TABLE: string;
const BASE64_URL_TABLE: string;
const PAD: string;

function utf8Encode(str: string): Uint8Array | number[];
function utf8Decode(input: ArrayBuffer | Uint8Array | number[]): string;

function encode(input: string | ArrayBuffer | Uint8Array | number[]): string;
function decode(base64str: string): Uint8Array | number[];
function encodeURL(input: string | ArrayBuffer | Uint8Array | number[]): string;
function decodeURL(base64str: string): Uint8Array | number[];

function createEncode(strEncode: Function): (input: any) => string;
function createEncode(
  table?: string[] | string,
  pad?: string,
  strEncode?: Function
): (input: any) => string;
function createDecode(strDecode: Function): (base64str: string) => Uint8Array | number[];
function createDecode(
  table?: string[] | string,
  pad?: string,
  strDecode?: Function
): (base64str: string) => Uint8Array | number[];
```

其中 `encode` 和 `encodeURL` 接受字符串、`ArrayBuffer`、`Uint8Array`、`number[]` 以及 Node.js `Buffer`。`decode` 和 `decodeURL` 返回字节数组；使用字符串编码器创建的解码函数会重写返回值的 `toString()`，便于还原字符串。

### URL-safe Base64

`encodeURL` 和 `decodeURL` 使用 URL-safe 字符表，以 `-` 和 `_` 分别替换标准 Base64 中的 `+` 和 `/`：

```js
const { encodeURL, decodeURL } = require('@cnwhy/base64');

const value = encodeURL('hello world');
const text = decodeURL(value).toString();
```

## 参考资料
[https://tools.ietf.org/html/rfc4648](https://tools.ietf.org/html/rfc4648);