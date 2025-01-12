import prisma from '/lib/prisma.ts';

async function checkDbAndUpdateWeek(wallet, newWeekStartDate, newWeekStartBalance, newMonthStartDate, newMonthStartBalance) {
    try {
        // Test the Prisma DB connection
        await prisma.$connect();

        // Check if the wallet entry exists by its primary key (wallet)
        const walletData = await prisma.userdata.findUnique({
            where: { wallet: wallet } // Using the wallet as the primary key
        });

        // If wallet entry exists, update the weekStartDate
        if (walletData) {
            await prisma.userdata.update({
                where: { wallet: wallet }, // Primary key to find the entry
                data: {
                    week_start_date: newWeekStartDate, // Update week_start_date
                    week_start_balance: newWeekStartBalance // Update week_start_balance
                }
            });
        } else {
            // If wallet entry doesn't exist, create a new entry with the provided data
            await prisma.userdata.create({
                data: {
                    wallet: wallet, // Wallet identifier
                    week_start_date: newWeekStartDate, // Set initial week_start_date
                    week_start_balance: newWeekStartBalance, // Set initial week_start_balance
                    month_start_date: newMonthStartDate, // Set initial month_start_date
                    month_start_balance: newMonthStartBalance // Set initial month_start_balance
                }
            });
        }
    } catch (error) {
        console.log(error);
    }
}

async function checkDbAndUpdateMonth(wallet, newWeekStartDate, newWeekStartBalance, newMonthStartDate, newMonthStartBalance) {
    try {
        // Test the Prisma DB connection
        await prisma.$connect();

        // Check if the wallet entry exists by its primary key (wallet)
        const walletData = await prisma.userdata.findUnique({
            where: { wallet: wallet } // Using the wallet as the primary key
        });

        // If wallet entry exists, update the weekStartDate
        if (walletData) {
            await prisma.userdata.update({
                where: { wallet: wallet }, // Primary key to find the entry
                data: {
                    month_start_date: newMonthStartDate, // Update week_start_date
                    month_start_balance: newMonthStartBalance // Update week_start_balance
                }
            });
        } else {
            // If wallet entry doesn't exist, create a new entry with the provided data
            await prisma.userdata.create({
                data: {
                    wallet: wallet, // Wallet identifier
                    week_start_date: newWeekStartDate, // Set initial week_start_date
                    week_start_balance: newWeekStartBalance, // Set initial week_start_balance
                    month_start_date: newMonthStartDate, // Set initial month_start_date
                    month_start_balance: newMonthStartBalance // Set initial month_start_balance
                }
            });
        }
    } catch (error) {
        console.log(error);
    }
}

// Export both functions as part of a default object
export default { checkDbAndUpdateWeek, checkDbAndUpdateMonth };