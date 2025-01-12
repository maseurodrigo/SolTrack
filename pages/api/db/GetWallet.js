import prisma from '/lib/prisma.ts';

export default async function checkDbAndGetWallet(wallet) {
  try {
    // Test the Prisma DB connection
    await prisma.$connect();

    // Find the record by wallet (primary key)
    const walletData = await prisma.UserData.findUnique({
      where: { wallet: wallet }, // The wallet parameter passed to the function
      select: {
        weekStartDate: true,
        weekStartBalance: true,
        monthStartDate: true,
        monthStartBalance: true
      }
    });

    // If no record is found, handle it
    if (!walletData) { return null; }

    // Return the selected fields
    return walletData;
  } catch (error) {
    return null;
  }
}