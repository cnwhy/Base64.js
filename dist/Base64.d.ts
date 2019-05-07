/**
 * 字符串utf8编码
 *
 * @param {string} str
 * @returns
 */
declare function utf8Encode(str: string): Uint8Array;
/**
 * buffer以utf8转字符串
 *
 * @param {(ArrayBuffer | Uint8Array | number[])} buffer
 * @returns {string}
 */
declare function utf8Decode(buffer: ArrayBuffer | Uint8Array | number[]): string;
declare function getEncode(table: string[], pad: string): (u8arr: string | number[] | ArrayBuffer | Uint8Array) => string;
declare function getDecode(table: string[], pad: string): (base64Str: string) => number[] | Uint8Array;
declare const encode: (u8arr: string | number[] | ArrayBuffer | Uint8Array) => string;
declare const decode: (base64Str: string) => number[] | Uint8Array;
declare const encodeURL: (u8arr: string | number[] | ArrayBuffer | Uint8Array) => string;
declare const decodeURL: (base64Str: string) => number[] | Uint8Array;
declare const lib: {
    getEncode: typeof getEncode;
    getDecode: typeof getDecode;
};
export { lib, decode, encode, encodeURL, decodeURL, utf8Encode, utf8Decode };
