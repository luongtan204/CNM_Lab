const mathUtils = require("./mathUtils");
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function showMenu() {
    console.log("\n=== MATH CALCULATOR ===");
    console.log("1. Add");
    console.log("2. Subtract");
    console.log("3. Multiply");
    console.log("4. Divide");
    console.log("5. Power");
    console.log("0. Exit");

    rl.question("\nEnter your choice:  ", (choice) => {
        if (choice === '0') {
            console.log("Goodbye!");
            rl.close();
            return;
        }

        rl.question("Enter first number: ", (num1) => {
            rl.question("Enter second number: ", (num2) => {
                const a = parseFloat(num1);
                const b = parseFloat(num2);
                let result;

                switch (choice) {
                    case '1':
                        result = mathUtils.add(a, b);
                        console.log(`\n${a} + ${b} = ${result}`);
                        break;
                    case '2':
                        result = mathUtils.subtract(a, b);
                        console.log(`\n${a} - ${b} = ${result}`);
                        break;
                    case '3':
                        result = mathUtils.multiply(a, b);
                        console.log(`\n${a} × ${b} = ${result}`);
                        break;
                    case '4':
                        result = mathUtils.divide(a, b);
                        console.log(`\n${a} ÷ ${b} = ${result}`);
                        break;
                    case '5':
                        result = mathUtils.power(a, b);
                        console.log(`\n${a} ^ ${b} = ${result}`);
                        break;
                    default:
                        console.log("\nInvalid choice!");
                }

                // Quay lại menu
                showMenu();
            });
        });
    });
}

// Bắt đầu chương trình
showMenu();