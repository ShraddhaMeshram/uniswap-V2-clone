"use client";

import { useEffect, useState } from "react";
import useEthereum from "@/src/hooks/useEthereum";
import dynamic from "next/dynamic";
import { usePool } from "@/src/context/PoolContext";

// Import the action dispatcher
import { dispatchLLMAction } from "@/src/utils/dispatchLLMAction";

// Lazy imports for components
const CreateLiquidityPool = dynamic(() => import("@/src/components/CreateLiquidityPool"), { ssr: false });
const AddLiquidity = dynamic(() => import("@/src/components/AddLiquidity"), { ssr: false });
const RedeemLiquidity = dynamic(() => import("@/src/components/RedeemLiquidity"), { ssr: false });
const SelectPool = dynamic(() => import("@/src/components/SelectPool"), { ssr: false });
const ReserveChart = dynamic(() => import("@/src/components/ReserveChart"), { ssr: false });
const ExecutionPriceChart = dynamic(() => import("@/src/components/ExecutionPriceChart"), { ssr: false });
const Swap = dynamic(() => import("@/src/components/Swap"), { ssr: false });
const LLMInterface = dynamic(() => import("@/src/components/LLMInterface"), { ssr: false });

export default function HomeDashboard() {
  const { signer, account, isConnected, isConnecting, connect } = useEthereum();
  const poolContext = usePool();
  const { selectedPool } = poolContext;

  const [ready, setReady] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<{
    status: 'idle' | 'pending' | 'success' | 'error';
    message: string;
    txHash?: string;
  }>({ status: 'idle', message: '' });

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      setReady(true);
    }
  }, []);

  // Handler for the LLM parsed output
  const handleLLMParsed = async (parsed: any) => {
    try {
      setTransactionStatus({ status: 'pending', message: 'Processing instruction...' });
      
      // Check if wallet is connected
      if (!isConnected) {
        setTransactionStatus({ 
          status: 'error', 
          message: 'Wallet not connected. Please connect your wallet first.'
        });
        return;
      }

      // Make sure we have signer and account
      if (!signer || !account) {
        throw new Error("Wallet not properly connected");
      }
      
      // Dispatch the action with signer, account, and pool context for direct execution
      const result = await dispatchLLMAction(parsed, signer, account, poolContext);
      
      setTransactionStatus({ 
        status: 'success', 
        message: 'Transaction completed successfully!',
        txHash: typeof result === 'string' ? result : undefined
      });
      
      // Reset status after a delay
      setTimeout(() => {
        setTransactionStatus({ status: 'idle', message: '' });
      }, 7000);
    } catch (error: any) {
      console.error("Transaction failed:", error);
      setTransactionStatus({ 
        status: 'error', 
        message: `Transaction failed: ${error.message || 'Unknown error'}` 
      });
    }
  };

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <header className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Uniswap V2 UI</h1>
        {!isConnected ? (
          <button
            onClick={connect}
            disabled={isConnecting}
            className="bg-white text-blue-600 px-4 py-1 rounded hover:bg-gray-100 disabled:bg-gray-300"
          >
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </button>
        ) : (
          <div className="text-sm bg-blue-700 px-2 py-1 rounded">
            {account?.substring(0, 6)}...{account?.substring(account.length - 4)}
          </div>
        )}
      </header>

      <main className="max-w-3xl mx-auto p-6 space-y-10">
        {/* Transaction Status Banner */}
        {transactionStatus.status !== 'idle' && (
          <div className={`p-4 rounded ${
            transactionStatus.status === 'pending' ? 'bg-yellow-100 border border-yellow-400' :
            transactionStatus.status === 'success' ? 'bg-green-100 border border-green-400' :
            'bg-red-100 border border-red-400'
          }`}>
            <p className={`${
              transactionStatus.status === 'pending' ? 'text-yellow-700' :
              transactionStatus.status === 'success' ? 'text-green-700' :
              'text-red-700'
            }`}>
              {transactionStatus.message}
            </p>
            {transactionStatus.txHash && (
              <p className="text-sm mt-2 break-all">
                Transaction hash: {transactionStatus.txHash}
              </p>
            )}
          </div>
        )}

       

        <section className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">➕ Create Liquidity Pool</h2>
          <CreateLiquidityPool />
        </section>

        <section className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">🏖️ Select a Pool</h2>
          <SelectPool onSelect={(address) => console.log("Selected Pool:", address)} />
        </section>

        <section className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">🧪 Add Liquidity</h2>
          <AddLiquidity />
        </section>

        <section className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">🔁 Swap Tokens</h2>
          <Swap />
        </section>

        <section className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">♻️ Redeem Liquidity</h2>
          <RedeemLiquidity />
        </section>

        <section className="bg-white p-4 rounded shadow">
          <ReserveChart />
        </section>

        <ExecutionPriceChart pairAddress={selectedPool?.pairAddress} />

        <LLMInterface onParsed={handleLLMParsed} />
      </main>
    </div>
  );
}