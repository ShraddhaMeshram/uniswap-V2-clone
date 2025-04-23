
// import tokenMap from "@/src/addresses/tokenAddresses_31337.json";

// export function resolveTokenAddress(symbol: string): string {
//   const formatted = symbol.trim().toUpperCase();
//   const tokenEntry = Object.entries(tokenMap).find(
//     ([key]) => key.trim().toUpperCase() === formatted
//   );
//   if (!tokenEntry) throw new Error(`Unknown token symbol: ${symbol}`);
//   return tokenEntry[1];
// }


// src/utils/resolveToken.ts
import tokenMap from "@/src/addresses/tokenAddresses_31337.json";

export function resolveTokenAddress(symbol: string): string {
  if (!symbol) {
    throw new Error("Token symbol cannot be empty");
  }
  
  // Normalize the symbol
  const formatted = symbol.trim().toUpperCase();
  
  // Add debugging to see what's being searched
  console.log(`Resolving token: "${formatted}"`);
  console.log("Available tokens:", Object.keys(tokenMap));
  
  // Find the token in the map
  const tokenEntry = Object.entries(tokenMap).find(
    ([key]) => key.trim().toUpperCase() === formatted
  );
  
  if (!tokenEntry) {
    throw new Error(`Unknown token symbol: ${symbol}`);
  }
  
  console.log(`Resolved ${formatted} to address: ${tokenEntry[1]}`);
  return tokenEntry[1];
}