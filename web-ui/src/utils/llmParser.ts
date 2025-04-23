// // src/lib/llmParser.ts

// export interface ParsedInstruction {
//     action: "swap" | "addLiquidity" | "redeem";
//     tokenA: string;
//     tokenB: string;
//     amountA?: string;
//     amountB?: string;
//   }
  
//   export async function parseInstructionWithMistral(naturalLanguage: string): Promise<ParsedInstruction> {
//     const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer 7D7GgcMpDzovUoISMxCdDio45RwKjAnU`, // Replace with your actual API key
//       },
//       body: JSON.stringify({
//         model: "mistral-tiny",
//         messages: [
//           {
//             role: "system",
//             content:
//               "You are a Web3 assistant that converts natural language to UniswapV2 structured actions like swap, addLiquidity, redeem. Respond ONLY in JSON.",
//           },
//           {
//             role: "user",
//             content: naturalLanguage,
//           },
//         ],
//         temperature: 0.3,
//       }),
//     });
  
//     if (!response.ok) {
//       const error = await response.text();
//       throw new Error(`Mistral API error: ${error}`);
//     }
  
//     const data = await response.json();
//     const reply = data.choices[0].message.content;
  
//     try {
//       return JSON.parse(reply);
//     } catch (e) {
//       throw new Error("Failed to parse LLM JSON response: " + reply);
//     }
//   }
  

// src/utils/llmParser.ts
// export interface ParsedInstruction {
//     action: string;
//     args: {
//       tokenA: string;
//       tokenB: string;
//       amountTokenA?: string;
//       amountTokenB?: string;
//     };
//   }
  
//   export async function parseInstructionWithMistral(naturalLanguage: string): Promise<ParsedInstruction> {
//     const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer 7D7GgcMpDzovUoISMxCdDio45RwKjAnU`, // Replace with environment variable
//       },
//       body: JSON.stringify({
//         model: "mistral-tiny",
//         messages: [
//           {
//             role: "system",
//             content: `You are a Web3 assistant that converts natural language to UniswapV2 structured actions.
//             Format your response as valid JSON with this structure:
//             {
//               "action": "swap",
//               "args": {
//                 "tokenA": "TOKEN_SYMBOL_A",
//                 "tokenB": "TOKEN_SYMBOL_B", 
//                 "amountTokenA": "AMOUNT_AS_STRING"
//               }
//             }
            
//             Supported actions: "swap", "add_liquidity", "redeem_liquidity"
//             Always use exact token symbols like WETH, USDC, TOKEN_A, TOKEN_B.
//             Return number amounts as strings with decimal points.`,
//           },
//           {
//             role: "user",
//             content: naturalLanguage,
//           },
//         ],
//         temperature: 0.1, // Lower temperature for more deterministic responses
//       }),
//     });
  
//     if (!response.ok) {
//       const error = await response.text();
//       throw new Error(`Mistral API error: ${error}`);
//     }
  
//     const data = await response.json();
//     const reply = data.choices[0].message.content;
  
//     try {
//       // Parse the JSON response
//       const parsed = JSON.parse(reply);
      
//       // Validate the parsed response has the expected structure
//       if (!parsed.action || !parsed.args) {
//         throw new Error("Invalid response format: missing action or args");
//       }
      
//       if (!parsed.args.tokenA || !parsed.args.tokenB) {
//         throw new Error("Invalid response format: missing token information");
//       }
      
//       return parsed;
//     } catch (e) {
//       console.error("Failed to parse LLM JSON response:", reply);
//       throw new Error("Failed to parse LLM response into a valid format");
//     }
//   }


// // src/utils/llmParser.ts
// export interface ParsedInstruction {
//     action: string;
//     args: {
//       tokenA: string;
//       tokenB: string;
//       amountTokenA?: string;
//       amountTokenB?: string;
//       amount?: string; // For redeem_liquidity
//     };
//   }
  
//   export async function parseInstructionWithMistral(naturalLanguage: string): Promise<ParsedInstruction> {
//     const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer 7D7GgcMpDzovUoISMxCdDio45RwKjAnU`, // Using your existing API key
//       },
//       body: JSON.stringify({
//         model: "mistral-tiny",
//         messages: [
//           {
//             role: "system",
//             content: `You are a Web3 assistant that converts natural language to UniswapV2 structured actions.
//             Format your response as valid JSON with this structure:
//             {
//               "action": "action_type",
//               "args": {
//                 "tokenA": "TOKEN_SYMBOL_A",
//                 "tokenB": "TOKEN_SYMBOL_B", 
//                 "amountTokenA": "AMOUNT_AS_STRING",
//                 "amountTokenB": "AMOUNT_AS_STRING" (for add_liquidity),
//                 "amount": "AMOUNT_AS_STRING" (for redeem_liquidity)
//               }
//             }
            
//             Supported actions:
//             1. "swap" - For exchanging one token for another
//                Required args: tokenA, tokenB, amountTokenA
//             2. "add_liquidity" - For adding liquidity to a pool
//                Required args: tokenA, tokenB
//                Optional args: amountTokenA, amountTokenB
//             3. "redeem_liquidity" - For removing liquidity from a pool
//                Required args: tokenA, tokenB
//                Optional args: amount (amount of LP tokens to redeem)
            
//             Always use exact token symbols as given in the instruction (e.g., TOKEN_A, TOKEN_B, TOKEN_C, WETH, USDC).
//             Return number amounts as strings with decimal points.
            
//             Examples:
//             - "swap 0.1 TOKEN_A to TOKEN_B" → {"action": "swap", "args": {"tokenA": "TOKEN_A", "tokenB": "TOKEN_B", "amountTokenA": "0.1"}}
//             - "add 5 TOKEN_A and 3 TOKEN_B as liquidity" → {"action": "add_liquidity", "args": {"tokenA": "TOKEN_A", "tokenB": "TOKEN_B", "amountTokenA": "5", "amountTokenB": "3"}}
//             - "redeem liquidity for TOKEN_A/TOKEN_B pool" → {"action": "redeem_liquidity", "args": {"tokenA": "TOKEN_A", "tokenB": "TOKEN_B"}}`,
//           },
//           {
//             role: "user",
//             content: naturalLanguage,
//           },
//         ],
//         temperature: 0.1, // Lower temperature for more deterministic responses
//       }),
//     });
  
//     if (!response.ok) {
//       const error = await response.text();
//       throw new Error(`Mistral API error: ${error}`);
//     }
  
//     const data = await response.json();
//     const reply = data.choices[0].message.content;
  
//     try {
//       // Parse the JSON response
//       const parsed = JSON.parse(reply);
      
//       // Validate the parsed response has the expected structure
//       if (!parsed.action || !parsed.args) {
//         throw new Error("Invalid response format: missing action or args");
//       }
      
//       // Validate action type
//       if (!["swap", "add_liquidity", "redeem_liquidity"].includes(parsed.action)) {
//         throw new Error(`Invalid action type: ${parsed.action}`);
//       }
      
//       // All actions require tokenA and tokenB
//       if (!parsed.args.tokenA || !parsed.args.tokenB) {
//         throw new Error("Invalid response format: missing token information");
//       }
      
//       // Additional validation for swap action
//       if (parsed.action === "swap" && !parsed.args.amountTokenA) {
//         throw new Error("Swap action requires amountTokenA");
//       }
      
//       return parsed;
//     } catch (e) {
//       console.error("Failed to parse LLM JSON response:", reply);
//       throw new Error("Failed to parse LLM response into a valid format");
//     }
//   }


// src/utils/llmParser.ts
export interface ParsedInstruction {
    action: string;
    args: {
      tokenA: string;
      tokenB: string;
      amountTokenA?: string;
      amountTokenB?: string;
      amount?: string; // For redeem_liquidity
    };
  }
  
  export async function parseInstructionWithMistral(naturalLanguage: string): Promise<ParsedInstruction> {
    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer 7D7GgcMpDzovUoISMxCdDio45RwKjAnU`, // Using your existing API key
      },
      body: JSON.stringify({
        model: "mistral-tiny",
        messages: [
          {
            role: "system",
            content: `You are a Web3 assistant that converts natural language to UniswapV2 structured actions.
            Format your response as valid JSON with this structure:
            {
              "action": "action_type",
              "args": {
                "tokenA": "TOKEN_SYMBOL_A",
                "tokenB": "TOKEN_SYMBOL_B", 
                "amountTokenA": "AMOUNT_AS_STRING",
                "amountTokenB": "AMOUNT_AS_STRING" (for add_liquidity),
                "amount": "AMOUNT_AS_STRING" (for redeem_liquidity)
              }
            }
            
            Supported actions:
            1. "swap" - For exchanging one token for another
               Required args: tokenA, tokenB, amountTokenA
               Example: "swap 0.1 TOKEN_A to TOKEN_B" → {"action": "swap", "args": {"tokenA": "TOKEN_A", "tokenB": "TOKEN_B", "amountTokenA": "0.1"}}
            
            2. "add_liquidity" - For adding liquidity to a pool
               Required args: tokenA, tokenB
               Optional args: amountTokenA, amountTokenB
               Example: "add 5 TOKEN_A and 3 TOKEN_B as liquidity" → {"action": "add_liquidity", "args": {"tokenA": "TOKEN_A", "tokenB": "TOKEN_B", "amountTokenA": "5", "amountTokenB": "3"}}
            
            3. "redeem_liquidity" - For removing liquidity from a pool
               Required args: tokenA, tokenB
               Optional args: amount (amount of LP tokens to redeem)
               Example: "redeem liquidity for TOKEN_A/TOKEN_B pool" → {"action": "redeem_liquidity", "args": {"tokenA": "TOKEN_A", "tokenB": "TOKEN_B"}}
            
            Always use exact token symbols like TOKEN_A, TOKEN_B, TOKEN_C as mentioned in the user's instructions.
            Return number amounts as strings with decimal points.
            
            Common pattern variations to understand:
            - "Swap X A for B" → swap action with tokenA=A, tokenB=B, amountTokenA=X
            - "Exchange X A for B" → swap action with tokenA=A, tokenB=B, amountTokenA=X
            - "Convert X A to B" → swap action with tokenA=A, tokenB=B, amountTokenA=X
            - "Add X A and Y B as liquidity" → add_liquidity with tokenA=A, tokenB=B, amountTokenA=X, amountTokenB=Y
            - "Deposit X A and Y B to pool" → add_liquidity with tokenA=A, tokenB=B, amountTokenA=X, amountTokenB=Y
            - "Redeem liquidity for A/B pool" → redeem_liquidity with tokenA=A, tokenB=B
            - "Remove liquidity from A/B pool" → redeem_liquidity with tokenA=A, tokenB=B
            - "Withdraw from A/B pool" → redeem_liquidity with tokenA=A, tokenB=B`,
          },
          {
            role: "user",
            content: naturalLanguage,
          },
        ],
        temperature: 0.1, // Lower temperature for more deterministic responses
      }),
    });
  
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Mistral API error: ${error}`);
    }
  
    const data = await response.json();
    const reply = data.choices[0].message.content;
  
    try {
      // Parse the JSON response
      const parsed = JSON.parse(reply);
      
      // Validate the parsed response has the expected structure
      if (!parsed.action || !parsed.args) {
        throw new Error("Invalid response format: missing action or args");
      }
      
      // Validate action type
      if (!["swap", "add_liquidity", "redeem_liquidity"].includes(parsed.action)) {
        throw new Error(`Invalid action type: ${parsed.action}`);
      }
      
      // All actions require tokenA and tokenB
      if (!parsed.args.tokenA || !parsed.args.tokenB) {
        throw new Error("Invalid response format: missing token information");
      }
      
      // Additional validation for swap action
      if (parsed.action === "swap" && !parsed.args.amountTokenA) {
        throw new Error("Swap action requires amountTokenA");
      }
      
      return parsed;
    } catch (e) {
      console.error("Failed to parse LLM JSON response:", reply);
      throw new Error("Failed to parse LLM response into a valid format");
    }
  }