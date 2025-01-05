import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import Head from 'next/head'

import WalletTracker from "./components/WalletTracker";

export default function Home() {
  useEffect(() => {
    document.body.style.fontFamily = "monaco, Consolas, Lucida Console, monospace";
    document.body.style.backgroundColor = "#282c34";
    document.body.style.color = "#ffffff";
    document.body.style.textAlign = "center";
  }, []); // Empty dependency array ensures this runs once when the component mounts

  return (
    <>
      <Head>
        <title>SolTrack</title>
        <meta property="og:title" content="SolTrack" key="title"/>
      </Head>
      <Toaster position="top-center"/>
      <WalletTracker/>
    </>
  );
}