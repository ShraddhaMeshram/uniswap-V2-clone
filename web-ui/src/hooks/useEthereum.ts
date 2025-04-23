// import { useEffect, useState, useCallback } from "react";
// import { ethers } from "ethers";

// export default function useEthereum() {
//   const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
//   const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
//   const [account, setAccount] = useState<string | null>(null);
//   const [isConnected, setIsConnected] = useState(false);
//   const [isConnecting, setIsConnecting] = useState(false);
//   const [chainId, setChainId] = useState<number | null>(null);

//   useEffect(() => {
//     if (typeof window !== "undefined" && window.ethereum) {
//       const newProvider = new ethers.BrowserProvider(window.ethereum);
//       setProvider(newProvider);

//       // ✅ Expose for DevTools
//       (window as any).ethers = ethers;
//       (window as any).provider = newProvider;

//       const checkConnection = async () => {
//         try {
//           const accounts = await window.ethereum.request({ method: "eth_accounts" });
//           if (accounts.length > 0) {
//             const newSigner = await newProvider.getSigner();
//             const network = await newProvider.getNetwork();

//             setAccount(accounts[0]);
//             setSigner(newSigner);
//             setChainId(Number(network.chainId));
//             setIsConnected(true);

//             // ✅ Also expose signer/account
//             (window as any).signer = newSigner;
//             (window as any).account = accounts[0];
//           }
//         } catch (error) {
//           console.error("Failed to check connection:", error);
//         }
//       };

//       checkConnection();

//       // Handle events
//       window.ethereum.on("accountsChanged", async (accounts: string[]) => {
//         if (accounts.length === 0) {
//           setAccount(null);
//           setSigner(null);
//           setIsConnected(false);
//         } else {
//           setAccount(accounts[0]);
//           const newSigner = await newProvider.getSigner();
//           setSigner(newSigner);
//           (window as any).signer = newSigner;
//           (window as any).account = accounts[0];
//         }
//       });

//       window.ethereum.on("chainChanged", () => {
//         window.location.reload();
//       });
//     }

//     return () => {
//       if (window.ethereum) {
//         window.ethereum.removeAllListeners("accountsChanged");
//         window.ethereum.removeAllListeners("chainChanged");
//       }
//     };
//   }, []);

//   const connect = useCallback(async () => {
//     if (!provider || typeof window === "undefined" || !window.ethereum) return;

//     setIsConnecting(true);

//     try {
//       const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
//       const newSigner = await provider.getSigner();
//       const network = await provider.getNetwork();

//       setAccount(accounts[0]);
//       setSigner(newSigner);
//       setChainId(Number(network.chainId));
//       setIsConnected(true);

//       // ✅ Expose for DevTools
//       (window as any).signer = newSigner;
//       (window as any).account = accounts[0];
//     } catch (error) {
//       console.error("Failed to connect:", error);
//     } finally {
//       setIsConnecting(false);
//     }
//   }, [provider]);

//   return {
//     provider,
//     signer,
//     account,
//     chainId,
//     isConnected,
//     isConnecting,
//     connect,
//   };
// }

// src/hooks/useEthereum.ts
import { useState, useEffect } from "react";
import { ethers } from "ethers";

export default function useEthereum() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize ethers provider from window.ethereum
  useEffect(() => {
    const initProvider = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          // Create provider instance
          const ethersProvider = new ethers.BrowserProvider(window.ethereum);
          setProvider(ethersProvider);
          
          // Get initial network info
          const network = await ethersProvider.getNetwork();
          setChainId(Number(network.chainId));
          
          // Check if already connected
          const accounts = await ethersProvider.listAccounts();
          if (accounts.length > 0) {
            const currentSigner = await ethersProvider.getSigner();
            setAccount(accounts[0].address);
            setSigner(currentSigner);
            setIsConnected(true);
            console.log("Wallet already connected:", accounts[0].address);
          }
        } catch (err) {
          console.error("Error initializing provider:", err);
          setError("Failed to initialize wallet connection");
        }
      } else {
        setError("No Ethereum wallet detected");
      }
    };

    initProvider();
  }, []);

  // Setup event listeners for wallet changes
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = async (accounts: string[]) => {
        console.log("Accounts changed:", accounts);
        if (accounts.length === 0) {
          // User disconnected
          setAccount(null);
          setSigner(null);
          setIsConnected(false);
        } else if (provider) {
          // Account switched
          const newSigner = await provider.getSigner();
          setAccount(accounts[0]);
          setSigner(newSigner);
          setIsConnected(true);
        }
      };

      const handleChainChanged = (chainIdHex: string) => {
        console.log("Chain changed:", chainIdHex);
        const newChainId = parseInt(chainIdHex, 16);
        setChainId(newChainId);
        window.location.reload(); // Recommended by MetaMask
      };

      const handleDisconnect = (error: { code: number; message: string }) => {
        console.log("Wallet disconnected", error);
        setAccount(null);
        setSigner(null);
        setIsConnected(false);
        setError("Wallet disconnected");
      };

      // Subscribe to events
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
      window.ethereum.on("disconnect", handleDisconnect);

      // Cleanup
      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
        window.ethereum.removeListener("disconnect", handleDisconnect);
      };
    }
  }, [provider]);

  // Connect wallet function
  const connect = async () => {
    if (!provider) {
      setError("No Ethereum provider available");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Request account access
      const accounts = await window.ethereum.request({ 
        method: "eth_requestAccounts" 
      });
      
      // Get signer
      const connectedSigner = await provider.getSigner();
      
      setAccount(accounts[0]);
      setSigner(connectedSigner);
      setIsConnected(true);
      console.log("Wallet connected successfully:", accounts[0]);
    } catch (err) {
      console.error("Error connecting wallet:", err);
      setError("Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet function
  const disconnect = () => {
    // Note: MetaMask doesn't support programmatic disconnect
    // We can only reset our state
    setAccount(null);
    setSigner(null);
    setIsConnected(false);
  };

  return {
    provider,
    signer,
    account,
    chainId,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect
  };
}