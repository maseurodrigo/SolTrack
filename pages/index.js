import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
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
      <Toaster position="top-center"/>
      <WalletTracker/>
    </>
  );
}