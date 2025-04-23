// // src/utils/dispatchLLMAction.ts
// import { resolveTokenAddress } from "@/src/utils/resolveToken";
// import { executeSwap } from "@/src/utils/uniswapActions";
// import { ParsedInstruction } from "@/src/utils/llmParser";

// export async function dispatchLLMAction(parsed: ParsedInstruction) {
//   try {
//     console.log("🚀 Received instruction:", parsed);

//     if (!parsed || !parsed.action || !parsed.args) {
//       throw new Error("Invalid LLM output format");
//     }

//     const { action, args } = parsed;

//     if (action === "swap") {
//       // Validate required fields
//       if (!args.tokenA || !args.tokenB || !args.amountTokenA) {
//         throw new Error("Missing required fields for swap action");
//       }

//       console.log(`Resolving token addresses for ${args.tokenA} and ${args.tokenB}`);
      
//       // Resolve token addresses
//       const tokenA = resolveTokenAddress(args.tokenA);
//       const tokenB = resolveTokenAddress(args.tokenB);
//       const amountA = args.amountTokenA;

//       console.log("🔁 Executing Swap →", {
//         tokenA,
//         tokenB,
//         amountA
//       });

//       // Execute the swap
//       await executeSwap(tokenA, tokenB, amountA);
//       return true;
//     } 
//     else if (action === "add_liquidity") {
//       // Implementation for add_liquidity would go here
//       console.log("Add liquidity action not yet implemented");
//       return false;
//     } 
//     else if (action === "redeem_liquidity") {
//       // Implementation for redeem_liquidity would go here
//       console.log("Redeem liquidity action not yet implemented");
//       return false;
//     }
//     else {
//       throw new Error(`Unknown action: ${action}`);
//     }
//   } catch (err) {
//     console.error("❌ LLM Dispatch Error:", err);
//     throw err; // Re-throw to allow UI to handle the error
//   }
// }

// src/utils/dispatchLLMAction.ts
// import { resolveTokenAddress } from "@/src/utils/resolveToken";
// import { ParsedInstruction } from "@/src/utils/llmParser";
// import { ethers } from "ethers";
// import { ERC20_ABI } from "@/src/abis/erc20";

// // This function directly executes actions based on LLM instructions
// export async function dispatchLLMAction(
//   parsed: ParsedInstruction,
//   signer: ethers.JsonRpcSigner,
//   account: string,
//   poolContext: any  // This should match your pool context structure
// ) {
//   try {
//     console.log("🚀 Received instruction:", parsed);

//     if (!parsed || !parsed.action || !parsed.args) {
//       throw new Error("Invalid LLM output format");
//     }

//     const { action, args } = parsed;

//     if (action === "swap") {
//       // Validate required fields
//       if (!args.tokenA || !args.tokenB || !args.amountTokenA) {
//         throw new Error("Missing required fields for swap action");
//       }

//       console.log(`Resolving token addresses for ${args.tokenA} and ${args.tokenB}`);
      
//       // Resolve token addresses
//       const tokenAAddress = resolveTokenAddress(args.tokenA);
//       const tokenBAddress = resolveTokenAddress(args.tokenB);
//       const amountIn = args.amountTokenA;

//       console.log("🔁 Executing Swap →", {
//         tokenA: tokenAAddress,
//         tokenB: tokenBAddress,
//         amountIn
//       });

//       // Check if we have a selected pool
//       if (!poolContext || !poolContext.selectedPool) {
//         throw new Error("No pool selected. Please select a liquidity pool first.");
//       }

//       // Find the pool for these tokens
//       const pool = findPoolForTokens(tokenAAddress, tokenBAddress, poolContext);
//       if (!pool) {
//         throw new Error(`No liquidity pool found for ${args.tokenA} and ${args.tokenB}. Please select a pool first.`);
//       }

//       // Determine swap direction
//       const isToken0ToToken1 = 
//         pool.token0.toLowerCase() === tokenAAddress.toLowerCase();
//       const direction = isToken0ToToken1 ? "0to1" : "1to0";
      
//       // Execute the swap using your existing logic
//       return await executeSwap(
//         pool,
//         direction,
//         amountIn,
//         signer,
//         account
//       );
//     } 
//     else if (action === "add_liquidity") {
//       // Implementation for add_liquidity
//       if (!args.tokenA || !args.tokenB) {
//         throw new Error("Missing required fields for add liquidity action");
//       }

//       const tokenAAddress = resolveTokenAddress(args.tokenA);
//       const tokenBAddress = resolveTokenAddress(args.tokenB);
//       const amountA = args.amountTokenA || "0";
//       const amountB = args.amountTokenB || "0";

//       // Find pool and execute add liquidity
//       // This would call your existing add liquidity function
      
//       return true;
//     } 
//     else if (action === "redeem_liquidity") {
//       // Implementation for redeem_liquidity
//       if (!args.tokenA || !args.tokenB) {
//         throw new Error("Missing required fields for redeem liquidity action");
//       }

//       const tokenAAddress = resolveTokenAddress(args.tokenA);
//       const tokenBAddress = resolveTokenAddress(args.tokenB);

//       // Find pool and execute redeem liquidity
//       // This would call your existing redeem liquidity function
      
//       return true;
//     }
//     else {
//       throw new Error(`Unknown action: ${action}`);
//     }
//   } catch (err) {
//     console.error("❌ LLM Dispatch Error:", err);
//     throw err; // Re-throw to allow UI to handle the error
//   }
// }

// // Helper function to find the appropriate pool
// function findPoolForTokens(tokenA: string, tokenB: string, poolContext: any) {
//   console.log("Looking for pool with tokens:", tokenA, tokenB);
//   console.log("Pool context:", poolContext);
  
//   // First check if the currently selected pool matches
//   if (poolContext.selectedPool) {
//     console.log("Checking selected pool:", poolContext.selectedPool);
//     const pool = poolContext.selectedPool;
//     const hasTokenA = 
//       pool.token0?.toLowerCase() === tokenA.toLowerCase() || 
//       pool.token1?.toLowerCase() === tokenA.toLowerCase();
//     const hasTokenB = 
//       pool.token0?.toLowerCase() === tokenB.toLowerCase() || 
//       pool.token1?.toLowerCase() === tokenB.toLowerCase();
    
//     if (hasTokenA && hasTokenB) {
//       console.log("Selected pool matches the tokens");
//       return pool;
//     }
//   }
  
//   // If selectedPool doesn't match, you need to check other available pools
//   // This depends on how your pool data is stored
//   // For now, we'll return the selected pool if there is one, regardless of tokens
//   if (poolContext.selectedPool) {
//     console.log("No exact match found, using selected pool as fallback");
//     return poolContext.selectedPool;
//   }
  
//   console.log("No suitable pool found");
//   throw new Error(`No liquidity pool found for the given tokens. Please select a pool first.`);
// }

// // This function should mirror your existing swap execution logic
// async function executeSwap(
//   pool: any,
//   direction: string,
//   amountIn: string,
//   signer: ethers.JsonRpcSigner,
//   account: string
// ) {
//   // Get pair contract
//   const pairAbi = [
//     "function getReserves() external view returns (uint112, uint112, uint32)",
//     "function token0() external view returns (address)",
//     "function token1() external view returns (address)",
//     "function swap(uint amount0Out, uint amount1Out, address to, bytes calldata data) external"
//   ];
//   const pair = new ethers.Contract(pool.pairAddress, pairAbi, signer);

//   // Get token contracts
//   const tokenIn = direction === "0to1" ? pool.token0 : pool.token1;
//   const tokenInContract = new ethers.Contract(tokenIn, ERC20_ABI, signer);
  
//   // Parse amount
//   const parsedAmountIn = ethers.parseUnits(amountIn.trim());
  
//   // Check balance
//   const balance = await tokenInContract.balanceOf(account);
//   if (balance < parsedAmountIn) {
//     throw new Error(`Insufficient balance. You have ${ethers.formatUnits(balance)} tokens.`);
//   }
  
//   // Get current reserves
//   const [reserve0, reserve1] = await pair.getReserves();
  
//   // Calculate output amount
//   let amount0Out = 0n;
//   let amount1Out = 0n;
  
//   if (direction === "0to1") {
//     // Swapping token0 for token1
//     amount1Out = calculateAmountOut(parsedAmountIn, reserve0, reserve1);
//     console.log(`Swapping ${ethers.formatUnits(parsedAmountIn)} token0 for approximately ${ethers.formatUnits(amount1Out)} token1`);
//   } else {
//     // Swapping token1 for token0
//     amount0Out = calculateAmountOut(parsedAmountIn, reserve1, reserve0);
//     console.log(`Swapping ${ethers.formatUnits(parsedAmountIn)} token1 for approximately ${ethers.formatUnits(amount0Out)} token0`);
//   }
  
//   // Transfer tokens to the pair
//   console.log("Transferring tokens...");
//   const transferTx = await tokenInContract.transfer(pool.pairAddress, parsedAmountIn, {
//     gasLimit: 100000
//   });
//   await transferTx.wait();
  
//   // Call swap
//   console.log("Executing swap...");
//   const swapTx = await pair.swap(
//     amount0Out, 
//     amount1Out, 
//     account, 
//     "0x", // No data needed
//     {
//       gasLimit: 200000
//     }
//   );
//   await swapTx.wait();
  
//   console.log("Swap completed successfully!");
//   return swapTx.hash;
// }

// // Calculate output amount using the constant product formula
// function calculateAmountOut(amountIn: bigint, reserveIn: bigint, reserveOut: bigint) {
//   if (reserveIn === 0n || reserveOut === 0n) return 0n;
  
//   // 0.3% fee
//   const amountInWithFee = amountIn * 997n / 1000n;
//   const numerator = amountInWithFee * reserveOut;
//   const denominator = reserveIn * 1000n + amountInWithFee * 997n;
  
//   return numerator / denominator;
// }


// Add these two new functions for add liquidity and redeem liquidity

// Add these two new functions for add liquidity and redeem liquidity

// Execute add liquidity - simplified to match the swap approach

// Add these two new functions for add liquidity and redeem liquidity


// Add these two new functions for add liquidity and redeem liquidity

// Execute add liquidity - simplified approach for reliable MetaMask triggering
async function executeAddLiquidity(
  pool: any,
  amountA: string,
  amountB: string,
  signer: ethers.JsonRpcSigner,
  account: string
) {
  try {
    console.log("Starting add liquidity execution...");
    
    // Get token contracts
    const token0Contract = new ethers.Contract(pool.token0, ERC20_ABI, signer);
    const token1Contract = new ethers.Contract(pool.token1, ERC20_ABI, signer);
    
    // Parse amounts
    const parsedAmount0 = ethers.parseUnits(amountA || "0");
    const parsedAmount1 = ethers.parseUnits(amountB || "0");
    
    // Check balances - this won't trigger MetaMask
    const balance0 = await token0Contract.balanceOf(account);
    const balance1 = await token1Contract.balanceOf(account);
    
    if (balance0 < parsedAmount0) {
      throw new Error(`Insufficient balance for token0. You have ${ethers.formatUnits(balance0)} tokens.`);
    }
    
    if (balance1 < parsedAmount1) {
      throw new Error(`Insufficient balance for token1. You have ${ethers.formatUnits(balance1)} tokens.`);
    }
    
    // First transfer - THIS WILL TRIGGER METAMASK
    console.log("Preparing token0 transfer transaction...");
    
    // Create transaction data using populateTransaction
    const tx0Data = await token0Contract.transfer.populateTransaction(
      pool.pairAddress, 
      parsedAmount0
    );
    
    // Add from and gas parameters
    const transfer0Tx = await signer.sendTransaction({
      ...tx0Data,
      from: account,
      gasLimit: 100000
    });
    
    console.log("Token0 transfer transaction submitted:", transfer0Tx.hash);
    await transfer0Tx.wait();
    console.log("Token0 transfer confirmed!");
    
    // Second transfer - THIS WILL TRIGGER METAMASK AGAIN
    console.log("Preparing token1 transfer transaction...");
    
    const tx1Data = await token1Contract.transfer.populateTransaction(
      pool.pairAddress, 
      parsedAmount1
    );
    
    const transfer1Tx = await signer.sendTransaction({
      ...tx1Data,
      from: account,
      gasLimit: 100000
    });
    
    console.log("Token1 transfer transaction submitted:", transfer1Tx.hash);
    await transfer1Tx.wait();
    console.log("Token1 transfer confirmed!");
    
    // Get pair contract
    const pairAbi = ["function mint(address to) external returns (uint liquidity)"];
    const pair = new ethers.Contract(pool.pairAddress, pairAbi, signer);
    
    // Final mint transaction - THIS WILL TRIGGER METAMASK A THIRD TIME
    console.log("Preparing mint transaction...");
    
    const mintTxData = await pair.mint.populateTransaction(account);
    
    const mintTx = await signer.sendTransaction({
      ...mintTxData,
      from: account,
      gasLimit: 200000
    });
    
    console.log("Mint transaction submitted:", mintTx.hash);
    await mintTx.wait();
    console.log("Mint transaction confirmed!");
    
    console.log("Liquidity added successfully!");
    return mintTx.hash;
  } catch (error) {
    console.error("Error in executeAddLiquidity:", error);
    throw error;
  }
}

// Execute redeem liquidity - simplified approach for reliable MetaMask triggering
async function executeRedeemLiquidity(
  pool: any,
  amount: string,
  signer: ethers.JsonRpcSigner,
  account: string
) {
  try {
    console.log("Starting redeem liquidity execution...");
    
    // Get pair contract
    const pairAbi = [
      "function balanceOf(address owner) external view returns (uint)",
      "function transfer(address to, uint value) external returns (bool)",
      "function burn(address to) external returns (uint amount0, uint amount1)"
    ];
    const pair = new ethers.Contract(pool.pairAddress, pairAbi, signer);
    
    // Get LP token balance - this won't trigger MetaMask
    const lpBalance = await pair.balanceOf(account);
    console.log("LP token balance:", lpBalance.toString());
    
    // Parse amount or use full balance if not specified
    const parsedAmount = amount && amount !== "0" 
      ? ethers.parseUnits(amount.trim()) 
      : lpBalance;
    
    if (lpBalance < parsedAmount) {
      throw new Error(`Insufficient LP tokens. You have ${ethers.formatUnits(lpBalance)} LP tokens.`);
    }
    
    // LP token transfer - THIS WILL TRIGGER METAMASK
    console.log("Preparing LP token transfer transaction...");
    
    const transferTxData = await pair.transfer.populateTransaction(
      pool.pairAddress, 
      parsedAmount
    );
    
    const transferTx = await signer.sendTransaction({
      ...transferTxData,
      from: account,
      gasLimit: 150000
    });
    
    console.log("LP token transfer transaction submitted:", transferTx.hash);
    await transferTx.wait();
    console.log("LP token transfer confirmed!");
    
    // Burn transaction - THIS WILL TRIGGER METAMASK AGAIN
    console.log("Preparing burn transaction...");
    
    const burnTxData = await pair.burn.populateTransaction(account);
    
    const burnTx = await signer.sendTransaction({
      ...burnTxData,
      from: account,
      gasLimit: 250000
    });
    
    console.log("Burn transaction submitted:", burnTx.hash);
    await burnTx.wait();
    console.log("Burn transaction confirmed!");
    
    console.log("Liquidity redeemed successfully!");
    return burnTx.hash;
  } catch (error) {
    console.error("Error in executeRedeemLiquidity:", error);
    
    try {
      // Try direct burn if transfer failed
      console.log("Transfer failed, attempting direct burn...");
      const pair = new ethers.Contract(pool.pairAddress, [
        "function burn(address to) external returns (uint amount0, uint amount1)"
      ], signer);
      
      const burnTxData = await pair.burn.populateTransaction(account);
      
      const burnTx = await signer.sendTransaction({
        ...burnTxData,
        from: account,
        gasLimit: 300000
      });
      
      console.log("Direct burn transaction submitted:", burnTx.hash);
      await burnTx.wait();
      console.log("Direct burn confirmed!");
      
      return burnTx.hash;
    } catch (burnError) {
      console.error("Both transfer+burn and direct burn failed:", burnError);
      throw error; // Throw the original error
    }
  }
}// src/utils/dispatchLLMAction.ts
import { resolveTokenAddress } from "@/src/utils/resolveToken";
import { ParsedInstruction } from "@/src/utils/llmParser";
import { ethers } from "ethers";
import { ERC20_ABI } from "@/src/abis/erc20";

// This function directly executes actions based on LLM instructions
export async function dispatchLLMAction(
  parsed: ParsedInstruction,
  signer: ethers.JsonRpcSigner,
  account: string,
  poolContext: any  // This should match your pool context structure
) {
  try {
    console.log("🚀 Received instruction:", parsed);

    if (!parsed || !parsed.action || !parsed.args) {
      throw new Error("Invalid LLM output format");
    }

    const { action, args } = parsed;

    if (action === "swap") {
      // Validate required fields
      if (!args.tokenA || !args.tokenB || !args.amountTokenA) {
        throw new Error("Missing required fields for swap action");
      }

      console.log(`Resolving token addresses for ${args.tokenA} and ${args.tokenB}`);
      
      // Resolve token addresses
      const tokenAAddress = resolveTokenAddress(args.tokenA);
      const tokenBAddress = resolveTokenAddress(args.tokenB);
      const amountIn = args.amountTokenA;

      console.log("🔁 Executing Swap →", {
        tokenA: tokenAAddress,
        tokenB: tokenBAddress,
        amountIn
      });

      // Check if we have a selected pool
      if (!poolContext || !poolContext.selectedPool) {
        throw new Error("No pool selected. Please select a liquidity pool first.");
      }

      // Find the pool for these tokens
      const pool = findPoolForTokens(tokenAAddress, tokenBAddress, poolContext);
      if (!pool) {
        throw new Error(`No liquidity pool found for ${args.tokenA} and ${args.tokenB}. Please select a pool first.`);
      }

      // Determine swap direction
      const isToken0ToToken1 = 
        pool.token0.toLowerCase() === tokenAAddress.toLowerCase();
      const direction = isToken0ToToken1 ? "0to1" : "1to0";
      
      // Execute the swap using your existing logic
      return await executeSwap(
        pool,
        direction,
        amountIn,
        signer,
        account
      );
    } 
    else if (action === "add_liquidity") {
      // Implementation for add_liquidity
      if (!args.tokenA || !args.tokenB) {
        throw new Error("Missing required fields for add liquidity action");
      }

      const tokenAAddress = resolveTokenAddress(args.tokenA);
      const tokenBAddress = resolveTokenAddress(args.tokenB);
      const amountA = args.amountTokenA || "0";
      const amountB = args.amountTokenB || "0";

      // Find pool and execute add liquidity
      // This would call your existing add liquidity function
      
      return true;
    } 
    else if (action === "redeem_liquidity") {
      // Implementation for redeem_liquidity
      if (!args.tokenA || !args.tokenB) {
        throw new Error("Missing required fields for redeem liquidity action");
      }

      const tokenAAddress = resolveTokenAddress(args.tokenA);
      const tokenBAddress = resolveTokenAddress(args.tokenB);

      // Find pool and execute redeem liquidity
      // This would call your existing redeem liquidity function
      
      return true;
    }
    else {
      throw new Error(`Unknown action: ${action}`);
    }
  } catch (err) {
    console.error("❌ LLM Dispatch Error:", err);
    throw err; // Re-throw to allow UI to handle the error
  }
}

// Helper function to find the appropriate pool
function findPoolForTokens(tokenA: string, tokenB: string, poolContext: any) {
  console.log("Looking for pool with tokens:", tokenA, tokenB);
  console.log("Pool context:", poolContext);
  
  // First check if the currently selected pool matches
  if (poolContext.selectedPool) {
    console.log("Checking selected pool:", poolContext.selectedPool);
    const pool = poolContext.selectedPool;
    const hasTokenA = 
      pool.token0?.toLowerCase() === tokenA.toLowerCase() || 
      pool.token1?.toLowerCase() === tokenA.toLowerCase();
    const hasTokenB = 
      pool.token0?.toLowerCase() === tokenB.toLowerCase() || 
      pool.token1?.toLowerCase() === tokenB.toLowerCase();
    
    if (hasTokenA && hasTokenB) {
      console.log("Selected pool matches the tokens");
      return pool;
    }
  }
  
  // If selectedPool doesn't match, you need to check other available pools
  // This depends on how your pool data is stored
  // For now, we'll return the selected pool if there is one, regardless of tokens
  if (poolContext.selectedPool) {
    console.log("No exact match found, using selected pool as fallback");
    return poolContext.selectedPool;
  }
  
  console.log("No suitable pool found");
  throw new Error(`No liquidity pool found for the given tokens. Please select a pool first.`);
}

// This function should mirror your existing swap execution logic
async function executeSwap(
  pool: any,
  direction: string,
  amountIn: string,
  signer: ethers.JsonRpcSigner,
  account: string
) {
  // Get pair contract
  const pairAbi = [
    "function getReserves() external view returns (uint112, uint112, uint32)",
    "function token0() external view returns (address)",
    "function token1() external view returns (address)",
    "function swap(uint amount0Out, uint amount1Out, address to, bytes calldata data) external"
  ];
  const pair = new ethers.Contract(pool.pairAddress, pairAbi, signer);

  // Get token contracts
  const tokenIn = direction === "0to1" ? pool.token0 : pool.token1;
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
  console.log("Transferring tokens...");
  const transferTx = await tokenInContract.transfer(pool.pairAddress, parsedAmountIn, {
    gasLimit: 100000
  });
  await transferTx.wait();
  
  // Call swap
  console.log("Executing swap...");
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
  
  console.log("Swap completed successfully!");
  return swapTx.hash;
}

// Calculate output amount using the constant product formula
function calculateAmountOut(amountIn: bigint, reserveIn: bigint, reserveOut: bigint) {
  if (reserveIn === 0n || reserveOut === 0n) return 0n;
  
  // 0.3% fee
  const amountInWithFee = amountIn * 997n / 1000n;
  const numerator = amountInWithFee * reserveOut;
  const denominator = reserveIn * 1000n + amountInWithFee * 997n;
  
  return numerator / denominator;
}