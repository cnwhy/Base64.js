declare const BASE64_TABLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
declare const PAD = "=";
/**
 * 创建Base64编码函数
 *
 * @param {(string[] | string)} Base64 的编码表
 * @param {string} PAD
 * @param {Function} strEncode
 * @returns {(input: any) => string}
 */
declare function createEncode(table: string[] | string, pad: string, strEncode?: Function): (input: any) => string;
/**
 * 创建Base64解码函数
 *
 * @param {(string[] | string)} table
 * @param {string} pad
 * @param {Function} [strDecode]
 * @returns
 */
declare function createDecode(table: string[] | string, pad: string, strDecode?: Function): (base64Str: string) => number[] | Uint8Array;
export { createEncode, createDecode, BASE64_TABLE, PAD };
