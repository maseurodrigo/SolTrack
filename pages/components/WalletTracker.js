import { useEffect, useState } from "react";
import { toast } from 'react-hot-toast';

const WalletTracker = () => {
  const [walletData, setWalletData] = useState(null);
  const [walletAddress, setWalletAddress] = useState(""); // State for wallet address input
  const [inputAddress, setInputAddress] = useState(""); // State for the form input
  const [showWeekPnl, setShowWeekPnl] = useState(false); // State to toggle weekly PnL
  const [showMonthPnl, setShowMonthPnl] = useState(false); // State to toggle monthly PnL

  // Function to track shown error messages (in-memory approach)
  const shownErrors = new Set(); 

  const hasShownError = (errorMessage) => {
    return shownErrors.has(errorMessage);
  };

  const setHasShownError = (errorMessage) => {
    shownErrors.add(errorMessage);
  };

  const fetchData = async () => {
    try {
      // If theres no wallet address, don't proceed
      if (!walletAddress) {  
        // Check if error message has already been shown using the Set
        if (!hasShownError("Wallet address required")) {
          toast.error("Wallet address required");
          setHasShownError("Wallet address required");
        }
        return;
      }

      const response = await fetch(`/api/wallet_data?wallet=${walletAddress}`);

      // If response is not okay, parse the error response
      if (!response.ok) {
        const errorData = await response.json();  // Parse JSON to get error details

        // Check if error message has already been shown using the Set
        if (!hasShownError(errorData.error)) {
          toast.error(errorData.error);
          setHasShownError(errorData.error);
        }
        return;
      }
      
      const data = await response.json();
      setWalletData(data);
      
    } catch (err) {
      // Check if error message has already been shown using the Set
      if (!hasShownError(err.message)) {
        toast.error(err.message);
        setHasShownError(err.message);
      }
    }
  };
  
  useEffect(() => {
    // Clear errors when walletAddress changes
    shownErrors.clear(); 

    if (walletAddress) {
      fetchData(); // Fetch data when walletAddress changes
    }
    
    // Set up the interval
    const interval = setInterval(() => {
      fetchData();
    }, 5000);

    return () => clearInterval(interval);
  }, [walletAddress]); // Re-fetch when walletAddress or options change

  const handleWalletAddressChange = (event) => {
    setInputAddress(event.target.value); // Update input value
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setWalletAddress(inputAddress); // Set the wallet address from the form input
  };

  const handleWeekPnlToggle = () => {
    setShowWeekPnl((prev) => !prev); // Toggle weekly PnL
  };

  const handleMonthPnlToggle = () => {
    setShowMonthPnl((prev) => !prev); // Toggle monthly PnL
  };

  // Fallback values to 0 if data is null or undefined, and format to 2 decimal places
  const formatValue = (value) => (value !== null && value !== undefined ? value.toFixed(2) : "0.00");

  const todayPnl = formatValue(walletData?.pnl ?? 0);
  const weekPnl = formatValue(walletData?.weekPnl ?? 0);
  const monthPnl = formatValue(walletData?.monthPnl ?? 0);

  return (
    <div>      
      {/* Wallet Address Input Form */}
      <form onSubmit={handleSubmit} className="mt-24 mb-8">
        <input
          type="text"
          placeholder="Enter SOL Address"
          value={inputAddress}
          onChange={handleWalletAddressChange}
          className="bg-[#202124] text-white border border-[#444] rounded-md w-2/5 px-4 py-2 focus:outline-none focus:ring-1 focus:ring-green-800 focus:shadow-xl" />
        <button 
          type="submit" 
          className="bg-green-600 hover:bg-green-500 text-white font-bold ml-2 py-2 px-4 rounded-md shadow-md">
          🕵
        </button>
      </form>
      <div class="flex justify-center items-center">
        {/* Checkbox to toggle weekly PnL */}
        <div className="mr-16">
          <label class="flex justify-center items-center">
            <input
              type="checkbox"
              checked={showWeekPnl}
              onChange={handleWeekPnlToggle}
              className="appearance-none bg-[#202124] border border-[#444] rounded-md w-5 h-5 checked:bg-green-500 checked:border-green-500 mr-2 shadow-md" />
            Show Weekly PnL
          </label>
        </div>
        {/* Checkbox to toggle monthly PnL */}
        <div>
          <label class="flex justify-center items-center">
            <input
              type="checkbox"
              checked={showMonthPnl}
              onChange={handleMonthPnlToggle}
              className="appearance-none bg-[#202124] border border-[#444] rounded-md w-5 h-5 checked:bg-green-500 checked:border-green-500 mr-2 shadow-md" />
            Show Monthly PnL
          </label>
        </div>
      </div>

      {walletData ? (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="flex justify-center items-center bg-white/5 rounded-md shadow-2xl">
            <div className="text-9xl p-12">
              <div className="text-sm uppercase text-gray-400 text-shadow-sm mb-2">BALANCE</div>
              <div className="flex justify-center items-center text-4xl font-bold text-shadow">
                {formatValue(walletData.currentBalance)} <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="SOL" className="w-6 h-6 ml-4 filter drop-shadow" />
              </div>
            </div>
            <div className={`text-9xl p-12 ${todayPnl > 0 ? 'text-green-500' : todayPnl < 0 ? 'text-red-500' : 'text-white'}`}>
              <div className="text-sm uppercase text-gray-400 text-shadow-sm mb-2">TODAY PNL</div>
              <div className="flex justify-center items-center text-4xl font-bold text-shadow">
                {todayPnl > 0 ? "+" : ""}{todayPnl} <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="SOL" className="w-6 h-6 ml-4 filter drop-shadow" />
              </div>
            </div>
            {showWeekPnl && (
              <div className={`text-9xl p-12 ${weekPnl > 0 ? 'text-green-500' : weekPnl < 0 ? 'text-red-500' : 'text-white'}`}>
                <div className="text-sm uppercase text-gray-400 text-shadow-sm mb-2">WEEKLY PNL</div>
                <div className="flex justify-center items-center text-4xl font-bold text-shadow">
                  {weekPnl > 0 ? "+" : ""}{weekPnl} <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="SOL" className="w-6 h-6 ml-4 filter drop-shadow" />
                </div>
              </div>
            )}
            {showMonthPnl && (
              <div className={`text-9xl p-12 ${monthPnl > 0 ? 'text-green-500' : monthPnl < 0 ? 'text-red-500' : 'text-white'}`}>
                <div className="text-sm uppercase text-gray-400 text-shadow-sm mb-2">MONTHLY PNL</div>
                <div className="flex justify-center items-center text-4xl font-bold text-shadow">
                  {monthPnl > 0 ? "+" : ""}{monthPnl} <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="SOL" className="w-6 h-6 ml-4 filter drop-shadow" />
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

export default WalletTracker;