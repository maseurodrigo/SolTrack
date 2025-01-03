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

- **Python 3.8+**
- **Pip** (Python package installer)

---

## Installation

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/maseurodrigo/SolTrack.git
   cd SolTrack
   ```

2. **Install Dependencies**:

   ```bash
   pip install -r requirements.txt
   ```
   
3. **Run the Application**:

   ```bash
   python soltrack.py
   ```

4. **Access the Dashboard**:
   Open your browser and navigate to `http://127.0.0.1:5000`.

---

## Usage

### Querying a Wallet Address

To track a wallet, add the `wallet` query parameter in the URL. For example:

```
http://127.0.0.1:5000/?wallet=YOUR_WALLET_ADDRESS
```

### Optional Parameters

- **`show_week_pnl`**: Display weekly PnL. Set to `true` to enable.
- **`show_month_pnl`**: Display monthly PnL. Set to `true` to enable.

Example:
```
http://127.0.0.1:5000/?wallet=YOUR_WALLET_ADDRESS&show_week_pnl=true&show_month_pnl=true
```

---

## Configuration

- **RPC URL**: The Solana RPC endpoint is set to the mainnet by default.
- **Refresh Interval**: The default data refresh interval is 5 seconds.
- **Minimum PnL Value**: Set via the `MIN_PNL_VALUE` variable to ignore minor changes due to fees.

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.