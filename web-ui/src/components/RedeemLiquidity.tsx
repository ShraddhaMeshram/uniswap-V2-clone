"use client";
import { useState } from "react";
import { ethers } from "ethers";
import useEthereum from "@/src/hooks/useEthereum";
import { usePool } from "@/src/context/PoolContext";
import { ERC20_ABI } from "@/src/abis/erc20";
import { CONTRACT_ADDRESSES } from "@/src/utils/loadAddresses";

export default function RedeemLiquidity() {
  const { signer, account } = useEthereum();
  const { selectedPool } = usePool();

  const [lpAmount, setLpAmount] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRedeem = async () => {
    if (!signer || !selectedPool || !lpAmount) return;

    setLoading(true);
    try {
      setStatus({ type: "info", text: "Preparing to redeem liquidity..." });
      
      // Parse the LP amount
      const parsedLP = ethers.parseUnits(lpAmount.trim());
      
      // LP Token (Pair) contract
      const pairAbi = [
        "function getReserves() external view returns (uint112, uint112, uint32)",
        "function token0() external view returns (address)",
        "function token1() external view returns (address)",
        "function totalSupply() external view returns (uint)",
        "function balanceOf(address) external view returns (uint)",
        "function transfer(address, uint) external returns (bool)",
        "function approve(address, uint) external returns (bool)",
        "function burn(address) external returns (uint, uint)"
      ];
      
      const pair = new ethers.Contract(selectedPool.pairAddress, pairAbi, signer);
      
      // Check if user has sufficient LP tokens
      const lpBalance = await pair.balanceOf(account);
      if (lpBalance < parsedLP) {
        throw new Error(`Insufficient LP tokens. You have ${ethers.formatUnits(lpBalance)} LP tokens.`);
      }
      
      // Get reserves and tokens to estimate return amounts
      const [reserves0, reserves1] = await pair.getReserves();
      const totalSupply = await pair.totalSupply();
      
      // Calculate expected return amounts (for display only)
      const token0Amount = reserves0 * parsedLP / totalSupply;
      const token1Amount = reserves1 * parsedLP / totalSupply;
      
      console.log(`Expected return: ~${ethers.formatUnits(token0Amount)} token0, ~${ethers.formatUnits(token1Amount)} token1`);
      
      // Direct burn approach instead of using router
      setStatus({ type: "info", text: "Transferring LP tokens to pair..." });
      
      // Option 1: Transfer LP tokens back to the pair address (some implementations need this)
      try {
        const transferTx = await pair.transfer(selectedPool.pairAddress, parsedLP, {
          gasLimit: 200000
        });
        await transferTx.wait();
        console.log("LP tokens transferred back to pair");
      } catch (transferError) {
        console.error("Error transferring LP tokens:", transferError);
        
        // Option 2: If transfer failed, try direct burn
        setStatus({ type: "info", text: "Burning LP tokens directly..." });
        const burnTx = await pair.burn(account, {
          gasLimit: 300000
        });
        await burnTx.wait();
        console.log("LP tokens burned directly");
      }
      
      setStatus({ type: "success", text: "✅ Liquidity redeemed successfully!" });
      setLpAmount("");
    } catch (err) {
      console.error(err);
      let errorMessage = "Failed to redeem liquidity";
      if (err?.error?.message) errorMessage = err.error.message;
      else if (err?.reason) errorMessage = err.reason;
      else if (err?.message) errorMessage = err.message;
      
      setStatus({ type: "error", text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  // Add max button functionality
  const handleMaxClick = async () => {
    if (!signer || !selectedPool) return;
    
    try {
      const pairContract = new ethers.Contract(selectedPool.pairAddress, ERC20_ABI, signer);
      const balance = await pairContract.balanceOf(account);
      setLpAmount(ethers.formatUnits(balance));
    } catch (err) {
      console.error("Failed to get max balance:", err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          className="w-full p-2 border rounded"
          placeholder="Amount of LP tokens"
          value={lpAmount}
          onChange={(e) => setLpAmount(e.target.value)}
        />
        <button
          onClick={handleMaxClick}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
        >
          MAX
        </button>
      </div>
      
      <button
        onClick={handleRedeem}
        disabled={loading || !selectedPool || !lpAmount}
        className="bg-red-600 text-white px-4 py-2 rounded w-full disabled:bg-gray-400"
      >
        {loading ? "Processing..." : "Redeem Liquidity"}
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