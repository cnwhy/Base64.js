"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isArrayBuffer = exports.isUint8Array = exports.MyLikeUint8array = exports.hasArrayBuffer = exports.isArray = void 0;
// 手动 poliyfill 以最小的代码量兼容IE6(ES3);
// const emptyFn = function(){};
exports.isArray = Array.isArray ||
    function (obj) {
        return Object.prototype.toString.call(obj) == '[object Array]';
    };
exports.hasArrayBuffer = typeof ArrayBuffer === 'function';
// export const MyArrayBuffer = hasArrayBuffer ? ArrayBuffer : emptyFn;
// export const MyUint8Array = hasArrayBuffer ? Uint8Array : emptyFn;
exports.MyLikeUint8array = exports.hasArrayBuffer ? Uint8Array : Array;
// export const myUint8arrayClass = hasArrayBuffer ? Uint8Array : Array;
// export const getUint8Array = hasArrayBuffer
// 	? function(arg: any) {
// 			return new Uint8Array(arg);
// 	  }
// 	: function(arg: any) {
// 			return typeof arg === 'number' ? new Array(arg) : arg;
// 	  };
const isUint8Array = function (obj) {
    return exports.hasArrayBuffer && obj instanceof Uint8Array;
};
exports.isUint8Array = isUint8Array;
const isArrayBuffer = function (obj) {
    return exports.hasArrayBuffer && obj instanceof ArrayBuffer;
};
exports.isArrayBuffer = isArrayBuffer;
