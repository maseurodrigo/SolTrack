import requests, threading, time

from flask import Flask, request, render_template_string
from datetime import datetime, timedelta

app = Flask(__name__)

# Base Configuration
SOLANA_RPC_URL = "https://api.mainnet-beta.solana.com"  # Solana mainnet RPC URL
STARTING_BALANCE = 0.0  # Starting balance in SOL
MIN_PNL_VALUE = 0.0001  # Minimum PnL value (Skipping fee balance changes)

LATEST_DATA = {
    "wallet_address": "",
    "current_balance": 0.0,
    "starting_balance": 0.0,
    "pnl": 0.0,
    "week_pnl": 0.0,
    "month_pnl": 0.0
}

HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Solana Wallet Tracker</title>
    <script>
        setInterval(() => {
            window.location.reload();
        }, 5000);
    </script>
    <style>
        body {
            font-family: monaco, Consolas, Lucida Console, monospace;
            background-color: rgba(33, 33, 33, 0.9);
            color: #ffffff;
            text-align: center;
        }
        .container {
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .balance, .pnl {
            font-size: 3.6rem;
            margin: 0.8rem;
            padding: 2rem;
        }
        .balance-title, .pnl-title {
            font-size: 1.2rem;
            color: #b0b0b0;
            margin-bottom: 0.8rem;
        }
        .balance-value, .pnl-value {
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 2.4rem;
            font-weight: bold;
        }
        .balance-value > img, .pnl-value > img {
            margin-left: 0.8rem;
        }
        .pnl-positive {
            color: #00ff00;
        }
        .pnl-negative {
            color: #ff0000;
        }
        .pnl-neutral {
            color: #ffffff;
        }
        .solana-icon {
            width: 20px;
            height: 20px;
            vertical-align: middle;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="balance">
            <div class="balance-title">BALANCE</div>
            <div class="balance-value">{{ current_balance }} <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="SOL" class="solana-icon"></div>
        </div>
        <div class="pnl {% if pnl > 0 %}pnl-positive{% elif pnl < 0 %}pnl-negative{% else %}pnl-neutral{% endif %}">
            <div class="pnl-title">TODAY PNL</div>
            <div class="pnl-value">{{ "+" if pnl > 0 else "" }}{{ pnl }} <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="SOL" class="solana-icon"></div>
        </div>
        {% if show_week_pnl %}
        <div class="pnl {% if week_pnl > 0 %}pnl-positive{% elif week_pnl < 0 %}pnl-negative{% else %}pnl-neutral{% endif %}">
            <div class="pnl-title">WEEKLY PNL</div>
            <div class="pnl-value">{{ "+" if week_pnl > 0 else "" }}{{ week_pnl }} <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="SOL" class="solana-icon"></div>
        </div>
        {% endif %}
        {% if show_month_pnl %}
        <div class="pnl {% if month_pnl > 0 %}pnl-positive{% elif month_pnl < 0 %}pnl-negative{% else %}pnl-neutral{% endif %}">
            <div class="pnl-title">MONTHLY PNL</div>
            <div class="pnl-value">{{ "+" if month_pnl > 0 else "" }}{{ month_pnl }} <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="SOL" class="solana-icon"></div>
        </div>
        {% endif %}
    </div>
</body>
</html>
"""

def get_sol_balance(wallet_address):
    """
    Fetches the SOL balance for a specific wallet address
    Queries the Solana RPC endpoint and converts the balance from lamports to SOL
    """
    # Fetch SOL balance
    payload_balance = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getBalance",
        "params": [wallet_address]
    }
    response_balance = requests.post(SOLANA_RPC_URL, json=payload_balance)
    result_balance = response_balance.json()

    try:
        return result_balance['result']['value'] / 1e9 # Convert lamports to SOL
    except KeyError:
        return None, []

def update_wallet_data():
    """
    Periodically updates the wallet data, including balance and profit and loss (PnL)
    !! Runs in a separate thread to continuously refresh wallet information
    """
    global STARTING_BALANCE, LATEST_DATA
    while True:
        wallet_address = LATEST_DATA.get("wallet_address")
        if wallet_address: # Check if a wallet address is set
            current_balance = get_sol_balance(wallet_address)
            if current_balance is not None:
                today_date = datetime.now().date()
                start_of_week = today_date - timedelta(days=today_date.weekday())
                start_of_month = today_date.replace(day=1)

                # Reset the starting balance if it's a new day
                if LATEST_DATA.get("starting_date") != today_date:
                    STARTING_BALANCE = current_balance
                    LATEST_DATA["starting_date"] = today_date
                    
                pnl = round(current_balance - STARTING_BALANCE, 2)
                if abs(pnl) < MIN_PNL_VALUE:
                    pnl = 0.0
                
                # Calculate weekly PnL
                if LATEST_DATA.get("week_start_date") != start_of_week:
                    LATEST_DATA["week_start_balance"] = current_balance
                    LATEST_DATA["week_start_date"] = start_of_week
                week_pnl = round(current_balance - LATEST_DATA["week_start_balance"], 2)
                if abs(week_pnl) < MIN_PNL_VALUE:
                    week_pnl = 0.0

                # Calculate monthly PnL
                if LATEST_DATA.get("month_start_date") != start_of_month:
                    LATEST_DATA["month_start_balance"] = current_balance
                    LATEST_DATA["month_start_date"] = start_of_month
                month_pnl = round(current_balance - LATEST_DATA["month_start_balance"], 2)
                if abs(month_pnl) < MIN_PNL_VALUE:
                    month_pnl = 0.0

                # Update global data with latest values
                LATEST_DATA.update({
                    "current_balance": round(current_balance, 2),
                    "starting_balance": round(STARTING_BALANCE, 2),
                    "pnl": pnl,
                    "week_pnl": week_pnl,
                    "month_pnl": month_pnl
                })
        time.sleep(5) # Wait 5 seconds before next update

@app.route('/')
def track_wallet():
    """
    Renders the wallet tracking page
    Accepts wallet address as a query parameter and optionally displays weekly or monthly PnL
    """
    wallet_address = request.args.get('wallet', '')
    show_week_pnl = request.args.get('show_week_pnl', 'false').lower() == 'true'
    show_month_pnl = request.args.get('show_month_pnl', 'false').lower() == 'true'

    if not wallet_address:
        return "Please provide a wallet address as a 'wallet' URL parameter..."

    global LATEST_DATA
    if LATEST_DATA["wallet_address"] != wallet_address:
        LATEST_DATA["wallet_address"] = wallet_address
        STARTING_BALANCE = 0.0  # Reset starting balance when wallet changes

    return render_template_string(HTML_TEMPLATE, show_week_pnl=show_week_pnl, show_month_pnl=show_month_pnl, **LATEST_DATA)

if __name__ == "__main__":
    threading.Thread(target=update_wallet_data, daemon=True).start() # Start the background thread for updating wallet data
    app.run() # Run the Flask app