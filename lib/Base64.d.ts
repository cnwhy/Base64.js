import { utf8Decode, utf8Encode } from './utf8';
import { createEncode, createDecode, BASE64_TABLE, PAD } from './main';
declare const BASE64_URL_TABLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
declare const encode: (input: any) => string;
declare const decode: (base64str: string) => number[] | Uint8Array;
declare const encodeURL: (input: any) => string;
declare const decodeURL: (base64str: string) => number[] | Uint8Array;
export { BASE64_TABLE, BASE64_URL_TABLE, PAD, utf8Encode, utf8Decode, createEncode, createDecode, encode, decode, encodeURL, decodeURL };
