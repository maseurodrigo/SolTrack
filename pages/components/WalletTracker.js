import { useEffect, useState, useRef } from "react";
import { toast } from 'react-hot-toast';
import { Switch, RadioGroup, Radio, cn } from "@nextui-org/react";
import NumberFlow, { NumberFlowGroup } from '@number-flow/react';
import Image from 'next/image';

import RemoveBackCSS from './RemoveBackCSS';
import AnimatedBorderTrail from './animata/container/animated-border-trail.tsx';
import { calcPnLPerc } from "/utils/calcPnLPercentage";

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
  const [widgetPaddingSize, setWidgetPaddingSize] = useState("p-8"); // State to set widget padding sizes
  const [widgetFontSize, setWidgetFontSize] = useState("text-sm"); // State to set widget font sizes
  const [showWeekPnl, setShowWeekPnl] = useState(false); // State to toggle weekly PnL
  const [showMonthPnl, setShowMonthPnl] = useState(false); // State to toggle monthly PnL
  const [chartEnabled, setChartEnabled] = useState(false); // State to toggle PnL chart
  const [showRemoveBackCSS, setRemoveBackCSS] = useState(false); // State to toggle background CSS code
  const [platSelected, setPlatSelected] = useState(""); // State to toggle selected platform
  const [currentPath, setCurrentPath] = useState(""); // Get the current URL as a string

  const shownErrors = new Set(); // Function to track shown error messages
  const backCSSRef = useRef(null); // Reference to access DOM element rendered by RemoveBackCSS

  const setHasShownError = (errorMessage) => { shownErrors.add(errorMessage); };
  const hasShownError = (errorMessage) => { return shownErrors.has(errorMessage); };

  const fetchData = async () => {
    try {
      // If theres no wallet address, don't proceed
      if (!walletAddress)
      {
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
    // Access window object
    if (typeof window !== 'undefined') { setCurrentPath(window.location.href); }
  }, []);

  useEffect(() => {
    shownErrors.clear();  // Clear errors when walletAddress changes

    // Fetch data when walletAddress changes
    if (walletAddress) { fetchData(); }
    
    // Set up the interval
    const interval = setInterval(() => { fetchData(); }, 5000);

    return () => clearInterval(interval);
  }, [walletAddress]); // Re-fetch when walletAddress or options change

  // Update input value
  const handleWalletAddressChange = (event) => { setInputAddress(event.target.value); };

  useEffect(() => {
    const walletData = { walletAddress, widgetPaddingSize, widgetFontSize, showWeekPnl, showMonthPnl, chartEnabled, platSelected };

    // Convert data to query parameters for new tab navigation
    const queryParams = new URLSearchParams(walletData).toString();

    // Store URL with the data passed as query params
    setWalletDetails(`${currentPath}components/WalletDetails?${queryParams}`);
  }, [walletAddress, widgetPaddingSize, widgetFontSize, showWeekPnl, showMonthPnl, chartEnabled, platSelected]); // Re-fetch when walletAddress, widgetPaddingSize, widgetFontSize, showWeekPnl, showMonthPnl, chartEnabled or platSelected change

  const handleSubmit = (event) => {
    event.preventDefault();
    setWalletAddress(inputAddress); // Set the wallet address from the form input
  };

  // Toggle weekly PnL
  const handleWeekPnlToggle = () => { setShowWeekPnl((prev) => !prev); };

  // Toggle monthly PnL
  const handleMonthPnlToggle = () => { setShowMonthPnl((prev) => !prev); };

  // Toggle PnL chart visibility
  const handleChartVisibility = () => { setChartEnabled((prev) => !prev); };

  // Toggle background CSS code
  const handleRemoveBackCSS = () => { setRemoveBackCSS((prev) => !prev); };

  const copyBackCSSToClipboard = () => {
    navigator.clipboard.writeText(backCSSRef.current.textContent); // Copies backCSSRef text to clipboard
    toast.success("CSS code copied to clipboard");
  }

  const copyURLToClipboard = () => {
    navigator.clipboard.writeText(walletDetails); // Copies walletDetails URL to clipboard
    toast.success("Widget URL copied to clipboard");
  }

  return (
    <div className="pt-24">
      <div className="flex justify-center items-center">
        <div className="bg-[rgba(31,32,41,0.2)] px-24 py-12 rounded-lg max-w-fit shadow-md">
          {/* Wallet Address Input Form */}
          <form onSubmit={handleSubmit} className="flex justify-center items-center">
            <input
              type="text"
              placeholder="Enter SOL Address"
              value={inputAddress}
              onChange={handleWalletAddressChange}
              className="bg-[#1F2029] text-gray-300 border border-[#343641] rounded-lg w-4/5 px-4 py-3 transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-opacity-50 focus:ring-green-800 focus:shadow-xl" />
            <button 
              type="submit" 
              className="bg-green-600 hover:bg-green-500 ml-2 py-3 px-3 rounded-md cursor-pointer shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
            </button>
          </form>
          <div className="flex justify-center items-center mt-12">
            <div className="w-auto border-r-2 border-[#343641] mr-12 pr-12">
              <div className="flex justify-left items-center">
                <RadioGroup orientation="vertical" color="success" defaultValue="p-8" onValueChange={setWidgetPaddingSize}>
                  <Radio className="mb-0.5" value="p-4">
                    <label className="text-gray-300 font-medium">Padding SM</label>
                  </Radio>
                  <Radio className="mb-0.5" value="p-6">
                    <label className="text-gray-300 font-medium">Padding LG</label>
                  </Radio>
                  <Radio className="mb-0.5" value="p-8">
                    <label className="text-gray-300 font-medium">Padding XL</label>
                  </Radio>
                  <Radio value="p-10">
                    <label className="text-gray-300 font-medium">Padding 2XL</label>
                  </Radio>
                </RadioGroup>
              </div>
            </div>
            <div className="w-auto border-r-2 border-[#343641] mr-12 pr-12">
              <div className="flex justify-left items-center">
                <RadioGroup orientation="vertical" color="success" defaultValue="text-sm" onValueChange={setWidgetFontSize}>
                  <Radio className="mb-0.5" value="text-sm">
                    <label className="text-gray-300 font-medium">Font Size SM</label>
                  </Radio>
                  <Radio className="mb-0.5" value="text-lg">
                    <label className="text-gray-300 font-medium">Font Size LG</label>
                  </Radio>
                  <Radio className="mb-0.5" value="text-xl">
                    <label className="text-gray-300 font-medium">Font Size XL</label>
                  </Radio>
                  <Radio value="text-2xl">
                    <label className="text-gray-300 font-medium">Font Size 2XL</label>
                  </Radio>
                </RadioGroup>
              </div>
            </div>
            <div className="w-auto border-r-2 border-[#343641] mr-12 pr-12">
              <div className="flex justify-start items-center">
                {/* Checkbox to toggle weekly PnL */}
                <div className="mb-4">
                  <Switch size="sm" color="success" isSelected={showWeekPnl} onChange={handleWeekPnlToggle}>
                    <label className="text-gray-300 font-medium">Show Weekly PnL</label>
                  </Switch>
                </div>
              </div>
              <div className="flex justify-start items-center">
                {/* Checkbox to toggle monthly PnL */}
                <div className="mb-4">
                  <Switch size="sm" color="success" isSelected={showMonthPnl} onChange={handleMonthPnlToggle}>
                    <label className="text-gray-300 font-medium">Show Monthly PnL</label>
                  </Switch>
                </div>
              </div>
              <div className="flex justify-start items-center">
                {/* Checkbox to toggle PnL chart visibility */}
                <div className="mb-4">
                  <Switch size="sm" color="success" isSelected={chartEnabled} onChange={handleChartVisibility}>
                    <label className="text-gray-300 font-medium">BETA: Show PnL Chart (Every 10 Trades)</label>
                  </Switch>
                </div>
              </div>
              <div className="flex justify-start items-center">
                {/* Checkbox to background CSS code */}
                <div>
                  <Switch size="sm" color="success" isSelected={showRemoveBackCSS} onChange={handleRemoveBackCSS}>
                    <label className="text-gray-300 font-medium">Remove Background CSS Code</label>
                  </Switch>
                </div>
              </div>
            </div>
            <div className="w-auto">
              <div className="flex justify-left items-center">
                <RadioGroup orientation="horizontal" defaultValue="noplat" onValueChange={setPlatSelected}>
                  <PlatformRadio className="mr-4" color="success" value="noplat">
                    <Image alt="noplat" width={"100"} height={"100"} className="w-16 h-16 ml-2 object-contain drop-shadow-md" src={"/noplat.png"} priority={false}/>
                  </PlatformRadio>
                  <PlatformRadio className="mr-4" color="success" value="photon">
                    <Image alt="photon" width={"100"} height={"100"} className="w-16 h-16 ml-2 object-contain drop-shadow-md" src={"/photon.png"} priority={false}/>
                  </PlatformRadio>
                  <PlatformRadio className="mr-4" color="success" value="bullx">
                    <Image alt="bullx" width={"100"} height={"100"} className="w-16 h-16 ml-2 object-contain drop-shadow-md" src={"/bullx.png"} priority={false}/>
                  </PlatformRadio>
                  <PlatformRadio color="success" value="nova">
                    <Image alt="nova" width={"100"} height={"100"} className="w-16 h-16 ml-2 object-contain drop-shadow-md" src={"/nova.png"} priority={false}/>
                  </PlatformRadio>
                </RadioGroup>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showRemoveBackCSS && (
        <div className="flex justify-center items-center w-full">
          <div className="flex justify-center items-center bg-[rgba(31,32,41,0.2)] text-white pl-8 pr-4 py-2 mt-8 rounded-lg shadow-lg">
            <div ref={backCSSRef}>
              <RemoveBackCSS/>
            </div>
            <button onClick={copyBackCSSToClipboard}
              className="bg-[#1F2029] text-white hover:bg-[rgba(31,32,41,0.2)] ml-4 py-3 px-3 rounded-md cursor-pointer shadow-md">
              <svg className="w-[18px] h-[18px] dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M15 4h3a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3m0 3h6m-6 5h6m-6 4h6M10 3v4h4V3h-4Z"/>
              </svg>
            </button>
          </div>
        </div>
      )}
      {walletData && currentPath && walletDetails && (
        <div className="flex justify-center items-center w-full">
          <div className="flex justify-center items-center bg-[rgba(31,32,41,0.2)] text-white pl-8 pr-4 py-2 mt-8 rounded-lg shadow-lg">
            {walletDetails}
            <button onClick={copyURLToClipboard}
              className="bg-[#1F2029] text-white hover:bg-[rgba(31,32,41,0.2)] ml-4 py-3 px-3 rounded-md cursor-pointer shadow-md">
              <svg className="w-[18px] h-[18px] dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M15 4h3a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3m0 3h6m-6 5h6m-6 4h6M10 3v4h4V3h-4Z"/>
              </svg>
            </button>
          </div>
        </div>
      )}
      {walletData ? (
        <NumberFlowGroup>
          <div className="flex justify-center items-center mt-8">
            <AnimatedBorderTrail trailSize="lg" trailColor={walletData?.pnl < 0 ? "red" : walletData?.pnl > 0 ? "green" : "grey"}>
              <div className="flex justify-center items-center bg-[#1F2029] text-white max-w-fit px-4 rounded-lg shadow-2xl">
                {platSelected && platSelected !== "noplat" && (
                  <div className="flex justify-center items-center text-shadow">
                    <img src={`/${platSelected}.png`} alt={platSelected} className="w-auto h-auto max-w-32 max-h-32 filter drop-shadow-xl"/>
                  </div>
                )}
                <div className={`text-9xl ${widgetPaddingSize}`}>
                  <div className={`${widgetFontSize} uppercase text-gray-500 tracking-wider text-shadow-sm mb-2`}>BALANCE</div>
                  <div className="flex justify-center items-center text-4xl font-bold text-shadow">
                    <NumberFlow value={walletData.currentBalance} trend={0} format={{ notation: "compact", maximumFractionDigits: 2 }}/>
                    <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="SOL" className="w-6 h-6 filter ml-4 drop-shadow"/>
                  </div>
                </div>
                <div className={`flex flex-col justify-center items-center text-9xl ${widgetPaddingSize} ${walletData?.pnl > 0 ? 'text-emerald-500' : walletData?.pnl < 0 ? 'text-red-500' : 'text-white'}`}>
                  <div className={`${widgetFontSize} uppercase text-gray-500 tracking-wider text-shadow-sm mb-2`}>TODAY PNL</div>
                  <div className="flex justify-center items-center text-4xl font-bold text-shadow">
                    <div style={{ '--number-flow-char-height': '0.85em' }} className="flex items-center gap-4 font-semibold">
                      {walletData?.pnl > 0 ? "+" : ""}<NumberFlow value={walletData?.pnl} trend={0} format={{ notation: "compact", maximumFractionDigits: 2 }}/>
                      <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="SOL" className="w-6 h-6 filter drop-shadow"/>
                    </div>
                  </div>
                  {parseFloat(walletData?.currentBalance).toFixed(2) !== parseFloat(walletData?.pnl).toFixed(2) && walletData?.pnl < 0 && (
                    <div className="flex justify-center items-center text-xs font-medium text-shadow bg-red-100 text-red-800 mt-2 px-4 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300">
                      <NumberFlow className={`${widgetFontSize}`} value={calcPnLPerc(walletData?.startingBalance, walletData?.currentBalance)} format={{ style: 'percent', maximumFractionDigits: 2, signDisplay: 'always' }}/>
                    </div>
                  )}
                  {parseFloat(walletData?.currentBalance).toFixed(2) !== parseFloat(walletData?.pnl).toFixed(2) && walletData?.pnl > 0 && (
                    <div className="flex justify-center items-center text-xs font-medium text-shadow bg-green-100 text-green-800 mt-2 px-4 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
                      <NumberFlow className={`${widgetFontSize}`} value={calcPnLPerc(walletData?.startingBalance, walletData?.currentBalance)} format={{ style: 'percent', maximumFractionDigits: 2, signDisplay: 'always' }}/>
                    </div>
                  )}
                </div>
                {showWeekPnl && (
                  <div className={`flex flex-col justify-center items-center text-9xl ${widgetPaddingSize} ${walletData?.weekPnl > 0 ? 'text-emerald-500' : walletData?.weekPnl < 0 ? 'text-red-500' : 'text-white'}`}>
                    <div className={`${widgetFontSize} uppercase text-gray-500 tracking-wider text-shadow-sm mb-2`}>WEEKLY PNL</div>
                    <div className="flex justify-center items-center text-4xl font-bold text-shadow">
                      <div style={{ '--number-flow-char-height': '0.85em' }} className="flex items-center gap-4 font-semibold">
                        {walletData?.weekPnl > 0 ? "+" : ""}<NumberFlow value={walletData?.weekPnl} trend={0} format={{ notation: "compact", maximumFractionDigits: 2 }}/>
                        <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="SOL" className="w-6 h-6 filter drop-shadow"/>
                      </div>
                    </div>
                    {parseFloat(walletData?.currentBalance).toFixed(2) !== parseFloat(walletData?.weekPnl).toFixed(2) && walletData?.weekPnl < 0 && (
                      <div className="flex justify-center items-center text-xs font-medium text-shadow bg-red-100 text-red-800 mt-2 px-4 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300">
                        <NumberFlow className={`${widgetFontSize}`} value={calcPnLPerc(walletData?.weekStartBalance, walletData?.currentBalance)} format={{ style: 'percent', maximumFractionDigits: 2, signDisplay: 'always' }}/>
                      </div>
                    )}
                    {parseFloat(walletData?.currentBalance).toFixed(2) !== parseFloat(walletData?.weekPnl).toFixed(2) && walletData?.weekPnl > 0 && (
                      <div className="flex justify-center items-center text-xs font-medium text-shadow bg-green-100 text-green-800 mt-2 px-4 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
                        <NumberFlow className={`${widgetFontSize}`} value={calcPnLPerc(walletData?.weekStartBalance, walletData?.currentBalance)} format={{ style: 'percent', maximumFractionDigits: 2, signDisplay: 'always' }}/>
                      </div>
                    )}
                  </div>
                )}
                {showMonthPnl && (
                  <div className={`flex flex-col justify-center items-center text-9xl ${widgetPaddingSize} ${walletData?.monthPnl > 0 ? 'text-emerald-500' : walletData?.monthPnl < 0 ? 'text-red-500' : 'text-white'}`}>
                    <div className={`${widgetFontSize} uppercase text-gray-500 tracking-wider text-shadow-sm mb-2`}>MONTHLY PNL</div>
                    <div className="flex justify-center items-center text-4xl font-bold text-shadow">
                      <div style={{ '--number-flow-char-height': '0.85em' }} className="flex items-center gap-4 font-semibold">
                        {walletData?.monthPnl > 0 ? "+" : ""}<NumberFlow value={walletData?.monthPnl} trend={0} format={{ notation: "compact", maximumFractionDigits: 2 }}/>
                        <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="SOL" className="w-6 h-6 filter drop-shadow"/>
                      </div>
                    </div>
                    {parseFloat(walletData?.currentBalance).toFixed(2) !== parseFloat(walletData?.monthPnl).toFixed(2) && walletData?.monthPnl < 0 && (
                      <div className="flex justify-center items-center text-xs font-medium text-shadow bg-red-100 text-red-800 mt-2 px-4 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300">
                        <NumberFlow className={`${widgetFontSize}`} value={calcPnLPerc(walletData?.monthStartBalance, walletData?.currentBalance)} format={{ style: 'percent', maximumFractionDigits: 2, signDisplay: 'always' }}/>
                      </div>
                    )}
                    {parseFloat(walletData?.currentBalance).toFixed(2) !== parseFloat(walletData?.monthPnl).toFixed(2) && walletData?.monthPnl > 0 && (
                      <div className="flex justify-center items-center text-xs font-medium text-shadow bg-green-100 text-green-800 mt-2 px-4 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
                        <NumberFlow className={`${widgetFontSize}`} value={calcPnLPerc(walletData?.monthStartBalance, walletData?.currentBalance)} format={{ style: 'percent', maximumFractionDigits: 2, signDisplay: 'always' }}/>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </AnimatedBorderTrail>
          </div>
        </NumberFlowGroup>
      ) : (
        <></>
      )}
    </div>
  );
};

export default WalletTracker;