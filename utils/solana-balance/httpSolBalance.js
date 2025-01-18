const SOLANA_RPC_URL = "https://api.mainnet-beta.solana.com";

export default async function getSolanaBalance(walletAddress) {
  try {
    // Prepare the payload for the RPC request with method and parameters
    const payload = {
      jsonrpc: "2.0",         // JSON-RPC version
      id: 1,                  // Request ID
      method: "getBalance",   // RPC method to fetch the balance
      params: [walletAddress] // Wallet address as parameter
    };

    // Make the RPC request to the Solana node
    const response = await fetch(SOLANA_RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    // Parse the JSON response from the Solana node
    const result = await response.json();

    // Return the balance in SOL (converted from lamports)
    return result?.result?.value / 1e9 || 0.0;
  } catch {
    return 0.0; // Return 0.0 if there is an error
  }
}