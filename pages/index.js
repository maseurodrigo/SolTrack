import { useEffect } from "react";
import { motion } from "motion/react";
import WalletTracker from "./components/WalletTracker";

export default function Home() {
  useEffect(() => {
    document.documentElement.style.backgroundColor = "#282c34";
    document.body.style.color = "#ffffff";
    document.body.style.textAlign = "center";
  }, []); // Empty dependency array ensures this runs once when the component mounts

  return (
    <motion.div className="box">
      <WalletTracker/>
    </motion.div>
  );
}