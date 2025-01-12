import prisma from '/lib/prisma.ts';

export default async function checkDbAndGetWallet(wallet) {
  try {
    // Test the Prisma DB connection
    await prisma.$connect();

    // Find the record by wallet (primary key)
    const walletData = await prisma.userdata.findUnique({
      where: { wallet: wallet }, // The wallet parameter passed to the function
      select: {
        week_start_date: true,
        week_start_balance: true,
        month_start_date: true,
        month_start_balance: true
      }
    });

    // Disconnect after querying
    await prisma.$disconnect();

    // If no record is found, handle it
    if (!walletData) { return null; }

    // Return the selected fields
    return walletData;
  } catch (error) {
    await prisma.$disconnect(); // Ensure disconnection on error
    return null;
  }
}