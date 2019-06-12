declare const BASE64_TABLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
declare const PAD = "=";
/**
 * 创建Base64编码函数
 *
 * @param {Function} strEncode // 字符串编函数
 * @returns {(input: any) => string}
 */
declare function createEncode(strEncode: Function): (input: any) => string;
/**
 * 创建Base64编码函数
 *
 * @param {(string[] | string)} Base64 的编码表
 * @param {string} PAD //填充符
 * @param {Function} strEncode // 字符串编函数, 不设置则不支持编码字符串
 * @returns {(input: any) => string}
 */
declare function createEncode(table?: string[] | string, pad?: string, strEncode?: Function): (input: any) => string;
/**
 * 创建Base64解码函数
 *
 * @param {Function} strDecode
 * @returns {((base64str: string) => Uint8Array | number[])}
 */
declare function createDecode(strDecode: Function): (base64str: string) => Uint8Array | number[];
/**
 * 创建Base64解码函数
 *
 * @param {(string[] | string)} [table]
 * @param {string} [pad]
 * @param {Function} [strDecode]
 * @returns {((base64str: string) => Uint8Array | number[])}
 */
declare function createDecode(table?: string[] | string, pad?: string, strDecode?: Function): (base64str: string) => Uint8Array | number[];
export { createEncode, createDecode, BASE64_TABLE, PAD };
