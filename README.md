# Base64
[![Build Status](https://travis-ci.org/cnwhy/Base64.js.svg?branch=master)](https://travis-ci.org/cnwhy/Base64.js)
[![Coverage Status](https://coveralls.io/repos/github/cnwhy/Base64.js/badge.svg?branch=master)](https://coveralls.io/github/cnwhy/Base64.js?branch=master)  
> **Base64** `编码`,`解码` 库;

## 适用场景

- 二进制数据与 Base64 互转
- 字符串与 Base64 互转

## install
```
npm i @cnwhy/base64
```

## 为何重复造轮子?
1. 需要单纯的Base64的库,而且能在浏览器上使用; (利用node的 `Buffer` 对像的方法出局)
2. 支持字符串; (`btoa` , `atob` 只支持 [Latin1](https://zh.wikipedia.org/wiki/ISO/IEC_8859-1));
4. `Base64`编/解码本该与字符串无关, 但现有库几乎只支持字符串;
5. 能用上`Tree-shaking`, 项目一般只用需要(`encode` 或 `decode`), 我可不想copy代码;
3. javascript 字符串无损转换 (因为这一点, 现有库几乎全军覆没), [具体例子](https://github.com/cnwhy/Base64.js/wiki/javascript%E5%AD%97%E7%AC%A6%E4%B8%B2%E6%97%A0%E6%8D%9F%E8%BD%AC%E6%8D%A2%E6%8E%A2%E8%AE%A8);
6. 能应付异型`Base64`方案;



## 兼容性
通用, 对于不支持`ArrayBuffer`的环境将会用`Array`代替`Uint8Array`.  
> 什么! 你要兼容IE6?  
> 也不是不行, 把 `dist/Base64.umd.js` 最后那句 'Object.defineProperty(exports, '__esModule', { value: true });' 删了就可以了.



## 使用
```js
const Base64 = require('base64.js');

let str = 'Base64库\u{10400}\u{d800}';
console.log(str);  // Base64库𐐀�

console.log('==Base64.js==')
let b64 = Base64.encode(str);
let _str = Base64.decode(b64).toString();
console.log(b64);
console.log(str === _str) // true

console.log('==Buffer==')
let bf_b64 = Buffer.from(str).toString('base64');
let bf_str = Buffer.from(bf_b64,'base64').toString();
console.log(bf_b64);
console.log(str === bf_str); // false

//output
/*
Base64库𐐀�
==Base64.js==
QmFzZTY05bqT8JCQgO2ggA==
true
==Buffer==
QmFzZTY05bqT8JCQgO+/vQ==
false
```
> 更多使用例子可以参看[这篇](https://blog.whyoop.com/2019/06/03/new-base64/#demo);

## API

```ts
Base64 = {
	BASE64_TABLE: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	BASE64_URL_TABLE: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
	PAD: "=";
	// UTF8 编码 解码; 可做为 strEncode strDecode 参数;
	utf8Encode(str:string):Uint8Array|number[];
	utf8Decode(utf8arr:Uint8Array|number[]):string;

	//Base64 编码 解码
	encode(input:string|ArrayBuffer|Uint8Array|number[]):string;
	decode(base64str: string) => number[]|Uint8Array;

	//适用于URL的Base64 编码 解码( "_" "-" 替换 "/" "+");
	encodeURL(input:string|ArrayBuffer|Uint8Array|number[]):string;
	decodeURL(base64str: string) => number[]|Uint8Array;

	//创建自定义Base64 encode , decode 函数
	createEncode(strEncode: Function): (input: any) => string;
	createEncode(table?: string[] | string, pad?: string, strEncode?: Function): (input: any) => string;
	createDecode(strDecode: Function): (base64str: string) => Uint8Array | number[];
	createDecode(table?: string[] | string, pad?: string, strDecode?: Function): (base64str: string) => Uint8Array | number[];
}
```

## 参考资料
[https://tools.ietf.org/html/rfc4648](https://tools.ietf.org/html/rfc4648);