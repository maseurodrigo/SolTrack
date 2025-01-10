import { React, useEffect, useState } from "react";
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/router';
import NumberFlow, { NumberFlowGroup } from '@number-flow/react';

import AnimatedBorderTrail from './animata/container/animated-border-trail.tsx';

export default function WalletDetails() {
    const router = useRouter();
    const [locWalletAddress, setLocWalletAddress] = useState(""); // State for wallet address input
    const [walletData, setWalletData] = useState(null);
    const [walletConfig, setWalletConfig] = useState(null);

    useEffect(() => {
        if (router.isReady) {
            const { walletAddress, showWeekPnl, showMonthPnl, platSelected } = router.query;
            setLocWalletAddress(walletAddress); // Set the wallet address from URL

            if (walletAddress) {
                // Convert query parameters to the proper data structure
                setWalletConfig({
                    showWeekPnl: showWeekPnl?.toLowerCase() === 'true', // Convert to boolean
                    showMonthPnl: showMonthPnl?.toLowerCase() === 'true', // Convert to boolean
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

    const calcPnLPerc = (num1, num2) => {
        if (num1 && num2 !== undefined) {

            // Handle edge case where starting value is 0
            if (parseFloat(num1) === 0) {
                return parseFloat(num2) === 0 ? 0 : (value2 > 0 ? Infinity : -Infinity);
            }

            // No currentBalance cases
            if (parseFloat(num2) === 0) { return -1; }

            // Calculate relative difference, rounded to 2 decimals
            return (((parseFloat(num2) - parseFloat(num1)) / Math.abs(parseFloat(num1)))).toFixed(2);
        } else {
            return 0;
        }
    };
    
    return (
        <>
            {walletConfig && walletData ? (
                <NumberFlowGroup>
                    <div className="flex justify-center items-center mt-12">
                        <AnimatedBorderTrail trailSize="lg" trailColor={walletData?.pnl < 0 ? "red" : walletData?.pnl > 0 ? "green" : "white"}>
                            <div className="flex justify-center items-center bg-[#1F2029] text-white max-w-fit px-4 rounded-lg shadow-2xl">
                                {walletConfig.platSelected && walletConfig.platSelected !== "noplat" && (
                                    <div className="flex justify-center items-center text-shadow">
                                        <img src={`/${walletConfig.platSelected}.png`} alt={walletConfig.platSelected} className="w-auto h-auto max-w-32 max-h-32 filter drop-shadow-xl"/>
                                    </div>
                                )}
                                <div className="text-9xl p-12">
                                    <div className="text-sm uppercase text-gray-500 tracking-wider text-shadow-sm mb-2">BALANCE</div>
                                    <div className="flex justify-center items-center text-4xl font-bold text-shadow">
                                        <NumberFlow value={walletData.currentBalance} trend={0} format={{ notation: "compact", maximumFractionDigits: 2 }}/>
                                        <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="SOL" className="w-6 h-6 ml-4 filter drop-shadow"/>
                                    </div>
                                </div>
                                <div className={`flex flex-col justify-center items-center text-9xl p-12 ${walletData?.pnl > 0 ? 'text-emerald-500' : walletData?.pnl < 0 ? 'text-red-500' : 'text-white'}`}>
                                    <div className="text-sm uppercase text-gray-500 tracking-wider text-shadow-sm mb-2">TODAY PNL</div>
                                    <div className="flex justify-center items-center text-4xl font-bold text-shadow">
                                        <div style={{ '--number-flow-char-height': '0.85em' }} className="flex items-center gap-4 font-semibold">
                                            {walletData?.pnl > 0 ? "+" : ""}<NumberFlow value={walletData?.pnl} trend={0} format={{ notation: "compact", maximumFractionDigits: 2 }}/>
                                            <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="SOL" className="w-6 h-6 filter drop-shadow"/>
                                        </div>
                                    </div>
                                    {parseFloat(walletData?.currentBalance).toFixed(2) !== parseFloat(walletData?.pnl).toFixed(2) && walletData?.pnl < 0 && (
                                        <div className="flex justify-center items-center text-xs font-medium text-shadow bg-red-100 text-red-800 mt-2 px-4 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300">
                                            <NumberFlow value={calcPnLPerc(walletData?.startingBalance, walletData?.currentBalance)} format={{ style: 'percent', maximumFractionDigits: 2, signDisplay: 'always' }}/>
                                        </div>
                                    )}
                                    {parseFloat(walletData?.currentBalance).toFixed(2) !== parseFloat(walletData?.pnl).toFixed(2) && walletData?.pnl > 0 && (
                                        <div className="flex justify-center items-center text-xs font-medium text-shadow bg-green-100 text-green-800 mt-2 px-4 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
                                            <NumberFlow value={calcPnLPerc(walletData?.startingBalance, walletData?.currentBalance)} format={{ style: 'percent', maximumFractionDigits: 2, signDisplay: 'always' }}/>
                                        </div>
                                    )}
                                </div>
                                {walletConfig.showWeekPnl && (
                                    <div className={`flex flex-col justify-center items-center text-9xl p-12 ${walletData?.weekPnl > 0 ? 'text-emerald-500' : walletData?.weekPnl < 0 ? 'text-red-500' : 'text-white'}`}>
                                        <div className="text-sm uppercase text-gray-500 tracking-wider text-shadow-sm mb-2">WEEKLY PNL</div>
                                        <div className="flex justify-center items-center text-4xl font-bold text-shadow">
                                            <div style={{ '--number-flow-char-height': '0.85em' }} className="flex items-center gap-4 font-semibold">
                                                {walletData?.weekPnl > 0 ? "+" : ""}<NumberFlow value={walletData?.weekPnl} trend={0} format={{ notation: "compact", maximumFractionDigits: 2 }}/>
                                                <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="SOL" className="w-6 h-6 filter drop-shadow"/>
                                            </div>
                                        </div>
                                        {parseFloat(walletData?.currentBalance).toFixed(2) !== parseFloat(walletData?.weekPnl).toFixed(2) && walletData?.weekPnl < 0 && (
                                            <div className="flex justify-center items-center text-xs font-medium text-shadow bg-red-100 text-red-800 mt-2 px-4 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300">
                                                <NumberFlow value={calcPnLPerc(walletData?.weekStartBalance, walletData?.currentBalance)} format={{ style: 'percent', maximumFractionDigits: 2, signDisplay: 'always' }}/>
                                            </div>
                                        )}
                                        {parseFloat(walletData?.currentBalance).toFixed(2) !== parseFloat(walletData?.weekPnl).toFixed(2) && walletData?.weekPnl > 0 && (
                                            <div className="flex justify-center items-center text-xs font-medium text-shadow bg-green-100 text-green-800 mt-2 px-4 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
                                                <NumberFlow value={calcPnLPerc(walletData?.weekStartBalance, walletData?.currentBalance)} format={{ style: 'percent', maximumFractionDigits: 2, signDisplay: 'always' }}/>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {walletConfig.showMonthPnl && (
                                    <div className={`flex flex-col justify-center items-center text-9xl p-12 ${walletData?.monthPnl > 0 ? 'text-emerald-500' : walletData?.monthPnl < 0 ? 'text-red-500' : 'text-white'}`}>
                                        <div className="text-sm uppercase text-gray-500 tracking-wider text-shadow-sm mb-2">MONTHLY PNL</div>
                                        <div className="flex justify-center items-center text-4xl font-bold text-shadow">
                                            <div style={{ '--number-flow-char-height': '0.85em' }} className="flex items-center gap-4 font-semibold">
                                                {walletData?.monthPnl > 0 ? "+" : ""}<NumberFlow value={walletData?.monthPnl} trend={0} format={{ notation: "compact", maximumFractionDigits: 2 }}/>
                                                <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="SOL" className="w-6 h-6 filter drop-shadow"/>
                                            </div>
                                        </div>
                                        {parseFloat(walletData?.currentBalance).toFixed(2) !== parseFloat(walletData?.monthPnl).toFixed(2) && walletData?.monthPnl < 0 && (
                                            <div className="flex justify-center items-center text-xs font-medium text-shadow bg-red-100 text-red-800 mt-2 px-4 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300">
                                                <NumberFlow value={calcPnLPerc(walletData?.monthStartBalance, walletData?.currentBalance)} format={{ style: 'percent', maximumFractionDigits: 2, signDisplay: 'always' }}/>
                                            </div>
                                        )}
                                        {parseFloat(walletData?.currentBalance).toFixed(2) !== parseFloat(walletData?.monthPnl).toFixed(2) && walletData?.monthPnl > 0 && (
                                            <div className="flex justify-center items-center text-xs font-medium text-shadow bg-green-100 text-green-800 mt-2 px-4 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
                                                <NumberFlow value={calcPnLPerc(walletData?.monthStartBalance, walletData?.currentBalance)} format={{ style: 'percent', maximumFractionDigits: 2, signDisplay: 'always' }}/>
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