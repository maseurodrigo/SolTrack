import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { NextUIProvider } from "@nextui-org/react";
import Head from 'next/head';

import './globals.css'; // These styles apply to every route in the application

export default function App({ Component, pageProps }) {
  useEffect(() => {
    document.body.style.fontFamily = "monaco, Consolas, Lucida Console, monospace";
  }, []);

  return (
    <NextUIProvider>
      <Head>
        <html lang="en"/>
        <title>SolTrack</title>
        <meta property="og:title" content="SolTrack" key="title"/>
        <meta name="description" content="Web tool to track Solana wallet balances and PnL"/>
      </Head>
      {/* Toaster now globally available */}
      <Toaster position="top-center"/>
      {/* This renders the current page */}
      <Component {...pageProps} />
    </NextUIProvider>
  );
}