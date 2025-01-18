import { useState, useEffect } from "react";

// Solana RPC WebSocket URL from environment variables
const SOLANA_RPC_WS = process.env.NEXT_PUBLIC_SOLANA_RPC_WS_URL;

export default function getSolanaBalance(walletAddress) {

  // Default value is null until walletAddress is set
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    if (!walletAddress || !SOLANA_RPC_WS) return;

    try {
      const wsConn = new WebSocket(SOLANA_RPC_WS);

      console.log("Solana RPC WebSocket New Connection:", wsConn);

      wsConn.onopen = () => {
        // Subscribe to account changes for the wallet address
        const subscriptionPayload = {
          jsonrpc: "2.0",
          id: 1,
          method: "accountSubscribe",
          params: [walletAddress, { encoding: "jsonParsed", commitment: "finalized" }]
        };
        wsConn.send(JSON.stringify(subscriptionPayload));

        console.log("Solana RPC WebSocket Connection Opened:", walletAddress);
      };
      
      wsConn.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data?.params?.result?.value?.lamports !== undefined) {
          // Update balance whenever the account changes
          const lamports = data.params.result.value.lamports;
          setBalance(lamports / 1e9); // Convert lamports to SOL

          console.log("Solana RPC WebSocket Connection Message:", (lamports / 1e9));
        }
      };

      wsConn.onerror = (error) => { console.error("Solana RPC WebSocket Error:", error); };

      wsConn.onclose = (event) => { console.log("Solana RPC WebSocket Connection Closed:", event); };
    } catch (error) {
      console.error("Failed to establish Solana RPC WebSocket connection:", error);
    }
    
    return () => {
      // Cleanup the WebSocket connection on unmount or wallet change
      if (wsConn.readyState === WebSocket.OPEN) {
        const unsubscribePayload = {
          jsonrpc: "2.0",
          id: 1,
          method: "accountUnsubscribe",
          params: [1] // Use the same subscription ID as in `id`
        };
        wsConn.send(JSON.stringify(unsubscribePayload));
        wsConn.close();
      }
    };
  }, [walletAddress]); // Re-run the effect when walletAddress changes
  
  return balance;
}