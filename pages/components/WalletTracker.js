import { useEffect, useState } from "react";
import { toast } from 'react-hot-toast';
import { RadioGroup, Radio, cn } from "@nextui-org/react";
import Image from 'next/image';
import RemoveBackCSS from './RemoveBackCSS';

import AnimatedBorderTrail from './animata/container/animated-border-trail.tsx';

export const PlatformRadio = (props) => {
  const {children, ...otherProps} = props;
  return (
    <Radio
      {...otherProps}
      classNames={{
        base: cn(
          "flex justify-center items-center",
          "rounded-lg bg-[#1F2029] border border-[#343641]",
          "px-4 py-2 max-w-[300px] transition-all duration-200 cursor-pointer",
          "data-[selected=true]:outline-none data-[selected=true]:ring-1 data-[selected=true]:ring-opacity-50 data-[selected=true]:ring-green-800 data-[selected=true]:shadow-lg"
        ),
      }}
    >
      {children}
    </Radio>
  );
};

const WalletTracker = () => {
  const [walletData, setWalletData] = useState(null);
  const [walletDetails, setWalletDetails] = useState("");
  const [inputAddress, setInputAddress] = useState(""); // State for the form input
  const [walletAddress, setWalletAddress] = useState(""); // State for wallet address input
  const [showWeekPnl, setShowWeekPnl] = useState(false); // State to toggle weekly PnL
  const [showMonthPnl, setShowMonthPnl] = useState(false); // State to toggle monthly PnL
  const [showRemoveBackCSS, setRemoveBackCSS] = useState(false); // State to toggle background CSS code
  const [platSelected, setPlatSelected] = useState(""); // State to toggle selected platform

  // Get the current URL as a string
  const [currentPath, setCurrentPath] = useState("");

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
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.href); // Access window object
    }
  }, []);

  useEffect(() => {
    shownErrors.clear();  // Clear errors when walletAddress changes

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

  useEffect(() => {
    const walletData = { walletAddress, showWeekPnl, showMonthPnl, platSelected };

    // Convert data to query parameters for new tab navigation
    const queryParams = new URLSearchParams(walletData).toString();

    // Store URL with the data passed as query params
    setWalletDetails(`${currentPath}components/WalletDetails?${queryParams}`);
  }, [walletAddress, showWeekPnl, showMonthPnl, platSelected]); // Re-fetch when walletAddress, showWeekPnl, showMonthPnl or platSelected change

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

  const handleRemoveBackCSS = () => {
    setRemoveBackCSS((prev) => !prev); // Toggle background CSS code
  };

  // Fallback values to 0 if data is null or undefined, and format to 2 decimal places
  const formatValue = (value) => (value !== null && value !== undefined ? value.toFixed(2) : "0.00");

  const todayPnl = formatValue(walletData?.pnl ?? 0);
  const weekPnl = formatValue(walletData?.weekPnl ?? 0);
  const monthPnl = formatValue(walletData?.monthPnl ?? 0);

  return (
    <div>
      {/* Wallet Address Input Form */}
      <form onSubmit={handleSubmit} className="flex justify-center items-center mt-36 mb-8">
        <input
          type="text"
          placeholder="Enter SOL Address"
          value={inputAddress}
          onChange={handleWalletAddressChange}
          className="bg-[#1F2029] text-gray-300 border border-[#343641] rounded-lg w-2/5 px-4 py-3 transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-opacity-50 focus:ring-green-800 focus:shadow-xl" />
        <button 
          type="submit" 
          className="bg-green-600 hover:bg-green-500 ml-2 py-3 px-3 rounded-md cursor-pointer shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-search"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
        </button>
      </form>
      <div class="flex justify-center items-center w-full">
        <div class="flex justify-center items-center bg-[rgba(31,32,41,0.2)] px-16 py-8 rounded-lg shadow-md">
          <div class="w-auto border-r-2 border-[#343641] mr-12 pr-12">
            <div class="flex justify-start items-center">
              {/* Checkbox to toggle weekly PnL */}
              <div className="mb-4">
                <label class="flex justify-center items-center text-gray-300 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showWeekPnl}
                    onChange={handleWeekPnlToggle}
                    className="appearance-none bg-[#1F2029] border border-[#343641] rounded-md w-5 h-5 checked:bg-green-500 checked:border-green-500 mr-2 transition-all duration-200 focus:outline-none shadow-md cursor-pointer" />
                  Show Weekly PnL
                </label>
              </div>
            </div>
            <div class="flex justify-start items-center">
              {/* Checkbox to toggle monthly PnL */}
              <div className="mb-4">
                <label class="flex justify-center items-center text-gray-300 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showMonthPnl}
                    onChange={handleMonthPnlToggle}
                    className="appearance-none bg-[#1F2029] border border-[#343641] rounded-md w-5 h-5 checked:bg-green-500 checked:border-green-500 mr-2 transition-all duration-200 focus:outline-none shadow-md cursor-pointer" />
                  Show Monthly PnL
                </label>
              </div>
            </div>
            <div class="flex justify-start items-center">
              {/* Checkbox to background CSS code */}
              <div>
                <label class="flex justify-center items-center text-gray-300 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showRemoveBackCSS}
                    onChange={handleRemoveBackCSS}
                    className="appearance-none bg-[#1F2029] border border-[#343641] rounded-md w-5 h-5 checked:bg-green-500 checked:border-green-500 mr-2 transition-all duration-200 focus:outline-none shadow-md cursor-pointer" />
                    Remove Background CSS Code
                </label>
              </div>
            </div>
          </div>
          <div class="w-auto">
            <div className="flex justify-left items-center">
              <RadioGroup orientation="horizontal" defaultValue="noplat" onValueChange={setPlatSelected}>
                <PlatformRadio className="mr-4" value="noplat">
                  <Image 
                    alt="noplat"
                    width={"100"}
                    height={"100"}
                    className="w-16 h-16 -ml-2 object-contain drop-shadow-md"
                    src={"/noplat.png"}/>
                </PlatformRadio>
                <PlatformRadio className="mr-4" value="photon">
                  <Image 
                    alt="photon"
                    width={"100"}
                    height={"100"}
                    className="w-16 h-16 -ml-2 object-contain drop-shadow-md"
                    src={"/photon.png"}/>
                </PlatformRadio>
                <PlatformRadio value="bullx">
                  <Image 
                    alt="bullx"
                    width={"100"}
                    height={"100"}
                    className="w-16 h-16 -ml-2 object-contain drop-shadow-md"
                    src={"/bullx.png"}/>
                </PlatformRadio>
              </RadioGroup>
            </div>
          </div>
        </div>
      </div>
      {showRemoveBackCSS && (
        <div className="flex justify-center items-center w-full">
          <div className="flex justify-center items-center bg-[rgba(31,32,41,0.2)] text-white px-8 py-2 rounded-lg shadow-lg mt-4">
            <RemoveBackCSS/>
          </div>
        </div>
      )}
      {currentPath && walletAddress && walletDetails && (
        <div className="flex justify-center items-center w-full mt-12">
          <div className="flex justify-center items-center bg-[rgba(31,32,41,0.2)] text-white px-8 py-2 rounded-lg shadow-lg mt-4">
            {walletDetails}
          </div>
        </div>
      )}
      {walletData ? (
        <div className="flex justify-center items-center mt-6">
          {todayPnl < 0 && ( 
            <AnimatedBorderTrail trailSize="lg" trailColor="red"> 
              <div className="flex justify-center items-center bg-[#1F2029] text-white max-w-fit px-4 rounded-lg shadow-2xl">
                {platSelected && platSelected !== "noplat" && (
                  <div className="flex justify-center items-center text-shadow">
                    <img
                      src={`/${platSelected}.png`}
                      alt={platSelected}
                      className="w-auto h-auto max-w-32 max-h-32 filter drop-shadow-xl"/>
                  </div>
                )}
                <div className="text-9xl p-12">
                  <div className="text-sm uppercase text-gray-500 tracking-wider text-shadow-sm mb-2">BALANCE</div>
                  <div className="flex justify-center items-center text-4xl font-bold text-shadow">
                    {formatValue(walletData.currentBalance)} <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="SOL" className="w-6 h-6 ml-4 filter drop-shadow"/>
                  </div>
                </div>
                <div className={`text-9xl p-12 ${todayPnl > 0 ? 'text-green-500' : todayPnl < 0 ? 'text-red-500' : 'text-white'}`}>
                  <div className="text-sm uppercase text-gray-500 tracking-wider text-shadow-sm mb-2">TODAY PNL</div>
                  <div className="flex justify-center items-center text-4xl font-bold text-shadow">
                    {todayPnl > 0 ? "+" : ""}{todayPnl} <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="SOL" className="w-6 h-6 ml-4 filter drop-shadow"/>
                  </div>
                </div>
                {showWeekPnl && (
                  <div className={`text-9xl p-12 ${weekPnl > 0 ? 'text-green-500' : weekPnl < 0 ? 'text-red-500' : 'text-white'}`}>
                    <div className="text-sm uppercase text-gray-500 tracking-wider text-shadow-sm mb-2">WEEKLY PNL</div>
                    <div className="flex justify-center items-center text-4xl font-bold text-shadow">
                      {weekPnl > 0 ? "+" : ""}{weekPnl} <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="SOL" className="w-6 h-6 ml-4 filter drop-shadow"/>
                    </div>
                  </div>
                )}
                {showMonthPnl && (
                  <div className={`text-9xl p-12 ${monthPnl > 0 ? 'text-green-500' : monthPnl < 0 ? 'text-red-500' : 'text-white'}`}>
                    <div className="text-sm uppercase text-gray-500 tracking-wider text-shadow-sm mb-2">MONTHLY PNL</div>
                    <div className="flex justify-center items-center text-4xl font-bold text-shadow">
                      {monthPnl > 0 ? "+" : ""}{monthPnl} <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="SOL" className="w-6 h-6 ml-4 filter drop-shadow"/>
                    </div>
                  </div>
                )}
              </div>
            </AnimatedBorderTrail>
          )}
          {todayPnl > 0 && ( 
            <AnimatedBorderTrail trailSize="lg" trailColor="green"> 
              <div className="flex justify-center items-center bg-[#1F2029] text-white max-w-fit px-4 rounded-lg shadow-2xl">
                {platSelected && platSelected !== "noplat" && (
                  <div className="flex justify-center items-center text-shadow">
                    <img
                      src={`/${platSelected}.png`}
                      alt={platSelected}
                      className="w-auto h-auto max-w-32 max-h-32 filter drop-shadow-xl"/>
                  </div>
                )}
                <div className="text-9xl p-12">
                  <div className="text-sm uppercase text-gray-500 tracking-wider text-shadow-sm mb-2">BALANCE</div>
                  <div className="flex justify-center items-center text-4xl font-bold text-shadow">
                    {formatValue(walletData.currentBalance)} <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="SOL" className="w-6 h-6 ml-4 filter drop-shadow"/>
                  </div>
                </div>
                <div className={`text-9xl p-12 ${todayPnl > 0 ? 'text-green-500' : todayPnl < 0 ? 'text-red-500' : 'text-white'}`}>
                  <div className="text-sm uppercase text-gray-500 tracking-wider text-shadow-sm mb-2">TODAY PNL</div>
                  <div className="flex justify-center items-center text-4xl font-bold text-shadow">
                    {todayPnl > 0 ? "+" : ""}{todayPnl} <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="SOL" className="w-6 h-6 ml-4 filter drop-shadow"/>
                  </div>
                </div>
                {showWeekPnl && (
                  <div className={`text-9xl p-12 ${weekPnl > 0 ? 'text-green-500' : weekPnl < 0 ? 'text-red-500' : 'text-white'}`}>
                    <div className="text-sm uppercase text-gray-500 tracking-wider text-shadow-sm mb-2">WEEKLY PNL</div>
                    <div className="flex justify-center items-center text-4xl font-bold text-shadow">
                      {weekPnl > 0 ? "+" : ""}{weekPnl} <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="SOL" className="w-6 h-6 ml-4 filter drop-shadow"/>
                    </div>
                  </div>
                )}
                {showMonthPnl && (
                  <div className={`text-9xl p-12 ${monthPnl > 0 ? 'text-green-500' : monthPnl < 0 ? 'text-red-500' : 'text-white'}`}>
                    <div className="text-sm uppercase text-gray-500 tracking-wider text-shadow-sm mb-2">MONTHLY PNL</div>
                    <div className="flex justify-center items-center text-4xl font-bold text-shadow">
                      {monthPnl > 0 ? "+" : ""}{monthPnl} <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="SOL" className="w-6 h-6 ml-4 filter drop-shadow"/>
                    </div>
                  </div>
                )}
              </div>
            </AnimatedBorderTrail>
          )}
          {/* This is the "else" condition */}
          {!(todayPnl < 0 || todayPnl > 0) && ( 
            <div className="flex justify-center items-center bg-[#1F2029] text-white max-w-fit px-4 rounded-lg shadow-2xl">
              {platSelected && platSelected !== "noplat" && (
                <div className="flex justify-center items-center text-shadow">
                  <img
                    src={`/${platSelected}.png`}
                    alt={platSelected}
                    className="w-auto h-auto max-w-32 max-h-32 filter drop-shadow-xl"/>
                </div>
              )}
              <div className="text-9xl p-12">
                <div className="text-sm uppercase text-gray-500 tracking-wider text-shadow-sm mb-2">BALANCE</div>
                <div className="flex justify-center items-center text-4xl font-bold text-shadow">
                  {formatValue(walletData.currentBalance)} <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="SOL" className="w-6 h-6 ml-4 filter drop-shadow"/>
                </div>
              </div>
              <div className={`text-9xl p-12 ${todayPnl > 0 ? 'text-green-500' : todayPnl < 0 ? 'text-red-500' : 'text-white'}`}>
                <div className="text-sm uppercase text-gray-500 tracking-wider text-shadow-sm mb-2">TODAY PNL</div>
                <div className="flex justify-center items-center text-4xl font-bold text-shadow">
                  {todayPnl > 0 ? "+" : ""}{todayPnl} <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="SOL" className="w-6 h-6 ml-4 filter drop-shadow"/>
                </div>
              </div>
              {showWeekPnl && (
                <div className={`text-9xl p-12 ${weekPnl > 0 ? 'text-green-500' : weekPnl < 0 ? 'text-red-500' : 'text-white'}`}>
                  <div className="text-sm uppercase text-gray-500 tracking-wider text-shadow-sm mb-2">WEEKLY PNL</div>
                  <div className="flex justify-center items-center text-4xl font-bold text-shadow">
                    {weekPnl > 0 ? "+" : ""}{weekPnl} <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="SOL" className="w-6 h-6 ml-4 filter drop-shadow"/>
                  </div>
                </div>
              )}
              {showMonthPnl && (
                <div className={`text-9xl p-12 ${monthPnl > 0 ? 'text-green-500' : monthPnl < 0 ? 'text-red-500' : 'text-white'}`}>
                  <div className="text-sm uppercase text-gray-500 tracking-wider text-shadow-sm mb-2">MONTHLY PNL</div>
                  <div className="flex justify-center items-center text-4xl font-bold text-shadow">
                    {monthPnl > 0 ? "+" : ""}{monthPnl} <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="SOL" className="w-6 h-6 ml-4 filter drop-shadow"/>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

export default WalletTracker;