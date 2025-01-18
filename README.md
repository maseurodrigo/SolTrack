# SolTrack

**SolTrack** is a lightweight, real-time web application built with Next.js for tracking Solana wallet balances and calculating daily, weekly, and monthly profit and loss (PnL) statistics.

---

![SolTrack Dashboard](./soltrack.png)

---

## Features

- **Real-Time Balance Tracking**: Displays the current balance of any Solana wallet using WebSocket for live updates.
- **PnL Calculations**:
  - Daily PnL
  - Weekly PnL
  - Monthly PnL
- **Database Integration**:
  - Weekly and monthly start dates and balances are stored in a database.
- **Real-Time Data Updates**: The balance is automatically updated in real-time as Solana transactions occur via WebSocket connection to the Solana RPC.

---

## Prerequisites

To run this project, ensure you have the following installed:

- **Node.js 16+**
- **npm** (Node package manager)
- **PostgreSQL**

---

## Installation

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/maseurodrigo/SolTrack.git
   cd SolTrack
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:

   Create a `.env` file in the project root and define the following variable:

   ```env
   DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<database>"
   
   NEXT_PUBLIC_SOLANA_RPC_WS_URL="wss://mainnet.helius-rpc.com/?api-key=<your-api-key>"
   ```
   
   Replace `<user>`, `<password>`, `<host>`, `<port>`, and `<database>` with your PostgreSQL credentials, and replace `<your-api-key>` with your Solana RPC WebSocket API key.

4. **Initialize Prisma**:

   Run the following commands to set up Prisma:

   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. **Run the Application**:

   ```bash
   npm run start
   ```

6. **Access the Dashboard**:

   Open your browser and navigate to `http://localhost:8080`.

---

## Usage

### Querying a Wallet Address

To track a wallet, enter the wallet address in the input field on the dashboard and click "Track Wallet".
The wallet's balance will be displayed and updated in real-time based on Solana transactions.

### Optional Features

- **Weekly PnL**: Enable the "Show Weekly PnL" toggle to display weekly profit and loss.
- **Monthly PnL**: Enable the "Show Monthly PnL" toggle to display monthly profit and loss.

---

## Configuration

- **RPC Mainnet URL**: The Solana RPC endpoint is set to the mainnet by default.
- **RPC WebSocket URL**: The Solana RPC WebSocket endpoint is configurable through the `NEXT_PUBLIC_SOLANA_RPC_WS_URL` environment variable.
- **Database Storage**:
  - Weekly and monthly start dates and balances are stored in a PostgreSQL database.

### Prisma Schema

The database structure is managed using Prisma ORM with the following schema:

```prisma
model UserData {
  wallet            String   @id
  weekStartDate     DateTime @map("week_start_date")
  weekStartBalance  Float    @map("week_start_balance") @db.Real
  monthStartDate    DateTime @map("month_start_date")
  monthStartBalance Float    @map("month_start_balance") @db.Real
}
```

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.