/**
 * Calculates the percentage difference between two numbers
 * @param {number} num1 - The initial value
 * @param {number} num2 - The final value
 * @returns {number} - The percentage difference rounded to 2 decimals, or special cases like Infinity or -1
*/

export const calcPnLPerc = (num1, num2) => {
    if (num1 && num2 !== undefined) {
        // Handle edge case where starting value is 0
        if (parseFloat(num1) === 0) {
            return parseFloat(num2) === 0 ? 0 : (parseFloat(num2) > 0 ? Infinity : -Infinity);
        }

        // No currentBalance cases
        if (parseFloat(num2) === 0) { return -1; }

        // Calculate relative difference, rounded to 2 decimals
        return (((parseFloat(num2) - parseFloat(num1)) / Math.abs(parseFloat(num1)))).toFixed(2);
    } else {
        return 0;
    }
};