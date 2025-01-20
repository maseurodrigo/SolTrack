import crypto from "crypto";
import zlib from "zlib";

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

// Function to derive a key and IV from the passphrase
const deriveKeyAndIV = (passphrase) => {
  const hash = crypto.createHash("sha256").update(passphrase).digest(); // Hash the passphrase
  const key = hash.slice(0, 32); // Use the first 32 bytes as the key (AES-256)
  const iv = hash.slice(0, 16); // Use the first 16 bytes as the IV
  return { key, iv };
};

// Encrypt function
export const encrypt = (passphrase, text) => {
  const { key, iv } = deriveKeyAndIV(passphrase); // Derive key and IV from passphrase
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(text, "utf8", "base64");
  encrypted += cipher.final("base64");
  return compressAndEncode(encrypted); // Compress and encode the encrypted data
};

// Decrypt function
export const decrypt = (passphrase, encryptedData) => {
  try {
    const compressedData = decodeAndDecompress(encryptedData); // Decode and decompress
    const { key, iv } = deriveKeyAndIV(passphrase); // Derive key and IV from passphrase
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(compressedData, "base64", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) { return null; }
};