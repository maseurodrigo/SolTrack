import { React, useEffect, useState } from "react";
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/router';

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

    // Fallback values to 0 if data is null or undefined, and format to 2 decimal places
    const formatValue = (value) => (value !== null && value !== undefined ? value.toFixed(2) : "0.00");

    const todayPnl = formatValue(walletData?.pnl ?? 0);
    const weekPnl = formatValue(walletData?.weekPnl ?? 0);
    const monthPnl = formatValue(walletData?.monthPnl ?? 0);
  
    return (
        <>
            {walletConfig && walletData ? (
                <div className="flex justify-center items-center mt-12">
                    {todayPnl < 0 && ( 
                        <AnimatedBorderTrail trailSize="lg" trailColor="red"> 
                            <div className="flex justify-center items-center bg-[#1F2029] text-white max-w-fit px-4 rounded-lg shadow-2xl">
                                {walletConfig.platSelected && walletConfig.platSelected !== 'noplat' && (
                                    <div className="flex justify-center items-center text-shadow">
                                        <img
                                            src={`/${walletConfig.platSelected}.png`}
                                            alt={walletConfig.platSelected}
                                            className="w-auto h-auto max-w-32 max-h-32 filter drop-shadow-xl"/>
                                    </div>
                                )}
                                <div className="text-9xl p-12">
                                    <div className="text-sm uppercase text-gray-500 tracking-wider text-shadow-sm mb-2">BALANCE</div>
                                    <div className="flex justify-center items-center text-4xl font-bold text-shadow">
                                        {formatValue(walletData.currentBalance)} <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="SOL" className="w-6 h-6 ml-4 filter drop-shadow" />
                                    </div>
                                </div>
                                <div className={`text-9xl p-12 ${todayPnl > 0 ? 'text-green-500' : todayPnl < 0 ? 'text-red-500' : 'text-white'}`}>
                                    <div className="text-sm uppercase text-gray-500 tracking-wider text-shadow-sm mb-2">TODAY PNL</div>
                                    <div className="flex justify-center items-center text-4xl font-bold text-shadow">
                                        {todayPnl > 0 ? '+' : ''}{todayPnl} <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="SOL" className="w-6 h-6 ml-4 filter drop-shadow" />
                                    </div>
                                </div>
                                {walletConfig.showWeekPnl && (
                                    <div className={`text-9xl p-12 ${weekPnl > 0 ? 'text-green-500' : weekPnl < 0 ? 'text-red-500' : 'text-white'}`}>
                                        <div className="text-sm uppercase text-gray-500 tracking-wider text-shadow-sm mb-2">WEEKLY</div>
                                        <div className="flex justify-center items-center text-4xl font-bold text-shadow">
                                            {weekPnl > 0 ? '+' : ''}{weekPnl} <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="SOL" className="w-6 h-6 ml-4 filter drop-shadow" />
                                        </div>
                                    </div>
                                )}
                                {walletConfig.showMonthPnl && (
                                    <div className={`text-9xl p-12 ${monthPnl > 0 ? 'text-green-500' : monthPnl < 0 ? 'text-red-500' : 'text-white'}`}>
                                        <div className="text-sm uppercase text-gray-500 tracking-wider text-shadow-sm mb-2">MONTHLY</div>
                                        <div className="flex justify-center items-center text-4xl font-bold text-shadow">
                                            {monthPnl > 0 ? '+' : ''}{monthPnl} <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="SOL" className="w-6 h-6 ml-4 filter drop-shadow" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </AnimatedBorderTrail>
                    )}
                    {todayPnl > 0 && ( 
                        <AnimatedBorderTrail trailSize="lg" trailColor="green"> 
                            <div className="flex justify-center items-center bg-[#1F2029] text-white max-w-fit px-4 rounded-lg shadow-2xl">
                                {walletConfig.platSelected && walletConfig.platSelected !== 'noplat' && (
                                    <div className="flex justify-center items-center text-shadow">
                                        <img
                                            src={`/${walletConfig.platSelected}.png`}
                                            alt={walletConfig.platSelected}
                                            className="w-auto h-auto max-w-32 max-h-32 filter drop-shadow-xl"/>
                                    </div>
                                )}
                                <div className="text-9xl p-12">
                                    <div className="text-sm uppercase text-gray-500 tracking-wider text-shadow-sm mb-2">BALANCE</div>
                                    <div className="flex justify-center items-center text-4xl font-bold text-shadow">
                                        {formatValue(walletData.currentBalance)} <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="SOL" className="w-6 h-6 ml-4 filter drop-shadow" />
                                    </div>
                                </div>
                                <div className={`text-9xl p-12 ${todayPnl > 0 ? 'text-green-500' : todayPnl < 0 ? 'text-red-500' : 'text-white'}`}>
                                    <div className="text-sm uppercase text-gray-500 tracking-wider text-shadow-sm mb-2">TODAY PNL</div>
                                    <div className="flex justify-center items-center text-4xl font-bold text-shadow">
                                        {todayPnl > 0 ? '+' : ''}{todayPnl} <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="SOL" className="w-6 h-6 ml-4 filter drop-shadow" />
                                    </div>
                                </div>
                                {walletConfig.showWeekPnl && (
                                    <div className={`text-9xl p-12 ${weekPnl > 0 ? 'text-green-500' : weekPnl < 0 ? 'text-red-500' : 'text-white'}`}>
                                        <div className="text-sm uppercase text-gray-500 tracking-wider text-shadow-sm mb-2">WEEKLY</div>
                                        <div className="flex justify-center items-center text-4xl font-bold text-shadow">
                                            {weekPnl > 0 ? '+' : ''}{weekPnl} <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="SOL" className="w-6 h-6 ml-4 filter drop-shadow" />
                                        </div>
                                    </div>
                                )}
                                {walletConfig.showMonthPnl && (
                                    <div className={`text-9xl p-12 ${monthPnl > 0 ? 'text-green-500' : monthPnl < 0 ? 'text-red-500' : 'text-white'}`}>
                                        <div className="text-sm uppercase text-gray-500 tracking-wider text-shadow-sm mb-2">MONTHLY</div>
                                        <div className="flex justify-center items-center text-4xl font-bold text-shadow">
                                            {monthPnl > 0 ? '+' : ''}{monthPnl} <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="SOL" className="w-6 h-6 ml-4 filter drop-shadow" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </AnimatedBorderTrail>
                    )}
                    {!(todayPnl < 0 || todayPnl > 0) && ( 
                        <div className="flex justify-center items-center bg-[#1F2029] text-white max-w-fit px-4 rounded-lg shadow-2xl">
                            {walletConfig.platSelected && walletConfig.platSelected !== 'noplat' && (
                                <div className="flex justify-center items-center text-shadow">
                                    <img
                                        src={`/${walletConfig.platSelected}.png`}
                                        alt={walletConfig.platSelected}
                                        className="w-auto h-auto max-w-32 max-h-32 filter drop-shadow-xl"/>
                                </div>
                            )}
                            <div className="text-9xl p-12">
                                <div className="text-sm uppercase text-gray-500 tracking-wider text-shadow-sm mb-2">BALANCE</div>
                                <div className="flex justify-center items-center text-4xl font-bold text-shadow">
                                    {formatValue(walletData.currentBalance)} <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="SOL" className="w-6 h-6 ml-4 filter drop-shadow" />
                                </div>
                            </div>
                            <div className={`text-9xl p-12 ${todayPnl > 0 ? 'text-green-500' : todayPnl < 0 ? 'text-red-500' : 'text-white'}`}>
                                <div className="text-sm uppercase text-gray-500 tracking-wider text-shadow-sm mb-2">TODAY PNL</div>
                                <div className="flex justify-center items-center text-4xl font-bold text-shadow">
                                    {todayPnl > 0 ? '+' : ''}{todayPnl} <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="SOL" className="w-6 h-6 ml-4 filter drop-shadow" />
                                </div>
                            </div>
                            {walletConfig.showWeekPnl && (
                                <div className={`text-9xl p-12 ${weekPnl > 0 ? 'text-green-500' : weekPnl < 0 ? 'text-red-500' : 'text-white'}`}>
                                    <div className="text-sm uppercase text-gray-500 tracking-wider text-shadow-sm mb-2">WEEKLY</div>
                                    <div className="flex justify-center items-center text-4xl font-bold text-shadow">
                                        {weekPnl > 0 ? '+' : ''}{weekPnl} <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="SOL" className="w-6 h-6 ml-4 filter drop-shadow" />
                                    </div>
                                </div>
                            )}
                            {walletConfig.showMonthPnl && (
                                <div className={`text-9xl p-12 ${monthPnl > 0 ? 'text-green-500' : monthPnl < 0 ? 'text-red-500' : 'text-white'}`}>
                                    <div className="text-sm uppercase text-gray-500 tracking-wider text-shadow-sm mb-2">MONTHLY</div>
                                    <div className="flex justify-center items-center text-4xl font-bold text-shadow">
                                        {monthPnl > 0 ? '+' : ''}{monthPnl} <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="SOL" className="w-6 h-6 ml-4 filter drop-shadow" />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <></>
            )}
        </>
    );
}