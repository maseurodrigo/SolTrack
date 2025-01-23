import { useState, useEffect } from "react";

// Solana RPC WebSocket URL from environment variables
const SOLANA_RPC_WS = process.env.NEXT_PUBLIC_SOLANA_RPC_WS_URL;

export default function getSolanaBalance(walletAddress) {

  // Default value is null until walletAddress is set
  const [currentBalance, setCurrentBalance] = useState(null);

  useEffect(() => {
    if (!walletAddress || !SOLANA_RPC_WS) return;

    let wsConn; // WebSocket connection
    let keepAliveInterval; // Keep-alive interval ID
    let reconnectTimeout; // Timeout ID for reconnection
    let isManuallyClosed = false; // Flag to prevent reconnect on manual close

    const connectWebSocket = () => {

      // Create a new WebSocket connection
      wsConn = new WebSocket(SOLANA_RPC_WS);

      // WebSocket open event
      wsConn.onopen = () => {
        
        // Subscribe to account changes for the wallet address
        const subscriptionPayload = {
          jsonrpc: "2.0",
          id: 1,
          method: "accountSubscribe",
          params: [walletAddress, { encoding: "jsonParsed" }]
        };

        wsConn.send(JSON.stringify(subscriptionPayload));

        // Start a keep-alive interval to prevent timeouts
        keepAliveInterval = setInterval(() => {
          if (wsConn && wsConn.readyState === WebSocket.OPEN) {
            wsConn.send(JSON.stringify({ jsonrpc: "2.0", method: "ping" }));
          }
        }, 30000); // Every 30 seconds
      };

      // WebSocket message event
      wsConn.onmessage = (event) => {
        const data = JSON.parse(event.data.toString('utf8'));

        // Update balance whenever the account changes
        if (data?.params?.result?.value?.lamports !== undefined) {
          const lamports = data.params.result.value.lamports;
          setCurrentBalance(lamports / 1e9); // Convert lamports to SOL
        }
      };

      // Handle WebSocket connection errors
      wsConn.onerror = (error) => { console.error("Solana RPC WebSocket Error:", error); };

      // WebSocket close event
      wsConn.onclose = () => {

        // Attempt to reconnect if the connection was not manually closed
        if (!isManuallyClosed) { 
          console.log("Reconnecting WS..."); 
          reconnectTimeout = setTimeout(connectWebSocket, 5000); 
        }
      };
    };

    // Establish the WebSocket connection
    connectWebSocket();

    return () => {
      isManuallyClosed = true; // Prevent reconnection
      if (keepAliveInterval) clearInterval(keepAliveInterval); // Clear keep-alive interval
      if (reconnectTimeout) clearTimeout(reconnectTimeout); // Clear reconnect timeout

      // Unsubscribe and close the WebSocket
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
  }, [walletAddress]);
  
  return currentBalance;
}