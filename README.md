# SolTrack

**SolTrack** is a lightweight Flask-based web application for tracking Solana wallet balances and calculating daily, weekly, and monthly profit and loss (PnL) statistics. 
It provides a simple and elegant web interface to monitor wallet activity in real-time.

---

![SolTrack Dashboard](./soltrack.png)

---

## Features

- **Real-Time Balance Tracking**: Displays the current balance of any Solana wallet.
- **PnL Calculations**:
  - Daily PnL
  - Weekly PnL
  - Monthly PnL
- **Automatic Refresh**: The dashboard automatically refreshes every 5 seconds.

---

## Prerequisites

To run this project, ensure you have the following installed:

- **Node.js 16+**
- **npm** (Node package manager)

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

3. **Run the Application**:

   ```bash
   npm run dev
   ```

4. **Access the Dashboard**:
   Open your browser and navigate to `http://localhost:3000`.

---

## Usage

### Querying a Wallet Address

To track a wallet, enter the wallet address in the input field on the dashboard and click "Track Wallet"

### Optional Features

- **Weekly PnL**: Enable the "Show Weekly PnL" toggle to display weekly profit and loss.
- **Monthly PnL**: Enable the "Show Monthly PnL" toggle to display monthly profit and loss.

---

## Configuration

- **RPC URL**: The Solana RPC endpoint is set to the mainnet by default.
- **Refresh Interval**: The default data refresh interval is 5 seconds.
- **Minimum PnL Value**: Set via the `MIN_PNL_VALUE` variable to ignore minor changes due to fees.

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.