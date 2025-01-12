import prisma from '/lib/prisma.ts';

async function checkDbAndUpdateWeek(wallet, newWeekStartDate, newWeekStartBalance, newMonthStartDate, newMonthStartBalance) {
    try {
        // Test the Prisma DB connection
        await prisma.$connect();

        // Check if the wallet entry exists by its primary key (wallet)
        const walletData = await prisma.UserData.findUnique({
            where: { wallet: wallet } // Using the wallet as the primary key
        });

        // If wallet entry exists, update the weekStartDate
        if (walletData) {
            await prisma.UserData.update({
                where: { wallet: wallet }, // Primary key to find the entry
                data: {
                    weekStartDate: newWeekStartDate, // Update week_start_date
                    weekStartBalance: newWeekStartBalance // Update week_start_balance
                }
            });
        } else {
            // If wallet entry doesn't exist, create a new entry with the provided data
            await prisma.UserData.create({
                data: {
                    wallet: wallet, // Wallet identifier
                    weekStartDate: newWeekStartDate, // Set initial week_start_date
                    weekStartBalance: newWeekStartBalance, // Set initial week_start_balance
                    monthStartDate: newMonthStartDate, // Set initial month_start_date
                    monthStartBalance: newMonthStartBalance // Set initial month_start_balance
                }
            });
        }
    } catch (error) {
        console.error('Error updating week:', error);
        throw error;
    }
}

async function checkDbAndUpdateMonth(wallet, newWeekStartDate, newWeekStartBalance, newMonthStartDate, newMonthStartBalance) {
    try {
        // Test the Prisma DB connection
        await prisma.$connect();

        // Check if the wallet entry exists by its primary key (wallet)
        const walletData = await prisma.UserData.findUnique({
            where: { wallet: wallet } // Using the wallet as the primary key
        });

        // If wallet entry exists, update the weekStartDate
        if (walletData) {
            await prisma.UserData.update({
                where: { wallet: wallet }, // Primary key to find the entry
                data: {
                    monthStartDate: newMonthStartDate, // Update week_start_date
                    monthStartBalance: newMonthStartBalance // Update week_start_balance
                }
            });
        } else {
            // If wallet entry doesn't exist, create a new entry with the provided data
            await prisma.UserData.create({
                data: {
                    wallet: wallet, // Wallet identifier
                    weekStartDate: newWeekStartDate, // Set initial week_start_date
                    weekStartBalance: newWeekStartBalance, // Set initial week_start_balance
                    monthStartDate: newMonthStartDate, // Set initial month_start_date
                    monthStartBalance: newMonthStartBalance // Set initial month_start_balance
                }
            });
        }
    } catch (error) {
        console.error('Error updating month:', error);
        throw error;
    }
}

// Export both functions as part of a default object
export default { checkDbAndUpdateWeek, checkDbAndUpdateMonth };