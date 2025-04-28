import { isValidSolanaAddress } from "/utils/validation";
import getSolanaBalance from "/utils/solana-balance/httpSolBalance";
import checkDbAndGetWallet from './db/GetWallet';
import updtWalletFuncs from './db/UpdateWallet';

let userData = {};

export default async function handler(req, res) {
  const { wallet, currentBalance, resetPNL } = req.query;
  let localBalance = currentBalance === 'null' ? undefined : parseFloat(currentBalance);
  
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

  // Check if localBalance is not a valid number, then fetch balance from Solana mainnet
  if (isNaN(localBalance)) { localBalance = await getSolanaBalance(wallet); }

  const data = userData[wallet];

  // Reset PnL to zero if option is active
  if(resetPNL === 'true') { data.startingBalance = localBalance; }
  
  const now = new Date();

  // Update daily PnL
  if (data.startingDate !== now.toDateString()) {
    data.startingDate = now.toDateString();
    data.startingBalance = localBalance;
  }

  // Removes the time component from the date object
  function normalizeDate(date) { return new Date(date.getFullYear(), date.getMonth(), date.getDate()); }

  // Recalculate weekly and monthly PnL if the date changes
  const startOfWeek = new Date(now.setDate(now.getDate() - ((now.getDay() + 6) % 7)));
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const dataWeekStart = data.weekStartDate ? normalizeDate(new Date(data.weekStartDate)) : null;
  
  if (!dataWeekStart || dataWeekStart.getTime() !== normalizeDate(startOfWeek).getTime()) {
    data.weekStartDate = normalizeDate(startOfWeek).getTime();
    data.weekStartBalance = localBalance;

    // Update the week start date and balance in the database
    await updtWalletFuncs.checkDbAndUpdateWeek(wallet, startOfWeek, localBalance, startOfMonth, localBalance);
  }

  if (!data.monthStartDate || data.monthStartDate.toDateString() !== startOfMonth.toDateString()) {
    data.monthStartDate = startOfMonth;
    data.monthStartBalance = localBalance;

    // Update the month start date and balance in the database
    await updtWalletFuncs.checkDbAndUpdateMonth(wallet, startOfWeek, localBalance, startOfMonth, localBalance);
  }
  
  const pnl = +(localBalance - data.startingBalance).toFixed(2);
  const weekPnl = +(localBalance - data.weekStartBalance).toFixed(2);
  const monthPnl = +(localBalance - data.monthStartBalance).toFixed(2);

  const updatedData = {
    startingDate: data.startingDate,
    startingBalance: data.startingBalance,
    weekStartDate: data.weekStartDate,
    weekStartBalance: data.weekStartBalance,
    monthStartDate: data.monthStartDate,
    monthStartBalance: data.monthStartBalance,
    currentBalance: localBalance,
    pnl,
    weekPnl,
    monthPnl
  };
  
  userData[wallet] = updatedData;
  
  res.json(updatedData);
}