// 手动 poliyfill 以最小的代码量兼容IE6(ES3);
export const isArray =
	Array.isArray ||
	function(obj) {
		Object.prototype.toString.call(obj) == '[object Array]';
	};
export const hasArrayBuffer = typeof ArrayBuffer === 'function';
export const MyArrayBuffer = hasArrayBuffer ? ArrayBuffer : function() {};
export const myUint8arrayClass = hasArrayBuffer ? Uint8Array : Array;
export const getUint8Array = hasArrayBuffer
	? function(arr: any) {
			return new Uint8Array(arr);
	  }
	: function(arr: any) {
			return typeof arr === 'number' ? new Array(arr) : arr;
	  };
