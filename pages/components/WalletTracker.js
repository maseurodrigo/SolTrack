import React, { useEffect, useState, useRef } from "react";
import { toast } from 'react-hot-toast';
import { Switch, RadioGroup, Radio, Tooltip, cn } from "@nextui-org/react";
import NumberFlow, { NumberFlowGroup } from '@number-flow/react';
import Image from 'next/image';
import ColorPicker from 'react-best-gradient-color-picker';

import RemoveBackCSS from './RemoveBackCSS';
import AnimatedBorderTrail from './animata/container/animated-border-trail.tsx';

import getSolanaBalance from "/utils/solana-balance/wssSolBalance";
import { calcPnLPerc } from "/utils/CalcPnLPercent";
import { encrypt } from "/utils/CryptString";

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
        )
      }}
    >
      {children}
    </Radio>
  );
};

const WalletTracker = () => {
  const [walletData, setWalletData] = useState(null);
  const [walletDetails, setWalletDetails] = useState("");
  const [traderType, setTraderType] = useState("http"); // State to set the protocol for updating the balance
  const [inputAddress, setInputAddress] = useState(""); // State for the form input
  const [walletAddress, setWalletAddress] = useState(""); // State for wallet address input
  const [widgetPaddingSize, setWidgetPaddingSize] = useState("p-8"); // State to set widget padding sizes
  const [widgetFontSize, setWidgetFontSize] = useState("text-sm"); // State to set widget font sizes
  const [showWeekPnl, setShowWeekPnl] = useState(false); // State to toggle weekly PnL
  const [showMonthPnl, setShowMonthPnl] = useState(false); // State to toggle monthly PnL
  const [showPercentages, setShowPercentages] = useState(true); // State to toggle PnL percentages
  const [backChartEnabled, setBackChartEnabled] = useState(true); // State to toggle PnL 2D PnL chart
  const [showRemoveBackCSS, setRemoveBackCSS] = useState(false); // State to toggle background CSS code
  const [backgroundColor, setBackgroundColor] = useState('rgba(31, 32, 41, 1)'); // State to change background widget color
  const [platSelected, setPlatSelected] = useState(""); // State to toggle selected platform
  const [currentPath, setCurrentPath] = useState(""); // Get the current URL as a string
  
  const shownErrors = new Set(); // Function to track shown error messages
  const backCSSRef = useRef(null); // Reference to access DOM element rendered by RemoveBackCSS

  const setHasShownError = (errorMessage) => { shownErrors.add(errorMessage); };
  const hasShownError = (errorMessage) => { return shownErrors.has(errorMessage); };

  // Fetch balance using Solana RPC via WebSocket for real-time updates
  const currentBalance = getSolanaBalance(walletAddress);
  
  // Set up the HTTP interval
  let httpInterval = null;

  const fetchHttpData = async () => {
    try {
      // If theres a valid wallet address proceed
      if (walletAddress != null && (typeof walletAddress !== 'string' || walletAddress.trim() !== ''))
      {
        // Send a request with wallet address and current balance as query parameters
        const response = await fetch(`/api/wallet_data?wallet=${walletAddress}&currentBalance=${null}`);

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
      } else 
      {
        // Check if error message has already been shown using the Set
        if (!hasShownError("Wallet address required")) {
          toast.error("Wallet address required");
          setHasShownError("Wallet address required");
        }
        return;
      }
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

    // Clear errors when walletAddress changes
    shownErrors.clear();

    // Fetch data when walletAddress changes
    if (walletAddress) { fetchHttpData(); }

    if (traderType === "http") {
      // Set up an interval to fetch HTTP data every 5 seconds
      httpInterval = setInterval(() => { fetchHttpData(); }, 5000);

      // Cleanup the interval when the component is unmounted or dependencies change
      return () => clearInterval(httpInterval);
    }
  }, [traderType, walletAddress]); // Re-fetch when traderType or walletAddress change

  useEffect(() => {
    // If theres a valid wallet address proceed
    if (traderType === "wss" && walletAddress != null && (typeof walletAddress !== 'string' || walletAddress.trim() !== '')) { 
      const fetchData = async () => {
        try {
          // Send a request with wallet address and current balance as query parameters
          const response = await fetch(`/api/wallet_data?wallet=${walletAddress}&currentBalance=${currentBalance}`);
          
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
            toast.error("Overload with txns from the previous wallet");
            setHasShownError(err.message);
          }
        }
      };
      fetchData();
    }
  }, [currentBalance]); // Re-fetch when currentBalance change

  // Update input value
  const handleWalletAddressChange = (event) => { setInputAddress(event.target.value); };

  useEffect(() => {
    const walletData = { traderType, walletAddress, widgetPaddingSize, widgetFontSize, showWeekPnl, showMonthPnl, showPercentages, backChartEnabled, backgroundColor, platSelected };

    // Encrypt the string
    const encryptedURLData = encrypt(process.env.NEXT_PUBLIC_PASSPHRASE, JSON.stringify(walletData, null, 2));
    
    // Store URL with the data passed as query params
    setWalletDetails(`${currentPath}components/WalletDetails?encryptedData=${encryptedURLData}`);

    // Re-fetch when traderType, walletAddress, widgetPaddingSize, widgetFontSize, showWeekPnl, showMonthPnl, showPercentages, backChartEnabled, backgroundColor or platSelected change
  }, [traderType, walletAddress, widgetPaddingSize, widgetFontSize, showWeekPnl, showMonthPnl, showPercentages, backChartEnabled, backgroundColor, platSelected]);

  const handleSubmit = (event) => {
    event.preventDefault();

    // Checks if not null or undefined and not an empty string
    if (inputAddress != null && (typeof inputAddress !== 'string' || inputAddress.trim() !== '')) {
      setWalletAddress(inputAddress); // Set the wallet address from the form input
    } else {
      toast.error("Valid wallet address is required");
    }
  };

  // Toggle weekly PnL
  const handleWeekPnlToggle = () => { setShowWeekPnl((prev) => !prev); };

  // Toggle monthly PnL
  const handleMonthPnlToggle = () => { setShowMonthPnl((prev) => !prev); };

  // Toggle PnL percentages
  const handlePnlPercentsToggle = () => { setShowPercentages((prev) => !prev); };

  // Toggle 2D PnL chart visibility
  const handleBackChartVisibility = () => { setBackChartEnabled((prev) => !prev); };

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
    <div className="pt-12">
      <div className="flex justify-center items-center">
        <div className="bg-[rgba(31,32,41,0.2)] px-24 py-12 rounded-lg max-w-fit shadow-md">
          <div className="flex justify-center items-center border-b-2 border-[#343641] mb-12 pb-12">
            <div className="w-1/5 border-r-2 border-[#343641] mr-12 pr-12">
              <div className="flex justify-left items-center">
                <RadioGroup orientation="vertical" color="success" defaultValue="http" onValueChange={setTraderType}>
                  <Tooltip content="Faster Balance Update" color="success" placement="right">
                    <Radio className="mb-0.5" value="wss">
                      <label className="text-gray-300 font-medium">Fast-Paced Trader</label>
                    </Radio>
                  </Tooltip>
                  <Tooltip content="Accurate Balance Update" color="success" placement="right">
                    <Radio value="http">
                      <label className="text-gray-300 font-medium">Slow-Paced Trader</label>
                    </Radio>
                  </Tooltip>
                </RadioGroup>
              </div>
            </div>
            {/* Wallet Address Input Form */}
            <form onSubmit={handleSubmit} className="w-4/5">
              <input
                type="text"
                placeholder="Enter SOL Address"
                value={inputAddress}
                onChange={handleWalletAddressChange}
                className="bg-[#1F2029] text-gray-300 border border-[#343641] rounded-lg w-4/5 px-4 py-3 transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-opacity-50 focus:ring-green-800 focus:shadow-xl" />
              <button type="submit" className="bg-green-600 hover:bg-green-500 ml-2 py-3 px-3 rounded-md cursor-pointer shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                </svg>
              </button>
            </form>
          </div>          
          <div className={`flex justify-center items-center ${walletAddress != null && (typeof walletAddress !== 'string' || walletAddress.trim() !== '') ? "" : "opacity-25 pointer-events-none"}`}>
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
                {/* Switch to toggle weekly PnL */}
                <div className="mb-4">
                  <Switch size="sm" color="success" isSelected={showWeekPnl} onChange={handleWeekPnlToggle}>
                    <label className="text-gray-300 font-medium">Show Weekly PnL</label>
                  </Switch>
                </div>
              </div>
              <div className="flex justify-start items-center">
                {/* Switch to toggle monthly PnL */}
                <div className="mb-4">
                  <Switch size="sm" color="success" isSelected={showMonthPnl} onChange={handleMonthPnlToggle}>
                    <label className="text-gray-300 font-medium">Show Monthly PnL</label>
                  </Switch>
                </div>
              </div>
              <div className="flex justify-start items-center">
                {/* Switch to toggle PnL percentages */}
                <div className="mb-4">
                  <Switch size="sm" color="success" isSelected={showPercentages} onChange={handlePnlPercentsToggle}>
                    <label className="text-gray-300 font-medium">Show PnL Percentages</label>
                  </Switch>
                </div>
              </div>
              <div className="flex justify-start items-center">
                {/* Switch to toggle 2D PnL chart visibility */}
                <div className="mb-4">
                  <Switch size="sm" color="success" isSelected={backChartEnabled} onChange={handleBackChartVisibility}>
                    <label className="text-gray-300 font-medium">Show 2D Background Chart</label>
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
            <div className="w-auto border-r-2 border-[#343641] mr-12 pr-12">
              <ColorPicker id="rbgcp-square-handle" instanceId="rbgcp-square-handle" className="rounded-lg shadow-md" value={backgroundColor} onChange={setBackgroundColor} hidePresets={true} hideInputs={true} hideEyeDrop={true} hideColorGuide={true} hideInputType={true}/>
            </div>
            <div className="w-auto">
              <div className="flex justify-left items-center">
                <RadioGroup orientation="vertical" defaultValue="noplat" onValueChange={setPlatSelected}>
                  <PlatformRadio className="mb-4" color="success" value="noplat">
                    <Image alt="noplat" width={"100"} height={"100"} className="w-16 h-16 ml-2 object-contain drop-shadow-md" src={"/noplat.png"} priority={false}/>
                  </PlatformRadio>
                  <PlatformRadio className="mb-4" color="success" value="photon">
                    <Image alt="photon" width={"100"} height={"100"} className="w-16 h-16 ml-2 object-contain drop-shadow-md" src={"/photon.png"} priority={false}/>
                  </PlatformRadio>
                  <PlatformRadio className="mb-4" color="success" value="bullx">
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
          <div className="flex justify-center items-center max-w-screen-xl bg-[rgba(31,32,41,0.2)] text-white pl-8 pr-4 py-2 mt-8 rounded-lg shadow-lg">
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
          <div className="flex justify-center items-center max-w-screen-xl bg-[rgba(31,32,41,0.2)] text-white pl-8 pr-4 py-2 mt-8 rounded-lg shadow-lg">
            <span className="max-w-full overflow-hidden whitespace-nowrap text-ellipsis">
              {walletDetails}
            </span>
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
          <div className="flex justify-center items-center my-8">
            <AnimatedBorderTrail trailSize="lg" trailColor={parseFloat(walletData?.pnl).toFixed(2) < 0 ? "red" : parseFloat(walletData?.pnl).toFixed(2) > 0 ? "green" : "grey"}>
              <div className="flex justify-center items-center text-white max-w-fit px-4 rounded-lg shadow-2xl" style={{ background: `${backgroundColor}` }}>
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
                <div className={`flex flex-col justify-center items-center text-9xl ${widgetPaddingSize} ${parseFloat(walletData?.pnl).toFixed(2) > 0 ? 'text-emerald-500' : parseFloat(walletData?.pnl).toFixed(2) < 0 ? 'text-red-500' : 'text-white'}`}>
                  <div className={`${widgetFontSize} uppercase text-gray-500 tracking-wider text-shadow-sm mb-2`}>TODAY PNL</div>
                  <div className="flex justify-center items-center text-4xl font-bold text-shadow">
                    <div style={{ '--number-flow-char-height': '0.85em' }} className="flex items-center gap-4 font-semibold">
                      {parseFloat(walletData?.pnl).toFixed(2) > 0 ? "+" : ""}<NumberFlow value={walletData?.pnl} trend={0} format={{ notation: "compact", maximumFractionDigits: 2 }}/>
                      <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="SOL" className="w-6 h-6 filter drop-shadow"/>
                    </div>
                  </div>
                  {showPercentages && parseFloat(walletData?.currentBalance).toFixed(2) !== parseFloat(walletData?.pnl).toFixed(2) && parseFloat(walletData?.pnl).toFixed(2) < 0 && (
                    <div className="flex justify-center items-center text-xs font-medium text-shadow bg-red-100 text-red-800 mt-2 px-4 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300">
                      <NumberFlow className={`${widgetFontSize}`} value={calcPnLPerc(walletData?.startingBalance, walletData?.currentBalance)} format={{ style: 'percent', maximumFractionDigits: 2, signDisplay: 'always' }}/>
                    </div>
                  )}
                  {showPercentages && parseFloat(walletData?.currentBalance).toFixed(2) !== parseFloat(walletData?.pnl).toFixed(2) && parseFloat(walletData?.pnl).toFixed(2) > 0 && (
                    <div className="flex justify-center items-center text-xs font-medium text-shadow bg-green-100 text-green-800 mt-2 px-4 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
                      <NumberFlow className={`${widgetFontSize}`} value={calcPnLPerc(walletData?.startingBalance, walletData?.currentBalance)} format={{ style: 'percent', maximumFractionDigits: 2, signDisplay: 'always' }}/>
                    </div>
                  )}
                </div>
                {showWeekPnl && (
                  <div className={`flex flex-col justify-center items-center text-9xl ${widgetPaddingSize} ${parseFloat(walletData?.weekPnl).toFixed(2) > 0 ? 'text-emerald-500' : parseFloat(walletData?.weekPnl).toFixed(2) < 0 ? 'text-red-500' : 'text-white'}`}>
                    <div className={`${widgetFontSize} uppercase text-gray-500 tracking-wider text-shadow-sm mb-2`}>WEEKLY PNL</div>
                    <div className="flex justify-center items-center text-4xl font-bold text-shadow">
                      <div style={{ '--number-flow-char-height': '0.85em' }} className="flex items-center gap-4 font-semibold">
                        {parseFloat(walletData?.weekPnl).toFixed(2) > 0 ? "+" : ""}<NumberFlow value={walletData?.weekPnl} trend={0} format={{ notation: "compact", maximumFractionDigits: 2 }}/>
                        <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="SOL" className="w-6 h-6 filter drop-shadow"/>
                      </div>
                    </div>
                    {showPercentages && parseFloat(walletData?.currentBalance).toFixed(2) !== parseFloat(walletData?.weekPnl).toFixed(2) && parseFloat(walletData?.weekPnl).toFixed(2) < 0 && (
                      <div className="flex justify-center items-center text-xs font-medium text-shadow bg-red-100 text-red-800 mt-2 px-4 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300">
                        <NumberFlow className={`${widgetFontSize}`} value={calcPnLPerc(walletData?.weekStartBalance, walletData?.currentBalance)} format={{ style: 'percent', maximumFractionDigits: 2, signDisplay: 'always' }}/>
                      </div>
                    )}
                    {showPercentages && parseFloat(walletData?.currentBalance).toFixed(2) !== parseFloat(walletData?.weekPnl).toFixed(2) && parseFloat(walletData?.weekPnl).toFixed(2) > 0 && (
                      <div className="flex justify-center items-center text-xs font-medium text-shadow bg-green-100 text-green-800 mt-2 px-4 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
                        <NumberFlow className={`${widgetFontSize}`} value={calcPnLPerc(walletData?.weekStartBalance, walletData?.currentBalance)} format={{ style: 'percent', maximumFractionDigits: 2, signDisplay: 'always' }}/>
                      </div>
                    )}
                  </div>
                )}
                {showMonthPnl && (
                  <div className={`flex flex-col justify-center items-center text-9xl ${widgetPaddingSize} ${parseFloat(walletData?.monthPnl).toFixed(2) > 0 ? 'text-emerald-500' : parseFloat(walletData?.monthPnl).toFixed(2) < 0 ? 'text-red-500' : 'text-white'}`}>
                    <div className={`${widgetFontSize} uppercase text-gray-500 tracking-wider text-shadow-sm mb-2`}>MONTHLY PNL</div>
                    <div className="flex justify-center items-center text-4xl font-bold text-shadow">
                      <div style={{ '--number-flow-char-height': '0.85em' }} className="flex items-center gap-4 font-semibold">
                        {parseFloat(walletData?.monthPnl).toFixed(2) > 0 ? "+" : ""}<NumberFlow value={walletData?.monthPnl} trend={0} format={{ notation: "compact", maximumFractionDigits: 2 }}/>
                        <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="SOL" className="w-6 h-6 filter drop-shadow"/>
                      </div>
                    </div>
                    {showPercentages && parseFloat(walletData?.currentBalance).toFixed(2) !== parseFloat(walletData?.monthPnl).toFixed(2) && parseFloat(walletData?.monthPnl).toFixed(2) < 0 && (
                      <div className="flex justify-center items-center text-xs font-medium text-shadow bg-red-100 text-red-800 mt-2 px-4 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300">
                        <NumberFlow className={`${widgetFontSize}`} value={calcPnLPerc(walletData?.monthStartBalance, walletData?.currentBalance)} format={{ style: 'percent', maximumFractionDigits: 2, signDisplay: 'always' }}/>
                      </div>
                    )}
                    {showPercentages && parseFloat(walletData?.currentBalance).toFixed(2) !== parseFloat(walletData?.monthPnl).toFixed(2) && parseFloat(walletData?.monthPnl).toFixed(2) > 0 && (
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