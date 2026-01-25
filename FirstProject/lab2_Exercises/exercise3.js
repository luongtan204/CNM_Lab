const fs = require('fs');
const chalk = require('chalk');

console.log(chalk.bold.cyan("=== EXERCISE 3: COLORED OUTPUT ===\n"));


console.log(chalk.green(" This is a SUCCESS message in GREEN"));


console.log(chalk.red(" This is an ERROR message in RED"));

console.log("\n--- File Operations with Colors ---\n");


try {
    console.log(chalk.blue("Reading data.txt..."));
    const data = fs.readFileSync('data.txt', 'utf8');

    console.log(chalk.green.bold("SUCCESS: File read successfully! "));
    console.log(chalk.gray("Content:"));
    console.log(chalk.white(data));

} catch (error) {
    console.log(chalk.red.bold(" ERROR: Failed to read file"));
    console.log(chalk.yellow("Details:"), error.message);
}

console.log("\n--- Testing Error (file not found) ---\n");

try {
    console.log(chalk.blue("Reading notfound.txt..."));
    const data = fs.readFileSync('notfound.txt', 'utf8');
    console.log(chalk.green(" SUCCESS"));

} catch (error) {
    console.log(chalk.red.bold(" ERROR: File not found! "));
    console.log(chalk.yellow("TIP: Make sure the file exists"));
}

console.log("\n--- Color Demo ---\n");

// Demonstration of colors
console.log(chalk.red("Red text"));
console.log(chalk.green("Green text"));
console.log(chalk.yellow("Yellow text"));
console.log(chalk.blue("Blue text"));
console.log(chalk.magenta("Magenta text"));
console.log(chalk.cyan("Cyan text"));
console.log(chalk.white("White text"));
console.log(chalk.gray("Gray text"));

console.log("\n--- Style Demo ---\n");

console.log(chalk.bold("Bold text"));
console.log(chalk.italic("Italic text"));
console.log(chalk.underline("Underlined text"));
console.log(chalk.bgGreen.black(" SUCCESS MESSAGE "));
console.log(chalk.bgRed.white(" ERROR MESSAGE "));
console.log(chalk.bgYellow.black(" WARNING MESSAGE "));