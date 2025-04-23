// "use client";

// import { useState } from "react";
// import { parseInstructionWithMistral, ParsedInstruction } from "@/src/utils/llmParser";

// export default function LLMInterface() {
//   const [instruction, setInstruction] = useState("");
//   const [parsed, setParsed] = useState<ParsedInstruction | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);

//   const handleParse = async () => {
//     setParsed(null);
//     setError(null);
//     setLoading(true);
//     try {
//       const result = await parseInstructionWithMistral(instruction);
//       setParsed(result);
//     } catch (err: any) {
//       console.error("Parsing failed:", err);
//       setError(err.message || "Unknown error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="bg-white p-6 rounded shadow mt-6">
//       <h2 className="text-xl font-semibold mb-4">🧠 Natural Language to Uniswap Action</h2>

//       <textarea
//         className="w-full border p-2 rounded mb-4"
//         placeholder="e.g. Swap 5 USDC to WETH"
//         value={instruction}
//         onChange={(e) => setInstruction(e.target.value)}
//         rows={3}
//       />

//       <button
//         className="bg-indigo-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
//         onClick={handleParse}
//         disabled={loading}
//       >
//         {loading ? "Parsing..." : "Parse Instruction"}
//       </button>

//       {error && <p className="text-red-600 mt-4">❌ {error}</p>}

//       {parsed && (
//         <div className="mt-4">
//           <h3 className="font-semibold">✅ Parsed Output</h3>
//           <pre className="bg-gray-100 p-3 rounded mt-2 text-sm overflow-x-auto">
//             {JSON.stringify(parsed, null, 2)}
//           </pre>
//         </div>
//       )}
//     </div>
//   );
// }

// "use client";

// import { useState } from "react";
// import { parseInstructionWithMistral, ParsedInstruction } from "@/src/utils/llmParser";

// type LLMInterfaceProps = {
//   onParsed: (parsed: ParsedInstruction) => void;
// };

// export default function LLMInterface({ onParsed }: LLMInterfaceProps) {
//   const [instruction, setInstruction] = useState("");
//   const [parsed, setParsed] = useState<ParsedInstruction | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);

//   const handleParse = async () => {
//     if (!instruction.trim()) {
//       setError("Please enter an instruction");
//       return;
//     }

//     setParsed(null);
//     setError(null);
//     setLoading(true);
    
//     try {
//       const result = await parseInstructionWithMistral(instruction);
//       setParsed(result);
      
//       // Call the parent's onParsed callback
//       onParsed(result);
//     } catch (err: any) {
//       console.error("Parsing failed:", err);
//       setError(err.message || "Unknown error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleExecute = () => {
//     if (parsed) {
//       onParsed(parsed);
//     }
//   };

//   return (
//     <div className="bg-white p-6 rounded shadow">
//       <h2 className="text-xl font-semibold mb-4">🧠 Natural Language to Uniswap Action</h2>

//       <textarea
//         className="w-full border p-2 rounded mb-4"
//         placeholder="e.g. Swap 0.1 TOKEN_A to TOKEN_B"
//         value={instruction}
//         onChange={(e) => setInstruction(e.target.value)}
//         rows={3}
//       />

//       <div className="flex space-x-2">
//         <button
//           className="bg-indigo-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
//           onClick={handleParse}
//           disabled={loading || !instruction.trim()}
//         >
//           {loading ? "Parsing..." : "Parse Instruction"}
//         </button>

//         {parsed && (
//           <button
//             className="bg-green-600 text-white px-4 py-2 rounded"
//             onClick={handleExecute}
//           >
//             Execute
//           </button>
//         )}
//       </div>

//       {error && <p className="text-red-600 mt-4">❌ {error}</p>}

//       {parsed && (
//         <div className="mt-4">
//           <h3 className="font-semibold flex items-center">
//             <span className="text-green-500 mr-2">✓</span> Parsed Output
//           </h3>
//           <pre className="bg-gray-100 p-3 rounded mt-2 text-sm overflow-x-auto">
//             {JSON.stringify(parsed, null, 2)}
//           </pre>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { parseInstructionWithMistral, ParsedInstruction } from "@/src/utils/llmParser";

type LLMInterfaceProps = {
  onParsed: (parsed: ParsedInstruction) => void;
};

export default function LLMInterface({ onParsed }: LLMInterfaceProps) {
  const [instruction, setInstruction] = useState("");
  const [parsed, setParsed] = useState<ParsedInstruction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Example instructions to help users get started
  const examples = [
    "Swap 0.1 TOKEN_A to TOKEN_B",
    "Add 0.5 TOKEN_A and 0.5 TOKEN_B as liquidity",
    "Redeem liquidity for TOKEN_A/TOKEN_B pool",
    "Exchange 0.2 TOKEN_B for TOKEN_C",
    "Deposit 0.3 TOKEN_A and 0.3 TOKEN_C to the pool"
  ];

  const handleParse = async () => {
    if (!instruction.trim()) {
      setError("Please enter an instruction");
      return;
    }

    setParsed(null);
    setError(null);
    setLoading(true);
    
    try {
      const result = await parseInstructionWithMistral(instruction);
      setParsed(result);
      
      // Call the parent's onParsed callback to execute the instruction
      onParsed(result);
    } catch (err: any) {
      console.error("Parsing failed:", err);
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const setExample = (example: string) => {
    setInstruction(example);
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">🧠 Natural Language to Uniswap Action</h2>
      
      <div className="mb-4">
        <div className="flex flex-wrap gap-2 mb-3">
          {examples.map((example, index) => (
            <button 
              key={index}
              onClick={() => setExample(example)}
              className="text-xs bg-gray-100 hover:bg-gray-200 rounded px-2 py-1 text-gray-700"
            >
              {example}
            </button>
          ))}
        </div>
        
        <textarea
          className="w-full border p-2 rounded mb-2"
          placeholder="e.g. Swap 0.1 TOKEN_A to TOKEN_B"
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          rows={3}
        />
      </div>

      <div className="flex space-x-2">
        <button
          className="bg-indigo-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
          onClick={handleParse}
          disabled={loading || !instruction.trim()}
        >
          {loading ? "Processing..." : "Execute Instruction"}
        </button>
      </div>

      {error && <p className="text-red-600 mt-4">❌ {error}</p>}

      {parsed && (
        <div className="mt-4">
          <h3 className="font-semibold flex items-center">
            <span className="text-green-500 mr-2">✓</span> Parsed Action
          </h3>
          <div className="bg-gray-100 p-3 rounded mt-2 text-sm">
            <p><strong>Action:</strong> {parsed.action}</p>
            <p><strong>Token A:</strong> {parsed.args.tokenA}</p>
            <p><strong>Token B:</strong> {parsed.args.tokenB}</p>
            {parsed.args.amountTokenA && <p><strong>Amount A:</strong> {parsed.args.amountTokenA}</p>}
            {parsed.args.amountTokenB && <p><strong>Amount B:</strong> {parsed.args.amountTokenB}</p>}
            {parsed.args.amount && <p><strong>Amount:</strong> {parsed.args.amount}</p>}
          </div>
        </div>
      )}
    </div>
  );
}