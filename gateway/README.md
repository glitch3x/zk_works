# 🤖 ZK-Work: Agentic Credential Orchestrator

**ZK-Work** introduces a long-term, verifiable identity layer on the Sui blockchain. It acts as an Agentic Credential Orchestrator, allowing users to verify their skills without manual data entry, and allowing AI agents to remember, share, and reuse credential information reliably across the Web3 ecosystem.

Built for the **Sui Hackathon**.

![ZK-Work Dashboard Layout](public/agent-illustration.png)

## 🌟 The Vision

In the Agentic Web, your reputation shouldn't be locked in centralized databases or PDF resumes. **ZK-Work** acts as the bridge between human labor and AI verification. 

You simply upload your raw "Proof of Work" (a resume, a GitHub link, a design portfolio). Our backend **AI Orchestrator Agent** analyzes the evidence, extracts your verified skills, and programmatically mints a **Verifiable Credential** directly to your Sui Wallet. 

Because we leverage the Sui blockchain, these credentials act as highly-composable digital assets (NFTs) that you truly own and can carry with you across any dApp or platform.

## 🔥 Key Features

- **Agentic Backend Issuance:** Credentials aren't minted manually. Our Next.js backend securely holds an `AgentCap` and automatically signs programmable transaction blocks (PTBs) to issue credentials upon verifying user uploads.
- **Gasless Onboarding (Sponsored Transactions):** Users don't need testnet SUI to get started. The Agent handles the gas fees for creating the Passport and transfers it directly to the user's wallet.
- **Dynamic NFTs (Leveling Up):** Passports "level up" (Novice -> Adept -> Expert -> Master) dynamically inside the smart contract as users accumulate reputation from verified skills.
- **Walrus Decentralized Storage:** Profile pictures and evidence documents are completely decentralized. Uploads are seamlessly stored on the Mysten Labs Walrus Protocol and the Blob IDs are permanently embedded in the on-chain NFTs.
- **Move 2024 Smart Contracts:** Built using the latest Move 2024 compiler edition, utilizing advanced capability architecture (`AdminCap` and `AgentCap`) to strictly control credential issuance.
- **Sui Display Standard (`sui::display`):** Passports and Verifiable Credentials aren't just raw data. They are fully configured with the Display standard to render beautifully as dynamic badges inside the user's Sui Wallet extension.
- **Neo-Brutalism UI:** A world-class, premium user interface built with React and `@mysten/dapp-kit`.
- **Public Shareable Profiles:** Users are instantly granted a dynamic public profile (e.g., `/profile/0x...`) that allows non-crypto employers or recruiters to easily view their verified on-chain skills.

## 🏗️ Architecture

The project is split into two core environments:

1. **`/move` (Smart Contracts):** Contains the `credential_registry` package. It manages the `Passport` object (the user's identity base) and the `VerifiableCredential` standalone objects.
2. **`/gateway` (Frontend & Agent API):** A Next.js 14 App Router application. It serves the gorgeous UI, integrates Sui Wallet connections via DApp-Kit, and hosts the `/api/issue-credential` route which acts as our autonomous agent.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Sui CLI (for deploying the contracts if you wish to run your own instance)

### 1. Setup the Frontend
```bash
cd gateway
npm install
```

### 2. Configure the Agent Environment
To allow the backend API route to simulate the AI Agent and sign transactions, you need to provide it with a funded testnet wallet mnemonic.

Create a `.env.local` file in the `gateway` directory:
```env
AGENT_MNEMONIC="your twelve word phrase here..."
```

*(Note: The smart contract must have minted an `AgentCap` to the address derived from this mnemonic).*

### 3. Run the App
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## 💻 How to Test

1. Navigate to the local dashboard.
2. Connect your Sui Wallet (ensure you are on **Testnet**).
3. If you do not have a Passport, click **Create Passport** and upload an optional Profile Picture. The AI agent will pay the gas fee and mint your gasless passport, storing the avatar on Walrus!
4. Upload a mock PDF or document into the "Upload Evidence" zone.
5. Watch the Agent analyze the document, upload the original to Walrus, and automatically drop a newly minted Verifiable Credential into your dashboard!
6. Click **Merge Skills to Passport** on your new credential. Watch your Passport level up dynamically as your reputation score increases!
7. Click **Share Profile** to copy your unique public link. Open it in an incognito window to view your beautiful public resume.

---
*Built with ❤️ for the Sui Ecosystem.*
