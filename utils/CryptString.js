import crypto from "crypto";
import zlib from "zlib";

// Define a secret key and initialization vector (IV)
const SECRET_KEY = crypto.randomBytes(32); // 32 bytes for AES-256
const IV = crypto.randomBytes(16); // 16 bytes for AES

// URL-Safe Base64 Encoding
const toUrlSafeBase64 = (str) => str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

// URL-Safe Base64 Decoding
const fromUrlSafeBase64 = (str) => str.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (str.length % 4)) % 4);

// Compress and encode as Base64
const compressAndEncode = (data) => {
  const compressed = zlib.deflateSync(data); // Compress the encrypted data
  return toUrlSafeBase64(compressed.toString("base64"));
};

// Decode and decompress from Base64
const decodeAndDecompress = (data) => {
  const buffer = Buffer.from(fromUrlSafeBase64(data), "base64");
  return zlib.inflateSync(buffer).toString();
};

// Encrypt function with compression
export const encrypt = (text) => {
  const cipher = crypto.createCipheriv("aes-256-cbc", SECRET_KEY, IV);
  let encrypted = cipher.update(text, "utf8", "base64");
  encrypted += cipher.final("base64");

  // Store SECRET_KEY and IV in localStorage
  localStorage.setItem("SECRET_KEY", SECRET_KEY.toString("base64"));
  localStorage.setItem("IV", IV.toString("base64"));

  return {
    iv: toUrlSafeBase64(IV.toString("base64")),
    encryptedData: compressAndEncode(encrypted)
  };
};

// Decrypt function with decompression
export const decrypt = (encryptedData) => {
  try {
    // Retrieve SECRET_KEY and IV from localStorage
    const SECRET_KEY = Buffer.from(localStorage.getItem("SECRET_KEY"), "base64");
    const IV = Buffer.from(localStorage.getItem("IV"), "base64");

    // Create a decipher instance with the same algorithm and key used during encryption
    const decipher = crypto.createDecipheriv("aes-256-cbc", SECRET_KEY, IV);

    // Decompress the encrypted data before decrypting
    const compressedData = decodeAndDecompress(encryptedData);

    // Decrypt the compressed data
    let decrypted = decipher.update(compressedData, "base64", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) { return null; }
};