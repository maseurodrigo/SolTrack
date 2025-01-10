import { useEffect } from "react";
import './globals.css'; // These styles apply to every route in the application

export default function App({ Component, pageProps }) {
  useEffect(() => {
    document.body.style.fontFamily = "monaco, Consolas, Lucida Console, monospace";
  }, []);
  
  return <Component {...pageProps} />;
}