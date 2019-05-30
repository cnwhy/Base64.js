// import Base64 from './Base64';
const Base64 = require('../')

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
let bf_str1 = Buffer.from(b64,'base64').toString();
console.log(bf_b64); 
console.log(bf_str1);
console.log(str === bf_str); // false
