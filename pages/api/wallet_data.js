import { isValidSolanaAddress } from "../../utils/validation";
import { getSolBalance } from "../../utils/solana";
import checkDbAndGetWallet from './db/GetWallet';
import updtWalletFuncs from './db/UpdateWallet';

let userData = {};

export default async function handler(req, res) {
  const { wallet } = req.query;

  if (!wallet || !isValidSolanaAddress(wallet)) {
    return res.status(400).json({ error: "Valid wallet address is required" });
  }
  
  if (!userData[wallet]) {
    try {
      // Fetch wallet data from the database
      const walletData = await checkDbAndGetWallet(wallet);

      // If wallet data is not found, initialize with default values
      if (!walletData) {
        userData[wallet] = {
          startingDate: "",
          startingBalance: 0,
          weekStartDate: "",
          weekStartBalance: 0,
          monthStartDate: "",
          monthStartBalance: 0,
          currentBalance: 0,
          pnl: 0,
          weekPnl: 0,
          monthPnl: 0
        };
      } else {
        // If wallet data is found, use fetched values
        userData[wallet] = {
          startingDate: "",
          startingBalance: 0,
          weekStartDate: walletData.weekStartDate,
          weekStartBalance: walletData.weekStartBalance,
          monthStartDate: walletData.monthStartDate,
          monthStartBalance: walletData.monthStartBalance,
          currentBalance: 0,
          pnl: 0,
          weekPnl: 0,
          monthPnl: 0
        };
      }
    } catch (error) { 
      // In case of error, set userData with default values
      userData[wallet] = {
        startingDate: "",
        startingBalance: 0,
        weekStartDate: "",
        weekStartBalance: 0,
        monthStartDate: "",
        monthStartBalance: 0,
        currentBalance: 0,
        pnl: 0,
        weekPnl: 0,
        monthPnl: 0
      };
    }
  }

  const currentBalance = await getSolBalance(wallet);
  const data = userData[wallet];
  const now = new Date();

  // Update daily PnL
  if (data.startingDate !== now.toDateString()) {
    data.startingDate = now.toDateString();
    data.startingBalance = currentBalance;
  }
  
  // Recalculate weekly and monthly PnL if the date changes
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  if (!data.weekStartDate || data.weekStartDate.toDateString() !== startOfWeek.toDateString()) {
    data.weekStartDate = startOfWeek;
    data.weekStartBalance = currentBalance;

    // Update the week start date and balance in the database
    await updtWalletFuncs.checkDbAndUpdateWeek(wallet, startOfWeek, currentBalance, startOfMonth, currentBalance);
  }

  if (!data.monthStartDate || data.monthStartDate.toDateString() !== startOfMonth.toDateString()) {
    data.monthStartDate = startOfMonth;
    data.monthStartBalance = currentBalance;

    // Update the month start date and balance in the database
    await updtWalletFuncs.checkDbAndUpdateMonth(wallet, startOfWeek, currentBalance, startOfMonth, currentBalance);
  }

  const pnl = +(currentBalance - data.startingBalance).toFixed(2);
  const weekPnl = +(currentBalance - data.weekStartBalance).toFixed(2);
  const monthPnl = +(currentBalance - data.monthStartBalance).toFixed(2);

  const updatedData = {
    startingDate: data.startingDate,
    startingBalance: data.startingBalance,
    weekStartDate: data.weekStartDate,
    weekStartBalance: data.weekStartBalance,
    monthStartDate: data.monthStartDate,
    monthStartBalance: data.monthStartBalance,
    currentBalance,
    pnl,
    weekPnl,
    monthPnl
  };
  
  userData[wallet] = updatedData;
  
  res.json(updatedData);
}