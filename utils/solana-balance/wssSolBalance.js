import { useState, useEffect } from "react";

// Solana RPC WebSocket URL from environment variables
const SOLANA_RPC_WS = process.env.NEXT_PUBLIC_SOLANA_RPC_WS_URL;

export default function getSolanaBalance(walletAddress) {

  // Default value is null until walletAddress is set
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    if (!walletAddress || !SOLANA_RPC_WS) return;

    let wsConn; // WebSocket connection
    let keepAliveInterval; // Variable to hold the keep-alive interval ID

    try {
      wsConn = new WebSocket(SOLANA_RPC_WS);
      
      wsConn.onopen = () => {
        // Subscribe to account changes for the wallet address
        const subscriptionPayload = {
          jsonrpc: "2.0",
          id: 1,
          method: "accountSubscribe",
          params: [walletAddress, { encoding: "jsonParsed" }]
        };
        wsConn.send(JSON.stringify(subscriptionPayload));

        // Start a keep-alive interval to prevent connection timeouts
        keepAliveInterval = setInterval(() => {
          if (wsConn.readyState === WebSocket.OPEN) { 
            wsConn.send(JSON.stringify({ jsonrpc: "2.0", method: "ping" }));
          }
        }, 30000); // Ping every 30 seconds
      };
      
      wsConn.onmessage = (event) => {
        const data = JSON.parse(event.data.toString('utf8'));

        if (data?.params?.result?.value?.lamports !== undefined) {
          // Update balance whenever the account changes
          const lamports = data.params.result.value.lamports;
          setBalance(lamports / 1e9); // Convert lamports to SOL
        }
      };
      
      // Handle WebSocket connection errors
      wsConn.onerror = (error) => { console.error("Solana RPC WebSocket Error:", error); };
      
      return () => {
        // Clear keep-alive interval on cleanup
        if (keepAliveInterval) clearInterval(keepAliveInterval);

        // Cleanup the WebSocket connection on unmount or wallet change
        if (wsConn && wsConn.readyState === WebSocket.OPEN) {
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
    } catch (connectionError) {
      // Catch any errors that occur while establishing the WebSocket connection
      console.error("Failed to establish Solana RPC WebSocket connection: ", connectionError);

      // Cleanup if an error occurs
      if (keepAliveInterval) clearInterval(keepAliveInterval);
      
      // Return a no-op cleanup function in case of failure
      return () => {};
    }
  }, [walletAddress]); // Re-run the effect when walletAddress changes
  
  return balance;
}