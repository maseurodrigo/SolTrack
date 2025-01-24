import base58 from "bs58";

export function isValidSolanaAddress(address) {
  // Validate Solana address format and decode
  try { return address.length >= 32 && address.length <= 44 && base58.decode(address); } 
  catch { return false; }
}