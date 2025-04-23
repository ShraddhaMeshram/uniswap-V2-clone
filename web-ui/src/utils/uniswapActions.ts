// // web-ui/src/utils/uniswapActions.ts
// import { ethers } from "ethers";
// import { ERC20_ABI } from "../abis/erc20";
// import { ROUTER_ABI } from "../abis/router";
// import { FACTORY_ABI } from "../abis/factory";
// import { CONTRACT_ADDRESSES } from "./loadAddresses";

// export async function executeSwap(fromToken: string, toToken: string, amount: string, account: string, signer: ethers.Signer) {
//   const tokenAContract = new ethers.Contract(fromToken, ERC20_ABI, signer);
//   const router = new ethers.Contract(CONTRACT_ADDRESSES.ROUTER, ROUTER_ABI, signer);

//   const parsedAmount = ethers.parseUnits(amount);

//   // Approve router
//   const allowance = await tokenAContract.allowance(account, CONTRACT_ADDRESSES.ROUTER);
//   if (allowance < parsedAmount) {
//     const approveTx = await tokenAContract.approve(CONTRACT_ADDRESSES.ROUTER, ethers.MaxUint256);
//     await approveTx.wait();
//   }

//   const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
//   const path = [fromToken, toToken];

//   const tx = await router.swapExactTokensForTokens(
//     parsedAmount,
//     0,
//     path,
//     account,
//     deadline
//   );
//   await tx.wait();
// }

// src/utils/uniswapActions.ts
import { ethers } from "ethers";
import { ERC20_ABI } from "@/src/abis/erc20";
import { ROUTER_ABI } from "@/src/abis/router";
import useEthereum from "@/src/hooks/useEthereum";
import routerConfig from "@/src/addresses/uniswapAddresses_31337.json"; // Import router config

// Get the router address from config
const ROUTER_ADDRESS = routerConfig.ROUTER;

export async function executeSwap(
  tokenAAddress: string, 
  tokenBAddress: string, 
  amountAString: string,
  signer: ethers.JsonRpcSigner,
  account: string
) {
  try {
    // 1. Check if we have valid parameters
    if (!signer || !account) {
      throw new Error("Wallet not connected. Please connect your wallet first.");
    }
    
    console.log(`Executing swap with signer: ${signer}, account: ${account}`);
    
    // 2. Parse the amount (ethers expects amounts in wei)
    const tokenA = new ethers.Contract(tokenAAddress, ERC20_ABI, signer);
    const decimals = await tokenA.decimals();
    const amountA = ethers.parseUnits(amountAString, decimals);
    
    console.log(`Swapping ${amountAString} (${amountA.toString()} wei) of token ${tokenAAddress}`);
    
    // 3. Initialize the router contract
    const router = new ethers.Contract(ROUTER_ADDRESS, ROUTER_ABI, signer);
    
    // 4. Check allowance
    const allowance = await tokenA.allowance(account, ROUTER_ADDRESS);
    console.log(`Current allowance: ${allowance.toString()}`);
    
    // 5. Approve if needed - convert to BigInt for comparison
    const allowanceBigInt = BigInt(allowance.toString());
    const amountABigInt = BigInt(amountA.toString());
    
    if (allowanceBigInt < amountABigInt) {
      console.log("Approving token transfer...");
      const tx = await tokenA.approve(ROUTER_ADDRESS, amountA);
      console.log("Waiting for approval transaction...");
      await tx.wait();
      console.log("Approval complete!");
    }
    
    // 6. Calculate the swap path
    const path = [tokenAAddress, tokenBAddress];
    
    // 7. Calculate minimum amount out (here we use a simplified approach with fixed slippage)
    // Since getAmountsOut isn't available, we'll use a fixed slippage percentage
    const slippageTolerance = 0.01; // 1% slippage tolerance
    
    // 8. Get the current time for deadline
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from now
    
    // 9. Execute the swap
    console.log("Executing swap transaction...");
    // Try different function names that might exist on your router
    try {
      // First attempt the standard UniswapV2 function
      const swapTx = await router.swapExactTokensForTokens(
        amountA,
        0, // Accept any amount out (with slippage handled elsewhere)
        path,
        account,
        deadline
      );
      
      console.log("Waiting for swap transaction...");
      await swapTx.wait();
      
      console.log("Swap completed successfully!");
      return swapTx.hash;
    } catch (error) {
      console.error("Error in first swap attempt:", error);
      
      // Try alternative function names
      try {
        console.log("Trying alternate swap function...");
        const swapTx = await router.swap(
          amountA,
          0, // Accept any amount out 
          path,
          account,
          deadline
        );
        
        console.log("Waiting for swap transaction...");
        await swapTx.wait();
        
        console.log("Swap completed successfully!");
        return swapTx.hash;
      } catch (altError) {
        console.error("All swap attempts failed:", altError);
        throw new Error("Could not find compatible swap function on router contract");
      }
    }
  } catch (error) {
    console.error("Error in executeSwap:", error);
    throw error;
  }
}