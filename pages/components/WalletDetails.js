import { React, useEffect, useState, useRef } from "react";
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/router';
import NumberFlow, { NumberFlowGroup } from '@number-flow/react';
import { motion } from "motion/react";
import ReactPlayer from 'react-player';

import AnimatedBorderTrail from './animata/container/animated-border-trail.tsx';
import LineChart2D from './charts/LineChart2D.js';

import { calcPnLPerc } from "/utils/CalcPnLPercent";
import getSolanaBalance from "/utils/solana-balance/wssSolBalance";
import { decrypt } from "/utils/CryptString";

export default function WalletDetails() {
    const router = useRouter();
    const [locWalletAddress, setLocWalletAddress] = useState(""); // State for wallet address input
    const [walletData, setWalletData] = useState(null);
    const [walletConfig, setWalletConfig] = useState(null);
    const [tradeData, setTradeData] = useState([]);

    // Fetch balance using Solana RPC via WebSocket for real-time updates
    const currentBalance = getSolanaBalance(locWalletAddress);

    useEffect(() => {
        if (router.isReady) {
            // Extract the query parameters from the URL
            const { encryptedData } = router.query;

            if (encryptedData) { 
                // Decrypt the data using the decrypt function
                const decryptedURLData = decrypt(process.env.NEXT_PUBLIC_PASSPHRASE, encryptedData);
                
                 // Check if decryption were successful
                if (decryptedURLData) {
                    // Parse decrypted data into JSON
                    const urlJsonData = JSON.parse(decryptedURLData);

                    if (urlJsonData.walletAddress) {
                        // Set the wallet address from URL
                        setLocWalletAddress(urlJsonData.walletAddress);

                        // Convert query parameters to the proper data structure
                        setWalletConfig({
                            traderType: urlJsonData.traderType?.toLowerCase(),
                            widgetPaddingSize: urlJsonData.widgetPaddingSize?.toLowerCase(),
                            widgetFontSize: urlJsonData.widgetFontSize?.toLowerCase(),
                            showWeekPnl: urlJsonData.showWeekPnl,
                            showMonthPnl: urlJsonData.showMonthPnl, 
                            showPercentages: urlJsonData.showPercentages,
                            backChartEnabled: urlJsonData.backChartEnabled,
                            backgroundColor: urlJsonData.backgroundColor?.toLowerCase(),
                            inputBackgroundVideoURL: urlJsonData.inputBackgroundVideoURL,
                            backgroundVideoBlur: urlJsonData.backgroundVideoBlur?.toLowerCase(),
                            platSelected: urlJsonData.platSelected?.toLowerCase(),
                            inputLogoURL: urlJsonData.inputLogoURL
                        });

                        if(urlJsonData.traderType === "wss") { 
                            toast('If the balance stops updating, go back to the dashboard and change the traders pace setting',
                                {
                                    duration: 5000,
                                    style: { borderRadius: '10px', background: '#333', color: '#fff' },
                                    icon: '⚙️'
                                }
                            );
                        }
                    } else {
                        router.push('/'); // Redirect back to home if data is missing
                        return; // Exit early to avoid further processing
                    }
                } else {
                    router.push('/'); // Redirect to home or another fallback page
                    return; // Exit early to avoid further processing
                }
            } else {
                router.push('/'); // Redirect to home or another fallback page
                return; // Exit early to avoid further processing
            }
        }
    }, [router.isReady, router.query]);

    useEffect(() => {
        // If theres a valid wallet address proceed
        if (locWalletAddress != null && (typeof locWalletAddress !== 'string' || locWalletAddress.trim() !== '')) {
            const fetchHttpData = async () => {
                try {
                    // Send a request with wallet address and current balance as query parameters
                    const response = await fetch(`/api/wallet_data?wallet=${locWalletAddress}&currentBalance=${null}`);

                    // If response is not okay, parse the error response
                    if (!response.ok) {
                        const errorData = await response.json();  // Parse JSON to get error details
                        toast.error(errorData.error);
                        return;
                    }
                    
                    // Parse the response data and update the wallet data state
                    const data = await response.json();
                    setWalletData(data);
                } catch (error) {
                    toast.error(error.message);
                }
            };

            fetchHttpData(); // Call the async function

            if (walletConfig.traderType === "http") {
                // Set up an interval to fetch HTTP data every 5 seconds
                const interval = setInterval(fetchHttpData, 5000);
                
                // Cleanup the interval when the component is unmounted or dependencies change
                return () => clearInterval(interval);
            }
        }
    }, [locWalletAddress]); // Re-fetch when walletAddress change
    
    useEffect(() => {
        // If theres a valid wallet address proceed
        if (walletConfig && walletConfig.traderType === "wss" && locWalletAddress != null && (typeof locWalletAddress !== 'string' || locWalletAddress.trim() !== '')) {
            const fetchData = async () => {
                try {
                    // Send a request with wallet address and current balance as query parameters
                    const response = await fetch(`/api/wallet_data?wallet=${locWalletAddress}&currentBalance=${currentBalance}`);

                    // If response is not okay, parse the error response
                    if (!response.ok) {
                        const errorData = await response.json();  // Parse JSON to get error details
                        toast.error(errorData.error);
                        return;
                    }
                    
                    // Parse the response data and update the wallet data state
                    const data = await response.json();
                    setWalletData(data);
                } catch (error) {
                    toast.error(error.message);
                }
            };
            fetchData(); // Call the async function
        }
    }, [currentBalance]); // Re-fetch when currentBalance change

    useEffect(() => {
        if (walletData?.pnl !== undefined) {
            
            // Single trade data
            const newTradeData = { timestamp: Date.now(), value: walletData?.pnl };

            // Append new data to the existing tradeData state with checks
            setTradeData((prevTradeData) => {
                // If tradeData is empty, append all new data
                if (prevTradeData.length === 0) { return [newTradeData]; }

                // If tradeData is not empty, check the last value
                const lastValue = prevTradeData[prevTradeData.length - 1];
                if (lastValue.value === newTradeData.value) {
                    return prevTradeData; // If the last value is the same as the new entry, do nothing
                }

                // If it's different append the new entry
                return [...prevTradeData, newTradeData];
            });
        }
    }, [walletData]);

    return (
        <>
            {walletConfig && walletData ? (
                <NumberFlowGroup>
                    <div className="fixed bottom-0 left-0 w-full flex justify-center items-center mb-12">
                        <AnimatedBorderTrail trailSize="lg" trailColor={parseFloat(walletData?.pnl).toFixed(2) < 0 ? "red" : parseFloat(walletData?.pnl).toFixed(2) > 0 ? "green" : "white"}>
                            <div className="flex justify-center items-center text-white max-w-fit px-4 rounded-lg shadow-2xl" style={{ background: `${walletConfig.backgroundColor}` }}>
                                {(walletConfig.inputBackgroundVideoURL) && (
                                    <div className={`absolute top-0 left-0 flex justify-center items-center content-center ${walletConfig.backgroundVideoBlur} filter brightness-50 contrast-125 saturate-50 pointer-events-none`}>
                                        <ReactPlayer
                                            style={{ position: "absolute", top: 0, left: 0 }}
                                            className="object-cover"
                                            url={walletConfig.inputBackgroundVideoURL}
                                            playing
                                            loop
                                            muted
                                            controls={false}
                                            config={{ file: { attributes: { autoPlay: true, muted: true, loop: true, playsInline: true } } }}
                                        />
                                    </div>
                                )}
                                {walletConfig.backChartEnabled && ( <LineChart2D data={tradeData} /> )}
                                {(walletConfig.inputLogoURL || (walletConfig.platSelected && walletConfig.platSelected !== "noplat")) && (
                                    <motion.div
                                        animate={{
                                            x: [0, 5, -5, 5, -5, 5, -5, 5, -5, 50, -50, 80, -80, 360, -180, 0],
                                            y: [0, 1, -1, 2, -2, 2, -2, 1, -1, 0, 0, 0, 0, 0, 0, 0, 0],
                                            scale: [1, 1.1, 1, 1.1, 1, 1.2, 0.8, 1, 1, 1.2, 0.8, 1, 2, 0.5, 1],
                                            rotate: [0, 0, 0, 0, 0, 0, -5, 5, -5, 5, 0, 90, 180, 720, 1440, 4320, 0],
                                            opacity: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0.9, 0.8, 0.7, 0.6, 0.6, 0.8, 1]
                                        }}
                                        transition={{ ease: "easeInOut", duration: 12, repeat: Infinity, repeatDelay: 300 }}
                                        className="flex justify-center items-center text-shadow">
                                        {walletConfig.inputLogoURL ? (
                                            <img src={walletConfig.inputLogoURL} alt="Custom URL Logo" className="w-auto h-auto max-w-24 max-h-24 ml-4 mr-2 rounded-full filter drop-shadow-xl"/>
                                        ) : (
                                            <img src={`/${walletConfig.platSelected}.png`} alt={walletConfig.platSelected} className="w-auto h-auto max-w-32 max-h-32 filter drop-shadow-xl"/>
                                        )}
                                    </motion.div>
                                )}
                                <div className={`text-9xl ${walletConfig.widgetPaddingSize}`}>
                                    <div className={`${walletConfig.widgetFontSize} text-center uppercase text-gray-500 tracking-wider mb-2`}>
                                        <label className="drop-shadow-md">BALANCE</label>
                                    </div>
                                    <div className="flex justify-center items-center text-4xl font-bold text-shadow">
                                        <NumberFlow value={walletData.currentBalance} trend={0} format={{ notation: "compact", maximumFractionDigits: 2 }} className="drop-shadow-xl"/>
                                        <img src="https://assets.crypto.ro/logos/solana-sol-logo.png" alt="SOL" className="w-6 h-6 filter ml-4 drop-shadow-xl"/>
                                    </div>
                                </div>
                                <div className={`flex flex-col justify-center items-center text-9xl ${walletConfig.widgetPaddingSize} ${parseFloat(walletData?.pnl).toFixed(2) > 0 ? 'text-emerald-500' : parseFloat(walletData?.pnl).toFixed(2) < 0 ? 'text-red-500' : 'text-white'}`}>
                                    <div className={`${walletConfig.widgetFontSize} text-center uppercase text-gray-500 tracking-wider mb-2`}>
                                        <label className="drop-shadow-md">TODAY</label>
                                    </div>
                                    <div className="flex justify-center items-center text-4xl font-bold text-shadow">
                                        <div style={{ '--number-flow-char-height': '0.85em' }} className="flex items-center gap-4 font-semibold">
                                            {parseFloat(walletData?.pnl).toFixed(2) > 0 ? "+" : ""}<NumberFlow value={walletData?.pnl} trend={0} format={{ notation: "compact", maximumFractionDigits: 2 }} className={`${parseFloat(walletData?.pnl).toFixed(2) > 0 ? 'text-emerald-500' : parseFloat(walletData?.pnl).toFixed(2) < 0 ? 'text-red-500' : 'text-white'} drop-shadow-xl`}/>
                                            <img src="https://assets.crypto.ro/logos/solana-sol-logo.png" alt="SOL" className="w-6 h-6 filter drop-shadow-xl"/>
                                        </div>
                                    </div>
                                    {walletConfig.showPercentages && parseFloat(walletData?.currentBalance).toFixed(2) !== parseFloat(walletData?.pnl).toFixed(2) && parseFloat(walletData?.pnl).toFixed(2) < 0 && (
                                        <div className="flex justify-center items-center text-xs font-medium text-shadow bg-red-100 text-red-800 mt-2 px-4 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300">
                                            <NumberFlow className={`${walletConfig.widgetFontSize} drop-shadow-xl`} value={calcPnLPerc(walletData?.startingBalance, walletData?.currentBalance)} format={{ style: 'percent', maximumFractionDigits: 2, signDisplay: 'always' }}/>
                                        </div>
                                    )}
                                    {walletConfig.showPercentages && parseFloat(walletData?.currentBalance).toFixed(2) !== parseFloat(walletData?.pnl).toFixed(2) && parseFloat(walletData?.pnl).toFixed(2) > 0 && (
                                        <div className="flex justify-center items-center text-xs font-medium text-shadow bg-green-100 text-green-800 mt-2 px-4 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
                                            <NumberFlow className={`${walletConfig.widgetFontSize} drop-shadow-xl`} value={calcPnLPerc(walletData?.startingBalance, walletData?.currentBalance)} format={{ style: 'percent', maximumFractionDigits: 2, signDisplay: 'always' }}/>
                                        </div>
                                    )}
                                </div>
                                {walletConfig.showWeekPnl && (
                                    <div className={`flex flex-col justify-center items-center text-9xl ${walletConfig.widgetPaddingSize} ${parseFloat(walletData?.weekPnl).toFixed(2) > 0 ? 'text-emerald-500' : parseFloat(walletData?.weekPnl).toFixed(2) < 0 ? 'text-red-500' : 'text-white'}`}>
                                        <div className={`${walletConfig.widgetFontSize} text-center uppercase text-gray-500 tracking-wider text-shadow-sm mb-2`}>
                                            <label className="drop-shadow-md">WEEKLY</label>
                                        </div>
                                        <div className="flex justify-center items-center text-4xl font-bold text-shadow">
                                            <div style={{ '--number-flow-char-height': '0.85em' }} className="flex items-center gap-4 font-semibold">
                                                {parseFloat(walletData?.weekPnl).toFixed(2) > 0 ? "+" : ""}<NumberFlow value={walletData?.weekPnl} trend={0} format={{ notation: "compact", maximumFractionDigits: 2 }} className={`${parseFloat(walletData?.weekPnl).toFixed(2) > 0 ? 'text-emerald-500' : parseFloat(walletData?.weekPnl).toFixed(2) < 0 ? 'text-red-500' : 'text-white'} drop-shadow-xl`}/>
                                                <img src="https://assets.crypto.ro/logos/solana-sol-logo.png" alt="SOL" className="w-6 h-6 filter drop-shadow-xl"/>
                                            </div>
                                        </div>
                                        {walletConfig.showPercentages && parseFloat(walletData?.currentBalance).toFixed(2) !== parseFloat(walletData?.weekPnl).toFixed(2) && parseFloat(walletData?.weekPnl).toFixed(2) < 0 && (
                                            <div className="flex justify-center items-center text-xs font-medium text-shadow bg-red-100 text-red-800 mt-2 px-4 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300">
                                                <NumberFlow className={`${walletConfig.widgetFontSize} drop-shadow-xl`} value={calcPnLPerc(walletData?.weekStartBalance, walletData?.currentBalance)} format={{ style: 'percent', maximumFractionDigits: 2, signDisplay: 'always' }}/>
                                            </div>
                                        )}
                                        {walletConfig.showPercentages && parseFloat(walletData?.currentBalance).toFixed(2) !== parseFloat(walletData?.weekPnl).toFixed(2) && parseFloat(walletData?.weekPnl).toFixed(2) > 0 && (
                                            <div className="flex justify-center items-center text-xs font-medium text-shadow bg-green-100 text-green-800 mt-2 px-4 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
                                                <NumberFlow className={`${walletConfig.widgetFontSize} drop-shadow-xl`} value={calcPnLPerc(walletData?.weekStartBalance, walletData?.currentBalance)} format={{ style: 'percent', maximumFractionDigits: 2, signDisplay: 'always' }}/>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {walletConfig.showMonthPnl && (
                                    <div className={`flex flex-col justify-center items-center text-9xl ${walletConfig.widgetPaddingSize} ${parseFloat(walletData?.monthPnl).toFixed(2) > 0 ? 'text-emerald-500' : parseFloat(walletData?.monthPnl).toFixed(2) < 0 ? 'text-red-500' : 'text-white'}`}>
                                        <div className={`${walletConfig.widgetFontSize} text-center uppercase text-gray-500 tracking-wider text-shadow-sm mb-2`}>
                                            <label className="drop-shadow-md">MONTHLY</label>
                                        </div>
                                        <div className="flex justify-center items-center text-4xl font-bold text-shadow">
                                            <div style={{ '--number-flow-char-height': '0.85em' }} className="flex items-center gap-4 font-semibold">
                                                {parseFloat(walletData?.monthPnl).toFixed(2) > 0 ? "+" : ""}<NumberFlow value={walletData?.monthPnl} trend={0} format={{ notation: "compact", maximumFractionDigits: 2 }} className={`${parseFloat(walletData?.monthPnl).toFixed(2) > 0 ? 'text-emerald-500' : parseFloat(walletData?.monthPnl).toFixed(2) < 0 ? 'text-red-500' : 'text-white'} drop-shadow-xl`}/>
                                                <img src="https://assets.crypto.ro/logos/solana-sol-logo.png" alt="SOL" className="w-6 h-6 filter drop-shadow-xl"/>
                                            </div>
                                        </div>
                                        {walletConfig.showPercentages && parseFloat(walletData?.currentBalance).toFixed(2) !== parseFloat(walletData?.monthPnl).toFixed(2) && parseFloat(walletData?.monthPnl).toFixed(2) < 0 && (
                                            <div className="flex justify-center items-center text-xs font-medium text-shadow bg-red-100 text-red-800 mt-2 px-4 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300">
                                                <NumberFlow className={`${walletConfig.widgetFontSize} drop-shadow-xl`} value={calcPnLPerc(walletData?.monthStartBalance, walletData?.currentBalance)} format={{ style: 'percent', maximumFractionDigits: 2, signDisplay: 'always' }}/>
                                            </div>
                                        )}
                                        {walletConfig.showPercentages && parseFloat(walletData?.currentBalance).toFixed(2) !== parseFloat(walletData?.monthPnl).toFixed(2) && parseFloat(walletData?.monthPnl).toFixed(2) > 0 && (
                                            <div className="flex justify-center items-center text-xs font-medium text-shadow bg-green-100 text-green-800 mt-2 px-4 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
                                                <NumberFlow className={`${walletConfig.widgetFontSize} drop-shadow-xl`} value={calcPnLPerc(walletData?.monthStartBalance, walletData?.currentBalance)} format={{ style: 'percent', maximumFractionDigits: 2, signDisplay: 'always' }}/>
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
        </>
    );
}