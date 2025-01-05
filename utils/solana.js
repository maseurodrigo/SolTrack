const SOLANA_RPC_URL = "https://api.mainnet-beta.solana.com";

export async function getSolBalance(walletAddress) {
  try {
    const payload = {
      jsonrpc: "2.0",
      id: 1,
      method: "getBalance",
      params: [walletAddress],
    };
    const response = await fetch(SOLANA_RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    return result?.result?.value / 1e9 || 0.0; // Convert lamports to SOL
  } catch {
    return 0.0;
  }
}