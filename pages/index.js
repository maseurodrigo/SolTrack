import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { NextUIProvider } from "@nextui-org/react";
import { motion } from "motion/react";
import Head from 'next/head';

import WalletTracker from "./components/WalletTracker";

export default function Home() {
  useEffect(() => {
    document.body.style.backgroundColor = "#282c34";
    document.body.style.color = "#ffffff";
    document.body.style.height = "100vh";
    document.body.style.textAlign = "center";
  }, []); // Empty dependency array ensures this runs once when the component mounts
  
  return (
    <NextUIProvider>
      <Head>
        <html lang="en"/>
        <title>SolTrack</title>
        <meta property="og:title" content="SolTrack" key="title"/>
        <meta name="description" content="Web tool to track Solana wallet balances and PnL"/>
      </Head>
      <Toaster position="top-center"/>
      <motion.div className="box">
        <WalletTracker/>
      </motion.div>
    </NextUIProvider>
  );
}