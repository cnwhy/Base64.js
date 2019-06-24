// 手动 poliyfill 以最小的代码量兼容IE6(ES3);
// const emptyFn = function(){};
export const isArray =
	Array.isArray ||
	function(obj): obj is Array<any> {
		return Object.prototype.toString.call(obj) == '[object Array]';
	};
export const hasArrayBuffer = typeof ArrayBuffer === 'function';
// export const MyArrayBuffer = hasArrayBuffer ? ArrayBuffer : emptyFn;
// export const MyUint8Array = hasArrayBuffer ? Uint8Array : emptyFn;
export const MyLikeUint8array = hasArrayBuffer ? Uint8Array : Array;
// export const myUint8arrayClass = hasArrayBuffer ? Uint8Array : Array;
// export const getUint8Array = hasArrayBuffer
// 	? function(arg: any) {
// 			return new Uint8Array(arg);
// 	  }
// 	: function(arg: any) {
// 			return typeof arg === 'number' ? new Array(arg) : arg;
// 	  };
export const isUint8Array = function(obj: any): obj is Uint8Array {
	return hasArrayBuffer && obj instanceof Uint8Array;
};
export const isArrayBuffer = function(obj: any): obj is ArrayBuffer {
	return hasArrayBuffer && obj instanceof ArrayBuffer;
};
