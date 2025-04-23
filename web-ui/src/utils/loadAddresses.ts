import uniswap from "../addresses/uniswapAddresses_31337.json";
import tokens from "../addresses/tokenAddresses_31337.json";


export const CONTRACT_ADDRESSES = {
  FACTORY: uniswap.FACTORY,
  WETH: uniswap.WETH,
  ROUTER: uniswap.ROUTER,
  TKNA: tokens.TOKEN_A,
  TKNB: tokens.TOKEN_B,
  TKNC: tokens.TOKEN_C
};

export const TEST_TOKENS = {
  TOKEN_A: tokens.TOKEN_A,
  TOKEN_B: tokens.TOKEN_B,
  TOKEN_C: tokens.TOKEN_C
};

  
// Helpful constants
export const MAX_UINT256 = "115792089237316195423570985008687907853269984665640564039457584007913129639935";
export const DEADLINE_MINUTES = 20; // 20 minutes from now for transaction deadlines