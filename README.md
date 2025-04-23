
# 🦄 Uniswap V2 + Natural Language Interface

<div align="center">
  <img src="public/uniswap-v2-banner.png" alt="Uniswap AI Banner" width="800px" />
  
  [![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
  [![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC.svg)](https://tailwindcss.com/)
  [![Foundry](https://img.shields.io/badge/Foundry-Forge-orange.svg)](https://book.getfoundry.sh/)
  [![MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

  <h3>Swap tokens using English commands.</h3>
</div>

---

## 💡 Project Overview

This project is a feature-rich **Uniswap V2 Web3 UI** with an integrated **AI-powered natural language interface**. Built using **Next.js**, **TypeScript**, **Tailwind**, and **Foundry**, it allows users to interact with Uniswap smart contracts using simple English commands like:

- "Swap 0.5 TokenA for TokenB"
- "Add liquidity with 1 TokenA and 2 TokenB"
- "Remove my liquidity from the pool"

The application automatically parses user intent using **OpenAI/Mistral** APIs and routes it to the correct smart contract function using `ethers.js`.

---

## ✅ Step-by-Step Workflow to Run the Full Project

### 🧼 Step 1: Clean Old Builds (Optional)
```bash
forge clean
```

### 🔨 Step 2: Compile All Contracts
```bash
forge build
```

### 🧪 Step 3: Start Local Ethereum Node
```bash
anvil
```
📌 Leave this running and open a new terminal.

### 🚀 Step 4: Deploy Core Uniswap Contracts
```bash
forge script script/DeployUniswap.s.sol:DeployUniswap \
  --rpc-url http://localhost:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --broadcast
```

### 💸 Step 5: Deploy Test Tokens (Token A, B, C)
```bash
forge script script/DeployTestTokens.s.sol:DeployTestTokens \
  --rpc-url http://localhost:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --broadcast
```

### 🌐 Step 6: Start the Frontend
```bash
cd web-ui
npm install       # Run once
npm run dev
```

Open: [http://localhost:3000](http://localhost:3000)

---

## 📦 Project Structure

```
uniswap-web3-ui/
├── script/                     # Foundry deploy scripts
├── src/                        # Foundry smart contracts
├── test/                       # Foundry test files
├── web-ui/                     # Frontend project
│   ├── components/             # All React UI components
│   ├── context/                # React context (e.g., PoolContext)
│   ├── hooks/                  # Custom Ethereum hooks
│   ├── utils/                  # LLM parsing, dispatching, token logic
│   └── public/                 # Static assets like banners
```

---

## 🔗 Deployed Contract Addresses

| Contract       | Address                                      |
|----------------|----------------------------------------------|
| Factory        | `0x5FbDB2315678afecb367f032d93F642f64180aa3` |
| WETH           | `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512` |
| Router         | `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0` |
| Token A        | `0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9` |
| Token B        | `0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9` |
| Token C        | `0x5FC8d32690cc91D4c39d9d3abcBD16989F875707` |

---

## 🧠 Core Technologies

- **Foundry** — Contract development, scripting & testing
- **Next.js + React** — Frontend rendering & routing
- **Ethers.js** — Smart contract interaction
- **OpenAI / Mistral** — Natural Language to Smart Contract intent parsing
- **Tailwind CSS** — Styling & layout

---

## 🙌 Credits & References

- [Uniswap V2 Docs](https://docs.uniswap.org/)
- [Foundry Book](https://book.getfoundry.sh/)
- [OpenAI Function Calling](https://platform.openai.com/docs/guides/function-calling)
- [Mistral AI](https://mistral.ai/)

---

> Designed with ❤️ to make DeFi more human-friendly.
