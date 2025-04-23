"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { ERC20_ABI } from "@/src/abis/erc20";
import { ROUTER_ABI } from "@/src/abis/router";
import { FACTORY_ABI } from "@/src/abis/factory";
import { CONTRACT_ADDRESSES, DEADLINE_MINUTES, MAX_UINT256 } from "@/src/utils/loadAddresses";
import useEthereum from "@/src/hooks/useEthereum";
import { usePool } from "@/src/context/PoolContext";

export default function AddLiquidity() {
  const { signer, account } = useEthereum();
  const [tokenA, setTokenA] = useState("");
  const [tokenB, setTokenB] = useState("");
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pairInitialized, setPairInitialized] = useState(false);

  const { selectedPool } = usePool();
  useEffect(() => {
    if (selectedPool) {
      setTokenA(selectedPool.token0);
      setTokenB(selectedPool.token1);
    }
  }, [selectedPool]);

  // Check if pair is initialized with liquidity
  useEffect(() => {
    const checkPairStatus = async () => {
      if (!signer || !tokenA || !tokenB) return;
      
      try {
        const factory = new ethers.Contract(CONTRACT_ADDRESSES.FACTORY, FACTORY_ABI, signer);
        const pairAddress = await factory.getPair(tokenA, tokenB);
        
        if (pairAddress === "0x0000000000000000000000000000000000000000") {
          setPairInitialized(false);
          return;
        }
        
        const pair = new ethers.Contract(pairAddress, [
          "function getReserves() view returns (uint112,uint112,uint32)"
        ], signer);
        
        const [reserve0, reserve1] = await pair.getReserves();
        
        // If both reserves are 0, the pair needs initialization
        setPairInitialized(!(reserve0 === 0n && reserve1 === 0n));
        
      } catch (error) {
        console.error("Error checking pair status:", error);
        setPairInitialized(false);
      }
    };
    
    checkPairStatus();
  }, [signer, tokenA, tokenB]);

  const approveIfNeeded = async (tokenAddress, amount) => {
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
    const allowance = await tokenContract.allowance(account, CONTRACT_ADDRESSES.ROUTER);
    if (allowance < ethers.parseUnits(amount)) {
      setStatus({ type: "info", text: `Approving ${amount} tokens...` });
      const approveTx = await tokenContract.approve(CONTRACT_ADDRESSES.ROUTER, MAX_UINT256);
      await approveTx.wait();
    }
  };

  // const initializePair = async () => {
  //   if (!signer || !tokenA || !tokenB) return;
  //   setLoading(true);
  //   setStatus({ type: "info", text: "Initializing pair with first liquidity..." });
    
  //   try {
  //     // Get token contracts
  //     const tokenAContract = new ethers.Contract(tokenA, ERC20_ABI, signer);
  //     const tokenBContract = new ethers.Contract(tokenB, ERC20_ABI, signer);
      
  //     // Get pair address
  //     const factory = new ethers.Contract(CONTRACT_ADDRESSES.FACTORY, FACTORY_ABI, signer);
  //     const pairAddress = await factory.getPair(tokenA, tokenB);
      
  //     if (pairAddress === "0x0000000000000000000000000000000000000000") {
  //       setStatus({ type: "error", text: "Pair doesn't exist. Create it first." });
  //       setLoading(false);
  //       return;
  //     }
      
  //     // Create pair contract
  //     const pairAbi = [
  //       "function token0() view returns (address)",
  //       "function token1() view returns (address)",
  //       "function mint(address) external returns (uint)"
  //     ];
  //     const pair = new ethers.Contract(pairAddress, pairAbi, signer);
      
  //     // Small amount for initial liquidity
  //     const smallAmount = ethers.parseUnits("0.1", 18);
      
  //     // Approve transfers if needed
  //     await approveIfNeeded(tokenA, "0.1");
  //     await approveIfNeeded(tokenB, "0.1");
      
  //     // Transfer tokens directly to the pair
  //     await tokenAContract.transfer(pairAddress, smallAmount);
  //     await tokenBContract.transfer(pairAddress, smallAmount);
      
  //     // Mint liquidity tokens
  //     setStatus({ type: "info", text: "Minting initial liquidity tokens..." });
  //     const mintTx = await pair.mint(account);
  //     await mintTx.wait();
      
  //     setPairInitialized(true);
  //     setStatus({ type: "success", text: "Pair initialized successfully!" });
  //   } catch (error) {
  //     console.error("Error initializing pair:", error);
  //     let errorMessage = "Failed to initialize pair";
  //     if (error?.error?.message) errorMessage = error.error.message;
  //     else if (error?.message) errorMessage = error.message;
      
  //     setStatus({ type: "error", text: errorMessage });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const handleAddLiquidity = async () => {
  //   if (!signer || !tokenA || !tokenB || !amountA || !amountB) return;
    
  //   setLoading(true);
    
  //   try {
  //     // Check if pair exists and has liquidity
  //     const factory = new ethers.Contract(CONTRACT_ADDRESSES.FACTORY, FACTORY_ABI, signer);
  //     const pairAddress = await factory.getPair(tokenA, tokenB);
      
  //     if (pairAddress === "0x0000000000000000000000000000000000000000") {
  //       setStatus({ type: "error", text: "Pair doesn't exist. Create it first." });
  //       setLoading(false);
  //       return;
  //     }
      
  //     // Check if pair needs initialization
  //     if (!pairInitialized) {
  //       setStatus({ type: "info", text: "Pair needs initialization first..." });
  //       await initializePair();
  //     }
      
  //     // Now add the actual liquidity
  //     setStatus({ type: "info", text: "Approving tokens..." });
      
  //     // Trim amounts
  //     const trimmedAmountA = amountA.trim();
  //     const trimmedAmountB = amountB.trim();
      
  //     // Approve tokens
  //     await approveIfNeeded(tokenA, trimmedAmountA);
  //     await approveIfNeeded(tokenB, trimmedAmountB);
      
  //     setStatus({ type: "info", text: "Adding liquidity..." });
      
  //     // Parse amounts
  //     const parsedA = ethers.parseUnits(trimmedAmountA);
  //     const parsedB = ethers.parseUnits(trimmedAmountB);
      
  //     // Set reasonable slippage
  //     const slippage = 1; // 1%
  //     const amountAMin = parsedA * BigInt(100 - slippage) / BigInt(100);
  //     const amountBMin = parsedB * BigInt(100 - slippage) / BigInt(100);
      
  //     // Prepare deadline
  //     const deadline = Math.floor(Date.now() / 1000) + DEADLINE_MINUTES * 60;
      
  //     // Execute addLiquidity
  //     const router = new ethers.Contract(CONTRACT_ADDRESSES.ROUTER, ROUTER_ABI, signer);
  //     const tx = await router.addLiquidity(
  //       tokenA,
  //       tokenB,
  //       parsedA,
  //       parsedB,
  //       amountAMin,
  //       amountBMin,
  //       account,
  //       deadline
  //     );
      
  //     await tx.wait();
      
  //     setStatus({ type: "success", text: "✅ Liquidity added successfully!" });
  //     // Optionally clear form
  //     // setAmountA("");
  //     // setAmountB("");
  //   } catch (err) {
  //     console.error(err);
  //     const reason = err?.error?.message || err?.reason || err?.message || "Failed to add liquidity";
  //     setStatus({ type: "error", text: reason });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Replace your handleAddLiquidity function with this one
  // const handleAddLiquidity = async () => {
  //   if (!signer || !tokenA || !tokenB) return;
  //   setLoading(true);
  //   setStatus({ type: "info", text: "Initializing pair with first liquidity..." });
    
  //   try {
  //     // Get token contracts
  //     const tokenAContract = new ethers.Contract(tokenA, ERC20_ABI, signer);
  //     const tokenBContract = new ethers.Contract(tokenB, ERC20_ABI, signer);
      
  //     // Get pair address
  //     const factory = new ethers.Contract(CONTRACT_ADDRESSES.FACTORY, FACTORY_ABI, signer);
  //     const pairAddress = await factory.getPair(tokenA, tokenB);
      
  //     if (pairAddress === "0x0000000000000000000000000000000000000000") {
  //       // Try to create the pair if it doesn't exist
  //       setStatus({ type: "info", text: "Pair doesn't exist. Creating it..." });
  //       const createPairTx = await factory.createPair(tokenA, tokenB);
  //       await createPairTx.wait();
  //       const newPairAddress = await factory.getPair(tokenA, tokenB);
        
  //       if (newPairAddress === "0x0000000000000000000000000000000000000000") {
  //         throw new Error("Failed to create pair");
  //       }
        
  //       setStatus({ type: "info", text: "Pair created successfully!" });
  //     }
      
  //     // Get updated pair address
  //     const finalPairAddress = await factory.getPair(tokenA, tokenB);
  //     console.log("Pair address:", finalPairAddress);
      
  //     // Create pair contract
  //     const pairAbi = [
  //       "function token0() view returns (address)",
  //       "function token1() view returns (address)",
  //       "function mint(address) external returns (uint)"
  //     ];
  //     const pair = new ethers.Contract(finalPairAddress, pairAbi, signer);
      
  //     // Small amount for initial liquidity
  //     const smallAmount = ethers.parseUnits("0.1", 18);
      
  //     // Check token balances before transfer
  //     const balanceA = await tokenAContract.balanceOf(account);
  //     const balanceB = await tokenBContract.balanceOf(account);
  //     console.log("Balance A:", ethers.formatUnits(balanceA, 18));
  //     console.log("Balance B:", ethers.formatUnits(balanceB, 18));
      
  //     if (balanceA < smallAmount || balanceB < smallAmount) {
  //       throw new Error("Insufficient token balance for initialization");
  //     }
      
  //     // Transfer token A with explicit gas limit
  //     setStatus({ type: "info", text: "Transferring Token A..." });
  //     try {
  //       const txA = await tokenAContract.transfer(finalPairAddress, smallAmount, {
  //         gasLimit: 100000 // Explicit gas limit
  //       });
  //       await txA.wait();
  //       console.log("Token A transferred successfully");
  //     } catch (errorA) {
  //       console.error("Error transferring Token A:", errorA);
  //       throw new Error(`Failed to transfer Token A: ${errorA.message}`);
  //     }
      
  //     // Transfer token B with explicit gas limit
  //     setStatus({ type: "info", text: "Transferring Token B..." });
  //     try {
  //       const txB = await tokenBContract.transfer(finalPairAddress, smallAmount, {
  //         gasLimit: 100000 // Explicit gas limit
  //       });
  //       await txB.wait();
  //       console.log("Token B transferred successfully");
  //     } catch (errorB) {
  //       console.error("Error transferring Token B:", errorB);
  //       throw new Error(`Failed to transfer Token B: ${errorB.message}`);
  //     }
      
  //     // Mint liquidity tokens with explicit gas limit
  //     setStatus({ type: "info", text: "Minting initial liquidity tokens..." });
  //     try {
  //       const mintTx = await pair.mint(account, {
  //         gasLimit: 200000 // Explicit gas limit
  //       });
  //       await mintTx.wait();
  //       console.log("Liquidity tokens minted successfully");
  //     } catch (mintError) {
  //       console.error("Error minting liquidity tokens:", mintError);
  //       throw new Error(`Failed to mint liquidity tokens: ${mintError.message}`);
  //     }
      
  //     setPairInitialized(true);
  //     setStatus({ type: "success", text: "Pair initialized successfully!" });
  //   } catch (error) {
  //     console.error("Error initializing pair:", error);
  //     let errorMessage = "Failed to initialize pair";
  //     if (error?.error?.message) errorMessage = error.error.message;
  //     else if (error?.message) errorMessage = error.message;
      
  //     setStatus({ type: "error", text: errorMessage });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Function 1: For initializing the pair with first liquidity
const initializePair = async () => {
  if (!signer || !tokenA || !tokenB) return;
  setLoading(true);
  setStatus({ type: "info", text: "Initializing pair with first liquidity..." });
  
  try {
    // Get token contracts
    const tokenAContract = new ethers.Contract(tokenA, ERC20_ABI, signer);
    const tokenBContract = new ethers.Contract(tokenB, ERC20_ABI, signer);
    
    // Get pair address
    const factory = new ethers.Contract(CONTRACT_ADDRESSES.FACTORY, FACTORY_ABI, signer);
    const pairAddress = await factory.getPair(tokenA, tokenB);
    
    if (pairAddress === "0x0000000000000000000000000000000000000000") {
      // Try to create the pair if it doesn't exist
      setStatus({ type: "info", text: "Pair doesn't exist. Creating it..." });
      const createPairTx = await factory.createPair(tokenA, tokenB);
      await createPairTx.wait();
      const newPairAddress = await factory.getPair(tokenA, tokenB);
      
      if (newPairAddress === "0x0000000000000000000000000000000000000000") {
        throw new Error("Failed to create pair");
      }
      
      setStatus({ type: "info", text: "Pair created successfully!" });
    }
    
    // Get updated pair address
    const finalPairAddress = await factory.getPair(tokenA, tokenB);
    console.log("Pair address:", finalPairAddress);
    
    // Create pair contract
    const pairAbi = [
      "function token0() view returns (address)",
      "function token1() view returns (address)",
      "function mint(address) external returns (uint)"
    ];
    const pair = new ethers.Contract(finalPairAddress, pairAbi, signer);
    
    // Small amount for initial liquidity
    const smallAmount = ethers.parseUnits("0.1", 18);
    
    // Check token balances before transfer
    const balanceA = await tokenAContract.balanceOf(account);
    const balanceB = await tokenBContract.balanceOf(account);
    console.log("Balance A:", ethers.formatUnits(balanceA, 18));
    console.log("Balance B:", ethers.formatUnits(balanceB, 18));
    
    if (balanceA < smallAmount || balanceB < smallAmount) {
      throw new Error("Insufficient token balance for initialization");
    }
    
    // Transfer token A with explicit gas limit
    setStatus({ type: "info", text: "Transferring Token A..." });
    try {
      const txA = await tokenAContract.transfer(finalPairAddress, smallAmount, {
        gasLimit: 100000 // Explicit gas limit
      });
      await txA.wait();
      console.log("Token A transferred successfully");
    } catch (errorA) {
      console.error("Error transferring Token A:", errorA);
      throw new Error(`Failed to transfer Token A: ${errorA.message}`);
    }
    
    // Transfer token B with explicit gas limit
    setStatus({ type: "info", text: "Transferring Token B..." });
    try {
      const txB = await tokenBContract.transfer(finalPairAddress, smallAmount, {
        gasLimit: 100000 // Explicit gas limit
      });
      await txB.wait();
      console.log("Token B transferred successfully");
    } catch (errorB) {
      console.error("Error transferring Token B:", errorB);
      throw new Error(`Failed to transfer Token B: ${errorB.message}`);
    }
    
    // Mint liquidity tokens with explicit gas limit
    setStatus({ type: "info", text: "Minting initial liquidity tokens..." });
    try {
      const mintTx = await pair.mint(account, {
        gasLimit: 200000 // Explicit gas limit
      });
      await mintTx.wait();
      console.log("Liquidity tokens minted successfully");
    } catch (mintError) {
      console.error("Error minting liquidity tokens:", mintError);
      throw new Error(`Failed to mint liquidity tokens: ${mintError.message}`);
    }
    
    setPairInitialized(true);
    setStatus({ type: "success", text: "Pair initialized successfully!" });
  } catch (error) {
    console.error("Error initializing pair:", error);
    let errorMessage = "Failed to initialize pair";
    if (error?.error?.message) errorMessage = error.error.message;
    else if (error?.message) errorMessage = error.message;
    
    setStatus({ type: "error", text: errorMessage });
  } finally {
    setLoading(false);
  }
};

// Function 2: For adding more liquidity after initialization
const handleAddLiquidity = async () => {
  if (!signer || !tokenA || !tokenB || !amountA || !amountB) return;
  
  setLoading(true);
  
  try {
    // Clear previous success messages
    if (status?.type === "success") {
      setStatus(null);
    }
    
    setStatus({ type: "info", text: "Processing liquidity addition..." });
    
    const factory = new ethers.Contract(CONTRACT_ADDRESSES.FACTORY, FACTORY_ABI, signer);
    const pairAddress = await factory.getPair(tokenA, tokenB);
    
    if (pairAddress === "0x0000000000000000000000000000000000000000") {
      setStatus({ type: "error", text: "Pair doesn't exist. Create it first." });
      setLoading(false);
      return;
    }
    
    // Check if pair needs initialization
    if (!pairInitialized) {
      setStatus({ type: "info", text: "Pair needs initialization first..." });
      await initializePair();
      // Re-check if initialization was successful
      if (!pairInitialized) {
        return; // Exit if initialization didn't succeed
      }
    }
    
    // Now add more liquidity using direct transfer approach
    setStatus({ type: "info", text: "Adding more liquidity..." });
    
    // Get token contracts
    const tokenAContract = new ethers.Contract(tokenA, ERC20_ABI, signer);
    const tokenBContract = new ethers.Contract(tokenB, ERC20_ABI, signer);
    
    // Parse amounts
    const parsedA = ethers.parseUnits(amountA.trim());
    const parsedB = ethers.parseUnits(amountB.trim());
    
    // Check balances
    const balanceA = await tokenAContract.balanceOf(account);
    const balanceB = await tokenBContract.balanceOf(account);
    
    if (balanceA < parsedA || balanceB < parsedB) {
      setStatus({ type: "error", text: "Insufficient token balance" });
      return;
    }
    
    // Direct transfer approach (bypassing router)
    setStatus({ type: "info", text: "Transferring tokens to pair..." });
    
    // Transfer token A
    const txA = await tokenAContract.transfer(pairAddress, parsedA, {
      gasLimit: 100000
    });
    await txA.wait();
    
    // Transfer token B
    const txB = await tokenBContract.transfer(pairAddress, parsedB, {
      gasLimit: 100000
    });
    await txB.wait();
    
    // Mint LP tokens
    setStatus({ type: "info", text: "Minting liquidity tokens..." });
    
    const pairAbi = ["function mint(address) external returns (uint)"];
    const pair = new ethers.Contract(pairAddress, pairAbi, signer);
    
    const mintTx = await pair.mint(account, {
      gasLimit: 200000
    });
    await mintTx.wait();
    
    setStatus({ type: "success", text: "✅ Additional liquidity added successfully!" });
  } catch (err) {
    console.error(err);
    const reason = err?.error?.message || err?.reason || err?.message || "Failed to add liquidity";
    setStatus({ type: "error", text: reason });
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="space-y-4">
      <input
        className="w-full p-2 border rounded"
        placeholder="Token A Address"
        value={tokenA}
        onChange={(e) => setTokenA(e.target.value)}
      />
      <input
        className="w-full p-2 border rounded"
        placeholder="Token B Address"
        value={tokenB}
        onChange={(e) => setTokenB(e.target.value)}
      />
      <input
        className="w-full p-2 border rounded"
        placeholder="Amount of Token A"
        value={amountA}
        onChange={(e) => setAmountA(e.target.value)}
      />
      <input
        className="w-full p-2 border rounded"
        placeholder="Amount of Token B"
        value={amountB}
        onChange={(e) => setAmountB(e.target.value)}
      />

      {!pairInitialized && tokenA && tokenB && (
        <div className="flex items-center p-3 bg-yellow-100 text-yellow-800 rounded">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>This pair has no liquidity yet and needs to be initialized first.</span>
          <button 
            onClick={initializePair}
            disabled={loading}
            className="ml-auto bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-sm disabled:bg-gray-400"
          >
            Initialize
          </button>
        </div>
      )}

      <button
        disabled={loading}
        onClick={handleAddLiquidity}
        className="bg-indigo-600 text-white px-4 py-2 rounded w-full disabled:bg-gray-400"
      >
        {loading ? "Processing..." : "Add Liquidity"}
      </button>

      {status && (
        <div
          className={`p-3 rounded text-sm ${
            status.type === "success"
              ? "bg-green-100 text-green-700"
              : status.type === "error"
              ? "bg-red-100 text-red-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {status.text}
        </div>
      )}
    </div>
  );
}