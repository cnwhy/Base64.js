"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// 手动 poliyfill 以最小的代码量兼容IE6(ES3);
exports.isArray = Array.isArray ||
    function (obj) {
        Object.prototype.toString.call(obj) == '[object Array]';
    };
exports.hasArrayBuffer = typeof ArrayBuffer === 'function';
exports.MyArrayBuffer = exports.hasArrayBuffer ? ArrayBuffer : function () { };
exports.myUint8arrayClass = exports.hasArrayBuffer ? Uint8Array : Array;
exports.getUint8Array = exports.hasArrayBuffer
    ? function (arr) {
        return new Uint8Array(arr);
    }
    : function (arr) {
        return typeof arr === 'number' ? new Array(arr) : arr;
    };
