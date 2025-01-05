import base58 from "bs58";

export function isValidSolanaAddress(address) {
  try {
    return address.length === 44 && base58.decode(address);
  } catch {
    return false;
  }
}