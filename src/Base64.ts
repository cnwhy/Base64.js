import { utf8Decode, utf8Encode } from './utf8';
import { createEncode, createDecode, BASE64_TABLE, PAD } from './main';
const BASE64_URL_TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
const encode = createEncode(BASE64_TABLE, PAD, utf8Encode);
const decode = createDecode(BASE64_TABLE, PAD, utf8Decode);
const encodeURL = createEncode(BASE64_URL_TABLE, PAD, utf8Encode);
const decodeURL = createDecode(BASE64_URL_TABLE, PAD, utf8Decode);

export {
	createEncode,
	createDecode,
	BASE64_TABLE,
	BASE64_URL_TABLE,
	PAD,
	utf8Decode,
	utf8Encode,
	encode,
	decode,
	encodeURL,
	decodeURL
};
