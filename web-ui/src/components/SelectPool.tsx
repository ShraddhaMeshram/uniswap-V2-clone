"use client";

import { usePool } from "@/src/context/PoolContext";

export default function SelectPool() {
  const { pools, selectedPool, setSelectedPool } = usePool();

  if (!pools) {
    return <div className="text-gray-500">Loading pools...</div>;
  }

  if (pools.length === 0) {
    return <div className="text-gray-500">No pools found.</div>;
  }

  return (
    <div className="space-y-4">
      {pools.map((pool, index) => {
        const isSelected = selectedPool?.pairAddress === pool.address;
        return (
          <div
            key={index}
            onClick={() =>
              setSelectedPool({
                pairAddress: pool.address,
                token0: pool.token0,
                token1: pool.token1,
              })
            }
            className={`cursor-pointer p-4 border rounded shadow transition-all duration-200 ${
              isSelected ? "border-blue-600 bg-blue-50" : "border-gray-300 hover:bg-blue-50"
            }`}
          >
            <div className="font-semibold">Pool {index + 1}</div>
            <div className="text-sm">Token 0: {pool.token0}</div>
            <div className="text-sm">Token 1: {pool.token1}</div>
            <div className="text-xs text-gray-500">Address: {pool.address}</div>
          </div>
        );
      })}
    </div>
  );
}
