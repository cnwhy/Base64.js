**为什么重复造轮子?**
1. `btoa` , `atob` 只支持 `Latin1` 字符.
2. 常用的的 Base64 编码库处理字符串时会**主动**修改错误(空)编码字符, 导致解码的数据与原数据不一至.  
   比如用 nodjs 中的 `Buffer`:
    ```js
    var s = '\ud800'
    var b64 = Buffer.from(s).toString('base64');
    var _s = Buffer.from(b64,'base64').toString();
    console.log(s === _s);  //false
    ```
3. `Base64`编/解码本该与字符串无关, 但几乎所有 Base64 的`decode`方法都输出字符串,限制了使用场景.

### 本库方案
对于字符串的转换同样用`UTF-8`编码, 但无视无效符(解码按同一规则), 保证无损转换.
`decode()` 方法返回字节数组, 不主动判定字符串及编码, 并重写`toString()`方法, 以`UTF-8`编码解析为字符串.

### 适用场景
1. 二进制数据 与 Base64 互转
### Demo
```js
import Base64 from 'base64.js';

let str = 'Base64库\u{10400}\u{d800}'; 
console.log(str);  // Base64库𐐀�

console.log('==Base64.js==')
let b64 = Base64.encode(str);
let _str = Base64.decode(b64).toString();
console.log(b64);  // 
console.log(str === _str)

console.log('==Buffer==')
let bf_b64 = Buffer.from(str).toString('base64');
let bf_str = Buffer.from(bf_b64,'base64').toString();
let bf_str1 = Buffer.from(b64,'base64').toString();
console.log(bf_b64); // QmFzZTY05bqT8JCQgO2ggA==
console.log(bf_str1); // 
console.log(str === bf_str); // flase

//output
/*
Base64库𐐀�
==Base64.js==
QmFzZTY05bqT8JCQgO2ggA==
true

==Buffer==
QmFzZTY05bqT8JCQgO+/vQ==
false
*/
```

### API
```ts
Base64 = {
	encode(input:string|ArrayBuffer|Uint8Array|number[]):string;
	decode(input:string|ArrayBuffer|Uint8Array|number[]):Uint8Array;
	
	//适用于URL的Base64 ( "_" "-" 替换 "/" "+");
	encodeURL(input:string|ArrayBuffer|Uint8Array|number[]):string;
	decodeURL(input:string|ArrayBuffer|Uint8Array|number[]):Uint8Array;
	
	// UTF8 编码 解码
	utf8Encode(str:string):Uint8Array;
	utf8Decode(utf8arr:Uint8Array):string;
}
```