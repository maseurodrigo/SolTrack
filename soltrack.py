import requests, threading, time, base58

from flask import Flask, request, render_template_string, jsonify
from datetime import datetime, timedelta

app = Flask(__name__)

# Base Configuration
SOLANA_RPC_URL = "https://api.mainnet-beta.solana.com"  # Solana mainnet RPC URL
MIN_PNL_VALUE = 0.0001  # Minimum PnL value (Skipping fee balance changes)

user_data = {}  # Global dictionary to store user data keyed by wallet address

HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Solana Wallet Tracker</title>
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
            color: #00c853;
        }
        .pnl-negative {
            color: #d50000;
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
    <div id="wallet-container" class="container">
        <div class="balance">
            <div class="balance-title">BALANCE</div>
            <div id="current-balance" class="balance-value">{{ current_balance }} <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="SOL" class="solana-icon"></div>
        </div>
        <div id="today-pnl" class="pnl {% if pnl > 0 %}pnl-positive{% elif pnl < 0 %}pnl-negative{% else %}pnl-neutral{% endif %}">
            <div class="pnl-title">TODAY PNL</div>
            <div id="pnl-value" class="pnl-value">{{ "+" if pnl > 0 else "" }}{{ pnl }} <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="SOL" class="solana-icon"></div>
        </div>
        {% if show_week_pnl %}
        <div id="weekly-pnl" class="pnl {% if week_pnl > 0 %}pnl-positive{% elif week_pnl < 0 %}pnl-negative{% else %}pnl-neutral{% endif %}">
            <div class="pnl-title">WEEKLY PNL</div>
            <div id="week-pnl-value" class="pnl-value">{{ "+" if week_pnl > 0 else "" }}{{ week_pnl }} <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="SOL" class="solana-icon"></div>
        </div>
        {% endif %}
        {% if show_month_pnl %}
        <div id="monthly-pnl" class="pnl {% if month_pnl > 0 %}pnl-positive{% elif month_pnl < 0 %}pnl-negative{% else %}pnl-neutral{% endif %}">
            <div class="pnl-title">MONTHLY PNL</div>
            <div id="month-pnl-value" class="pnl-value">{{ "+" if month_pnl > 0 else "" }}{{ month_pnl }} <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="SOL" class="solana-icon"></div>
        </div>
        {% endif %}
    </div>
    <script>
    function updateWalletData() {
        const walletAddress = new URLSearchParams(window.location.search).get('wallet');
        fetch(`/wallet_data?wallet=${walletAddress}`)
            .then(response => response.json())
            .then(data => {
                document.getElementById('current-balance').innerHTML = `${data.current_balance} <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="SOL" class="solana-icon">`;
                document.getElementById('pnl-value').innerHTML = `${data.pnl > 0 ? "+" : ""}${data.pnl} <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="SOL" class="solana-icon">`;
                document.getElementById('today-pnl').className = `pnl ${data.pnl > 0 ? 'pnl-positive' : data.pnl < 0 ? 'pnl-negative' : 'pnl-neutral'}`;
                
                document.getElementById('week-pnl-value').innerHTML = `${data.week_pnl > 0 ? "+" : ""}${data.week_pnl} <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="SOL" class="solana-icon">`;
                document.getElementById('weekly-pnl').className = `pnl ${data.week_pnl > 0 ? 'pnl-positive' : data.week_pnl < 0 ? 'pnl-negative' : 'pnl-neutral'}`;
                
                document.getElementById('month-pnl-value').innerHTML = `${data.month_pnl > 0 ? "+" : ""}${data.month_pnl} <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="SOL" class="solana-icon">`;
                document.getElementById('monthly-pnl').className = `pnl ${data.month_pnl > 0 ? 'pnl-positive' : data.month_pnl < 0 ? 'pnl-negative' : 'pnl-neutral'}`;
            });
        }
        setInterval(updateWalletData, 5000);
    </script>
</body>
</html>
"""

def get_sol_balance(wallet_address):
    """
    Fetches the SOL balance for a specific wallet address
    Queries the Solana RPC endpoint and converts the balance from lamports to SOL
    """
    try:
        # Fetch SOL balance
        payload_balance = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "getBalance",
            "params": [wallet_address]
        }
        response_balance = requests.post(SOLANA_RPC_URL, json=payload_balance)
        result_balance = response_balance.json()

        return result_balance['result']['value'] / 1e9 # Convert lamports to SOL
    except (requests.RequestException, KeyError):
        return 0.0  # Return 0 balance on error

def update_wallet_data():
    """
    Periodically updates wallet data in the global user_data dictionary, including balance and profit and loss (PnL)
    !! Runs in a separate thread to continuously refresh wallet information
    """
    while True:
        for wallet_address in list(user_data.keys()): # Check if a wallet address is set
            current_balance = get_sol_balance(wallet_address)
            if current_balance is not None:
                today_date = datetime.now().date()
                data = user_data[wallet_address]

                # Daily PnL
                if data.get('starting_date') != today_date:
                    data['starting_balance'] = current_balance
                    data['starting_date'] = today_date

                pnl = round(current_balance - data['starting_balance'], 2)
                if abs(pnl) < MIN_PNL_VALUE:
                    pnl = 0.0

                # Weekly PnL
                start_of_week = today_date - timedelta(days=today_date.weekday())
                if data.get('week_start_date') != start_of_week:
                    data['week_start_balance'] = current_balance
                    data['week_start_date'] = start_of_week

                week_pnl = round(current_balance - data['week_start_balance'], 2)
                if abs(week_pnl) < MIN_PNL_VALUE:
                    week_pnl = 0.0

                # Monthly PnL
                start_of_month = today_date.replace(day=1)
                if data.get('month_start_date') != start_of_month:
                    data['month_start_balance'] = current_balance
                    data['month_start_date'] = start_of_month

                month_pnl = round(current_balance - data['month_start_balance'], 2)
                if abs(month_pnl) < MIN_PNL_VALUE:
                    month_pnl = 0.0

                # Update global data
                data.update({
                    'current_balance': round(current_balance, 2),
                    'pnl': pnl,
                    'week_pnl': week_pnl,
                    'month_pnl': month_pnl,
                })

        time.sleep(5)  # Wait 5 seconds before the next update

def is_valid_solana_address(address):
    try:
        return len(address) == 44 and base58.b58decode(address)
    except Exception:
        return False

@app.route('/wallet_data')
def wallet_data():
    # Get 'wallet' parameter from the request
    wallet_address = request.args.get('wallet', '')

    # Return wallet data as JSON if the address exists in user_data
    if wallet_address in user_data:
        return jsonify(user_data[wallet_address])

    # Return empty JSON response with a 404 status if the wallet address isn't found
    return jsonify({}), 404

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

    if not is_valid_solana_address(wallet_address):
        return "Invalid wallet address provided"

    # Initialize user data if not present
    if wallet_address not in user_data:
        user_data[wallet_address] = {
            'starting_balance': 0,
            'starting_date': None,
            'week_start_balance': 0,
            'week_start_date': None,
            'month_start_balance': 0,
            'month_start_date': None,
            'current_balance': 0,
            'pnl': 0,
            'week_pnl': 0,
            'month_pnl': 0,
        }

    return render_template_string(HTML_TEMPLATE, show_week_pnl=show_week_pnl, show_month_pnl=show_month_pnl, **user_data[wallet_address])

if __name__ == "__main__":
    threading.Thread(target=update_wallet_data, daemon=True).start() # Start the background thread for updating wallet data
    app.run(host='0.0.0.0', port=8080) # Run the Flask app on port 8080