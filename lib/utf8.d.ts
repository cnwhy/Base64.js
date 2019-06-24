declare type LikeUint8Array = number[] | Uint8Array;
/**
 * 字符串utf8编码
 *
 * @param {string} str
 * @returns
 */
declare function utf8Encode(str: string): LikeUint8Array;
/**
 * buffer以utf8转字符串
 *
 * @param {(ArrayBuffer | Uint8Array | number[])} buffer
 * @returns {string}
 */
declare function utf8Decode(buffer: ArrayBuffer | Uint8Array | number[]): string;
export { utf8Encode, utf8Decode };
