import { React, useEffect, useState } from "react";
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/router';
import NumberFlow, { NumberFlowGroup } from '@number-flow/react';

import AnimatedBorderTrail from './animata/container/animated-border-trail.tsx';
import IconRipple from './animata/container/icon-ripple.tsx';
import { calcPnLPerc } from "/utils/calcPnLPercentage";
import Chart3D from './THREE/Chart3D.js';

export default function WalletDetails() {
    const router = useRouter();
    const [locWalletAddress, setLocWalletAddress] = useState(""); // State for wallet address input
    const [walletData, setWalletData] = useState(null);
    const [walletConfig, setWalletConfig] = useState(null);
    const [tradeData, setTradeData] = useState([]);
    const [isChartVisible, setIsChartVisible] = useState(false); // Controls visibility
    const [renderChartData, setRenderChartData] = useState(false); // Controls rendering

    useEffect(() => {
        if (router.isReady) {
            const { walletAddress, widgetPaddingSize, widgetFontSize, showWeekPnl, showMonthPnl, chartEnabled, platSelected } = router.query;
            setLocWalletAddress(walletAddress); // Set the wallet address from URL

            if (walletAddress) {
                // Convert query parameters to the proper data structure
                setWalletConfig({
                    widgetPaddingSize: widgetPaddingSize?.toLowerCase(),
                    widgetFontSize: widgetFontSize?.toLowerCase(),
                    showWeekPnl: showWeekPnl?.toLowerCase() === 'true', // Convert to boolean
                    showMonthPnl: showMonthPnl?.toLowerCase() === 'true', // Convert to boolean
                    chartEnabled: chartEnabled?.toLowerCase() === 'true', // Convert to boolean
                    platSelected: platSelected?.toLowerCase()
                });
            } else {
                // Redirect back to home if data is missing
                router.push('/');
            }
        }
    }, [router.isReady, router.query]);

    useEffect(() => {
        // Poll for wallet data every 5 seconds
        if (locWalletAddress) {
            const fetchData = async () => {
                try {
                    const response = await fetch(`/api/wallet_data?wallet=${locWalletAddress}`);
                    const data = await response.json();
                    setWalletData(data);
                } catch (error) {
                    toast.error(error); 
                }
            };

            fetchData();
            const interval = setInterval(fetchData, 5000);
            return () => clearInterval(interval); // Cleanup interval
        }
    }, [locWalletAddress]);

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

    useEffect(() => {
        if (tradeData.length > 1) {
            setRenderChartData(true); // Start rendering the chart
            setTimeout(() => setIsChartVisible(true), 0); // Trigger fade-in effect

            const timer = setTimeout(() => {
                setIsChartVisible(false); // Start fade-out effect
                setTimeout(() => setRenderChartData(false), 1000); // Remove from DOM after fade-out
            }, 6000);

            // Clean up the timer when tradeData changes or component unmounts
            return () => clearTimeout(timer);
        }
    }, [tradeData]);

    return (
        <>
            {walletConfig && walletData ? (
                <NumberFlowGroup>
                    <div className="fixed bottom-0 left-0 w-full flex justify-center items-center mb-12">
                        <AnimatedBorderTrail trailSize="lg" trailColor={walletData?.pnl < 0 ? "red" : walletData?.pnl > 0 ? "green" : "white"}>
                            <div className="flex justify-center items-center bg-[#1F2029] text-white max-w-fit px-4 rounded-lg shadow-2xl">
                                {walletConfig.platSelected && walletConfig.platSelected !== "noplat" && (
                                    <div className="flex justify-center items-center text-shadow">
                                        <img src={`/${walletConfig.platSelected}.png`} alt={walletConfig.platSelected} className="w-auto h-auto max-w-32 max-h-32 filter drop-shadow-xl"/>
                                    </div>
                                )}
                                <div className={`text-9xl ${walletConfig.widgetPaddingSize}`}>
                                    <div className={`${walletConfig.widgetFontSize} text-center uppercase text-gray-500 tracking-wider text-shadow-sm mb-2`}>BALANCE</div>
                                    <div className="flex justify-center items-center text-4xl font-bold text-shadow">
                                        <NumberFlow value={walletData.currentBalance} trend={0} format={{ notation: "compact", maximumFractionDigits: 2 }}/>
                                        <IconRipple borderColor={walletData?.pnl < 0 ? "#ef4444" : walletData?.pnl > 0 ? "#22c55e" : "#6b7280"} inset="0px"/>
                                    </div>
                                </div>
                                <div className={`flex flex-col justify-center items-center text-9xl ${walletConfig.widgetPaddingSize} ${walletData?.pnl > 0 ? 'text-emerald-500' : walletData?.pnl < 0 ? 'text-red-500' : 'text-white'}`}>
                                    <div className={`${walletConfig.widgetFontSize} text-center uppercase text-gray-500 tracking-wider text-shadow-sm mb-2`}>TODAY</div>
                                    <div className="flex justify-center items-center text-4xl font-bold text-shadow">
                                        <div style={{ '--number-flow-char-height': '0.85em' }} className="flex items-center gap-4 font-semibold">
                                            {walletData?.pnl > 0 ? "+" : ""}<NumberFlow value={walletData?.pnl} trend={0} format={{ notation: "compact", maximumFractionDigits: 2 }}/>
                                            <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="SOL" className="w-6 h-6 filter drop-shadow"/>
                                        </div>
                                    </div>
                                    {parseFloat(walletData?.currentBalance).toFixed(2) !== parseFloat(walletData?.pnl).toFixed(2) && walletData?.pnl < 0 && (
                                        <div className="flex justify-center items-center text-xs font-medium text-shadow bg-red-100 text-red-800 mt-2 px-4 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300">
                                            <NumberFlow className={`${walletConfig.widgetFontSize}`} value={calcPnLPerc(walletData?.startingBalance, walletData?.currentBalance)} format={{ style: 'percent', maximumFractionDigits: 2, signDisplay: 'always' }}/>
                                        </div>
                                    )}
                                    {parseFloat(walletData?.currentBalance).toFixed(2) !== parseFloat(walletData?.pnl).toFixed(2) && walletData?.pnl > 0 && (
                                        <div className="flex justify-center items-center text-xs font-medium text-shadow bg-green-100 text-green-800 mt-2 px-4 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
                                            <NumberFlow className={`${walletConfig.widgetFontSize}`} value={calcPnLPerc(walletData?.startingBalance, walletData?.currentBalance)} format={{ style: 'percent', maximumFractionDigits: 2, signDisplay: 'always' }}/>
                                        </div>
                                    )}
                                </div>
                                {walletConfig.showWeekPnl && (
                                    <div className={`flex flex-col justify-center items-center text-9xl ${walletConfig.widgetPaddingSize} ${walletData?.weekPnl > 0 ? 'text-emerald-500' : walletData?.weekPnl < 0 ? 'text-red-500' : 'text-white'}`}>
                                        <div className={`${walletConfig.widgetFontSize} text-center uppercase text-gray-500 tracking-wider text-shadow-sm mb-2`}>WEEKLY</div>
                                        <div className="flex justify-center items-center text-4xl font-bold text-shadow">
                                            <div style={{ '--number-flow-char-height': '0.85em' }} className="flex items-center gap-4 font-semibold">
                                                {walletData?.weekPnl > 0 ? "+" : ""}<NumberFlow value={walletData?.weekPnl} trend={0} format={{ notation: "compact", maximumFractionDigits: 2 }}/>
                                                <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="SOL" className="w-6 h-6 filter drop-shadow"/>
                                            </div>
                                        </div>
                                        {parseFloat(walletData?.currentBalance).toFixed(2) !== parseFloat(walletData?.weekPnl).toFixed(2) && walletData?.weekPnl < 0 && (
                                            <div className="flex justify-center items-center text-xs font-medium text-shadow bg-red-100 text-red-800 mt-2 px-4 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300">
                                                <NumberFlow className={`${walletConfig.widgetFontSize}`} value={calcPnLPerc(walletData?.weekStartBalance, walletData?.currentBalance)} format={{ style: 'percent', maximumFractionDigits: 2, signDisplay: 'always' }}/>
                                            </div>
                                        )}
                                        {parseFloat(walletData?.currentBalance).toFixed(2) !== parseFloat(walletData?.weekPnl).toFixed(2) && walletData?.weekPnl > 0 && (
                                            <div className="flex justify-center items-center text-xs font-medium text-shadow bg-green-100 text-green-800 mt-2 px-4 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
                                                <NumberFlow className={`${walletConfig.widgetFontSize}`} value={calcPnLPerc(walletData?.weekStartBalance, walletData?.currentBalance)} format={{ style: 'percent', maximumFractionDigits: 2, signDisplay: 'always' }}/>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {walletConfig.showMonthPnl && (
                                    <div className={`flex flex-col justify-center items-center text-9xl ${walletConfig.widgetPaddingSize} ${walletData?.monthPnl > 0 ? 'text-emerald-500' : walletData?.monthPnl < 0 ? 'text-red-500' : 'text-white'}`}>
                                        <div className={`${walletConfig.widgetFontSize} text-center uppercase text-gray-500 tracking-wider text-shadow-sm mb-2`}>MONTHLY</div>
                                        <div className="flex justify-center items-center text-4xl font-bold text-shadow">
                                            <div style={{ '--number-flow-char-height': '0.85em' }} className="flex items-center gap-4 font-semibold">
                                                {walletData?.monthPnl > 0 ? "+" : ""}<NumberFlow value={walletData?.monthPnl} trend={0} format={{ notation: "compact", maximumFractionDigits: 2 }}/>
                                                <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="SOL" className="w-6 h-6 filter drop-shadow"/>
                                            </div>
                                        </div>
                                        {parseFloat(walletData?.currentBalance).toFixed(2) !== parseFloat(walletData?.monthPnl).toFixed(2) && walletData?.monthPnl < 0 && (
                                            <div className="flex justify-center items-center text-xs font-medium text-shadow bg-red-100 text-red-800 mt-2 px-4 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300">
                                                <NumberFlow className={`${walletConfig.widgetFontSize}`} value={calcPnLPerc(walletData?.monthStartBalance, walletData?.currentBalance)} format={{ style: 'percent', maximumFractionDigits: 2, signDisplay: 'always' }}/>
                                            </div>
                                        )}
                                        {parseFloat(walletData?.currentBalance).toFixed(2) !== parseFloat(walletData?.monthPnl).toFixed(2) && walletData?.monthPnl > 0 && (
                                            <div className="flex justify-center items-center text-xs font-medium text-shadow bg-green-100 text-green-800 mt-2 px-4 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
                                                <NumberFlow className={`${walletConfig.widgetFontSize}`} value={calcPnLPerc(walletData?.monthStartBalance, walletData?.currentBalance)} format={{ style: 'percent', maximumFractionDigits: 2, signDisplay: 'always' }}/>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </AnimatedBorderTrail>
                    </div>
                    {/* Conditionally render Chart3D with fade effects */}
                    {walletConfig.chartEnabled && renderChartData && (
                        <div className={`fixed top-0 left-0 w-screen h-screen bg-[#0a0a0a] bg-opacity-90 transition-opacity duration-1000 ${ isChartVisible ? "opacity-100" : "opacity-0"}`}>
                            <Chart3D data={tradeData} />
                        </div>
                    )}
                </NumberFlowGroup>
            ) : (
                <></>
            )}
        </>
    );
}