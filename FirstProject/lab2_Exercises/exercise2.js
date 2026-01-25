const fs = require('fs');

console.log("=== EXERCISE 2: COMMAND LINE ARGUMENTS ===\n");


console.log("All arguments:", process.argv);
console.log("\n");


const fileName = process.argv[2];

if (!fileName) {
    console.log("ERROR: Please provide a file name");
    console.log("Usage: node exercise2.js <filename>");
    console.log("Example: node exercise2.js data.txt");
    process.exit(1);
}


try {
    console.log(`Reading file: ${fileName}\n`);

    const content = fs.readFileSync(fileName, 'utf8');

    console.log("--- FILE CONTENT ---");
    console.log(content);
    console.log("--- END OF FILE ---");

    console.log(`\nSUCCESS: Read ${content.split('\n').length} lines from ${fileName}`);

} catch (error) {
    if (error.code === 'ENOENT') {
        console.log(`ERROR: File '${fileName}' not found`);
    } else {
        console.log(`ERROR: ${error.message}`);
    }
}