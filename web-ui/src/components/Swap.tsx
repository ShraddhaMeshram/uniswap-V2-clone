"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import useEthereum from "@/src/hooks/useEthereum";
import { usePool } from "@/src/context/PoolContext";
import { ERC20_ABI } from "@/src/abis/erc20";
import { CONTRACT_ADDRESSES } from "@/src/utils/loadAddresses";

export default function Swap() {
  const { signer, account } = useEthereum();
  const { selectedPool } = usePool();

  const [amountIn, setAmountIn] = useState("");
  const [direction, setDirection] = useState("0to1"); // "0to1" or "1to0"
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [estimatedOutput, setEstimatedOutput] = useState(null);

  useEffect(() => {
    const getEstimatedOutput = async () => {
      if (!signer || !selectedPool || !amountIn || isNaN(parseFloat(amountIn))) {
        setEstimatedOutput(null);
        return;
      }

      try {
        const parsedAmountIn = ethers.parseUnits(amountIn);
        const pair = new ethers.Contract(selectedPool.pairAddress, [
          "function getReserves() external view returns (uint112, uint112, uint32)"
        ], signer);
        
        const [reserve0, reserve1] = await pair.getReserves();

        // Calculate output amount using the constant product formula: x * y = k
        // (reserveIn - amountIn) * (reserveOut + amountOut) = reserveIn * reserveOut
        let amountOut;
        if (direction === "0to1") {
          // 0 to 1
          amountOut = calculateAmountOut(parsedAmountIn, reserve0, reserve1);
        } else {
          // 1 to 0
          amountOut = calculateAmountOut(parsedAmountIn, reserve1, reserve0);
        }

        setEstimatedOutput(ethers.formatUnits(amountOut));
      } catch (error) {
        console.error("Error estimating output:", error);
        setEstimatedOutput(null);
      }
    };

    getEstimatedOutput();
  }, [signer, selectedPool, amountIn, direction]);

  const calculateAmountOut = (amountIn, reserveIn, reserveOut) => {
    if (reserveIn === 0n || reserveOut === 0n) return 0n;
    
    // 0.3% fee
    const amountInWithFee = amountIn * 997n / 1000n;
    const numerator = amountInWithFee * reserveOut;
    const denominator = reserveIn * 1000n + amountInWithFee * 997n;
    
    return numerator / denominator;
  };

  const getTokenIn = () => {
    if (!selectedPool) return null;
    return direction === "0to1" ? selectedPool.token0 : selectedPool.token1;
  };

  const getTokenOut = () => {
    if (!selectedPool) return null;
    return direction === "0to1" ? selectedPool.token1 : selectedPool.token0;
  };

  const toggleDirection = () => {
    setDirection(prev => prev === "0to1" ? "1to0" : "0to1");
    setAmountIn("");
    setEstimatedOutput(null);
  };

  const handleSwap = async () => {
    if (!signer || !selectedPool || !amountIn) return;

    const tokenIn = getTokenIn();
    const tokenOut = getTokenOut();

    setLoading(true);
    try {
      // Reset status
      setStatus({ type: "info", text: "Preparing swap..." });

      // Get pair contract
      const pairAbi = [
        "function getReserves() external view returns (uint112, uint112, uint32)",
        "function token0() external view returns (address)",
        "function token1() external view returns (address)",
        "function swap(uint amount0Out, uint amount1Out, address to, bytes calldata data) external"
      ];
      const pair = new ethers.Contract(selectedPool.pairAddress, pairAbi, signer);

      // Get token contracts
      const tokenInContract = new ethers.Contract(tokenIn, ERC20_ABI, signer);
      
      // Parse amount
      const parsedAmountIn = ethers.parseUnits(amountIn.trim());
      
      // Check balance
      const balance = await tokenInContract.balanceOf(account);
      if (balance < parsedAmountIn) {
        throw new Error(`Insufficient balance. You have ${ethers.formatUnits(balance)} tokens.`);
      }
      
      // Get current reserves
      const [reserve0, reserve1] = await pair.getReserves();
      
      // Calculate output amount
      let amount0Out = 0n;
      let amount1Out = 0n;
      
      if (direction === "0to1") {
        // Swapping token0 for token1
        amount1Out = calculateAmountOut(parsedAmountIn, reserve0, reserve1);
        console.log(`Swapping ${ethers.formatUnits(parsedAmountIn)} token0 for approximately ${ethers.formatUnits(amount1Out)} token1`);
      } else {
        // Swapping token1 for token0
        amount0Out = calculateAmountOut(parsedAmountIn, reserve1, reserve0);
        console.log(`Swapping ${ethers.formatUnits(parsedAmountIn)} token1 for approximately ${ethers.formatUnits(amount0Out)} token0`);
      }
      
      // Transfer tokens to the pair
      setStatus({ type: "info", text: "Transferring tokens..." });
      const transferTx = await tokenInContract.transfer(selectedPool.pairAddress, parsedAmountIn, {
        gasLimit: 100000
      });
      await transferTx.wait();
      
      // Call swap
      setStatus({ type: "info", text: "Executing swap..." });
      const swapTx = await pair.swap(
        amount0Out, 
        amount1Out, 
        account, 
        "0x", // No data needed
        {
          gasLimit: 200000
        }
      );
      await swapTx.wait();
      
      setStatus({ type: "success", text: "✅ Swap completed successfully!" });
      setAmountIn("");
      setEstimatedOutput(null);
    } catch (error) {
      console.error(error);
      let errorMessage = "Swap failed";
      if (error?.error?.message) errorMessage = error.error.message;
      else if (error?.reason) errorMessage = error.reason;
      else if (error?.message) errorMessage = error.message;
      
      setStatus({ type: "error", text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  // Get token symbols
  const [tokenSymbols, setTokenSymbols] = useState({ token0: "Token A", token1: "Token B" });
  useEffect(() => {
    const getTokenSymbols = async () => {
      if (!signer || !selectedPool) return;
      
      try {
        const token0Contract = new ethers.Contract(selectedPool.token0, ["function symbol() view returns (string)"], signer);
        const token1Contract = new ethers.Contract(selectedPool.token1, ["function symbol() view returns (string)"], signer);
        
        const [symbol0, symbol1] = await Promise.all([
          token0Contract.symbol().catch(() => "Token A"),
          token1Contract.symbol().catch(() => "Token B")
        ]);
        
        setTokenSymbols({ token0: symbol0, token1: symbol1 });
      } catch (error) {
        console.error("Error getting token symbols:", error);
      }
    };
    
    getTokenSymbols();
  }, [signer, selectedPool]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-1">
        <div className="font-medium">
          From: {direction === "0to1" ? tokenSymbols.token0 : tokenSymbols.token1}
        </div>
        <button 
          onClick={toggleDirection}
          className="text-indigo-600 hover:text-indigo-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      <input
        className="w-full p-2 border rounded"
        placeholder={`Amount of ${direction === "0to1" ? tokenSymbols.token0 : tokenSymbols.token1}`}
        value={amountIn}
        onChange={(e) => setAmountIn(e.target.value)}
      />
      
      <div className="flex justify-between items-center mb-1">
        <div className="font-medium">
          To: {direction === "0to1" ? tokenSymbols.token1 : tokenSymbols.token0}
        </div>
      </div>
      
      <div className="w-full p-2 border rounded bg-gray-50">
        {estimatedOutput 
          ? `≈ ${parseFloat(estimatedOutput).toFixed(6)} ${direction === "0to1" ? tokenSymbols.token1 : tokenSymbols.token0}`
          : "Enter an amount to see estimate"
        }
      </div>
      
      <button
        onClick={handleSwap}
        disabled={loading || !selectedPool || !amountIn || !estimatedOutput}
        className="bg-indigo-600 text-white px-4 py-2 rounded w-full disabled:bg-gray-400"
      >
        {loading ? "Swapping..." : "Swap"}
      </button>
      
      {status && (
        <div className={`p-3 rounded text-sm ${
          status.type === "success"
            ? "bg-green-100 text-green-700"
            : status.type === "error"
            ? "bg-red-100 text-red-700"
            : "bg-blue-100 text-blue-700"
        }`}>
          {status.text}
        </div>
      )}
    </div>
  );
}