// import Base64 from './Base64';
const Base64 = require('../')
let str = 'Base64库\u{10400}\u{d800}'; 
console.log(str);  // Base64库𐐀�

console.log('== Base64.js ==')
let b64 = Base64.encode(str);
let _str = Base64.decode(b64).toString();
console.log(b64);
console.log(str === _str)  //true

console.log('== Buffer ==')
let bf_b64 = Buffer.from(str).toString('base64');
let bf_str = Buffer.from(bf_b64,'base64').toString();
console.log(bf_b64);
console.log(str === bf_str);  //flase


let __str = '𐀀';
let __b64 = Base64.encode(__str);
let ___str = Base64.decode(__b64).toString();
console.log(__str.split("").map(v=>v.charCodeAt(0).toString(16)))
console.log(__b64);
console.log(Array.from(Base64.decode(__b64)).map(v=>v.toString(2)));
console.log(__str === ___str)  //true