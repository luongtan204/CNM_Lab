// mathUtils.js
// Custom module for mathematical operations

/**
 * Add two numbers
 */
function add(a, b) {
    return a + b;
}

/**
 * Subtract two numbers
 */
function subtract(a, b) {
    return a - b;
}

/**
 * Multiply two numbers
 */
function multiply(a, b) {
    return a * b;
}

/**
 * Divide two numbers
 */
function divide(a, b) {
    if (b === 0) {
        return "Error: Cannot divide by zero";
    }
    return a / b;
}

/**
 * Calculate power (a^b)
 */
function power(a, b) {
    return Math.pow(a, b);
}

/**
 * Calculate square root
 */
function sqrt(a) {
    if (a < 0) {
        return "Error: Cannot calculate square root of negative number";
    }
    return Math.sqrt(a);
}

// Export all functions
module.exports = {
    add,
    subtract,
    multiply,
    divide,
    power,
    sqrt
};