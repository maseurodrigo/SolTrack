import { isValidSolanaAddress } from "../../utils/validation";
import { getSolBalance } from "../../utils/solana";

let userData = {};

export default async function handler(req, res) {
  const { wallet } = req.query;

  if (!wallet || !isValidSolanaAddress(wallet)) {
    return res.status(400).json({ error: "Valid wallet address is required" });
  }

  if (!userData[wallet]) {
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
  if (!data.weekStartDate || data.weekStartDate.toDateString() !== startOfWeek.toDateString()) {
    data.weekStartDate = startOfWeek;
    data.weekStartBalance = currentBalance;
  }
  
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  if (!data.monthStartDate || data.monthStartDate.toDateString() !== startOfMonth.toDateString()) {
    data.monthStartDate = startOfMonth;
    data.monthStartBalance = currentBalance;
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