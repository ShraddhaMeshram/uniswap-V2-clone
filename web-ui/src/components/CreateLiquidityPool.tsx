"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { FACTORY_ABI } from "@/src/abis/factory";
import { CONTRACT_ADDRESSES } from "@/src/utils/loadAddresses";
import useEthereum from "@/src/hooks/useEthereum";
import { usePool } from "@/src/context/PoolContext";

export default function CreateLiquidityPool() {
  const { signer } = useEthereum();
  const { fetchPools } = usePool();

  const [tokenA, setTokenA] = useState("");
  const [tokenB, setTokenB] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const createPool = async () => {
    if (!signer || !tokenA || !tokenB) return;

    try {
      setIsLoading(true);
      setMessage("Creating liquidity pool...");

      const factory = new ethers.Contract(CONTRACT_ADDRESSES.FACTORY, FACTORY_ABI, signer);
      const tx = await factory.createPair(tokenA, tokenB);
      await tx.wait();

      setMessage("✅ Pool created successfully!");

      // Refresh pool list after creation
      await fetchPools();

      // Optional: clear form
      setTokenA("");
      setTokenB("");
    } catch (err: any) {
      console.error(err);
      setMessage("❌ Error: " + (err.reason || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        className="w-full border p-2 rounded"
        placeholder="Token A Address"
        value={tokenA}
        onChange={(e) => setTokenA(e.target.value)}
      />
      <input
        className="w-full border p-2 rounded"
        placeholder="Token B Address"
        value={tokenB}
        onChange={(e) => setTokenB(e.target.value)}
      />
      <button
        onClick={createPool}
        disabled={!tokenA || !tokenB || !signer || isLoading}
        className="bg-blue-600 text-white px-4 py-2 rounded w-full"
      >
        {isLoading ? "Creating..." : "Create Pool"}
      </button>
      {message && <p className="text-sm text-gray-800">{message}</p>}
    </div>
  );
}
