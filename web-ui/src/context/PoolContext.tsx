// src/context/PoolContext.tsx
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import { FACTORY_ABI } from "@/src/abis/factory";
import { PAIR_ABI } from "@/src/abis/pair";
import { CONTRACT_ADDRESSES } from "@/src/utils/loadAddresses";
import useEthereum from "@/src/hooks/useEthereum";

interface Pool {
  address: string;
  token0: string;
  token1: string;
}

interface PoolContextType {
  pools: Pool[];
  selectedPool: Pool | null;
  setSelectedPool: (pool: Pool) => void;
  fetchPools: () => Promise<void>;
}

const PoolContext = createContext<PoolContextType>({
  pools: [],
  selectedPool: null,
  setSelectedPool: () => {},
  fetchPools: async () => {},
});

export const PoolProvider = ({ children }: { children: React.ReactNode }) => {
  const { signer } = useEthereum();
  const [pools, setPools] = useState<Pool[]>([]);
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);

  const fetchPools = async () => {
    if (!signer) return;

    const factory = new ethers.Contract(CONTRACT_ADDRESSES.FACTORY, FACTORY_ABI, signer);
    const total = await factory.allPairsLength();
    const fetched: Pool[] = [];

    for (let i = 0; i < total; i++) {
      const addr = await factory.allPairs(i);
      const pair = new ethers.Contract(addr, PAIR_ABI, signer);
      const token0 = await pair.token0();
      const token1 = await pair.token1();
      fetched.push({ address: addr, token0, token1 });
    }

    setPools(fetched);
  };

  useEffect(() => {
    fetchPools();
  }, [signer]);

  return (
    <PoolContext.Provider value={{ pools, selectedPool, setSelectedPool, fetchPools }}>
      {children}
    </PoolContext.Provider>
  );
};

export const usePool = () => useContext(PoolContext);
