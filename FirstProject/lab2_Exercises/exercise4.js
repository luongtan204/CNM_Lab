// Exercise 4: Log File Analyzer
const fs = require('fs');
const chalk = require('chalk');

console.log(chalk.bold.cyan("=== EXERCISE 4: LOG ANALYZER ===\n"));

try {
    // Step 1: Read log. txt
    console.log(chalk.blue(" Reading log.txt..."));
    const logContent = fs.readFileSync('log.txt', 'utf8');

    // Step 2: Count lines
    const lines = logContent.trim().split('\n');
    const lineCount = lines.length;

    console.log(chalk.green(` Found ${lineCount} lines\n`));

    // Step 3: Additional analysis
    const errors = lines.filter(line => line.includes('Error')).length;
    const apiRequests = lines.filter(line => line.includes('API request')).length;

    // Step 4: Create report
    const report = `LOG FILE ANALYSIS REPORT
========================
Generated: ${new Date().toLocaleString()}
Source File: log.txt

STATISTICS:
-----------
Total Lines: ${lineCount}
Error Lines: ${errors}
API Requests: ${apiRequests}

DETAILED LOG:
-------------
${lines.map((line, index) => `Line ${index + 1}: ${line}`).join('\n')}

END OF REPORT
========================
`;

    // Step 5: Write to report.txt
    console.log(chalk.blue(" Writing to report.txt..."));
    fs.writeFileSync('report.txt', report, 'utf8');
    
    // Step 6: Display summary
    console.log(chalk.green. bold("\n SUCCESS: Report created!\n"));
    console.log(chalk.yellow(" SUMMARY:"));
    console.log(chalk.white(`   Total Lines: ${lineCount}`));
    console.log(chalk.red(`   Errors: ${errors}`));
    console.log(chalk.cyan(`   API Requests: ${apiRequests}`));
    console.log(chalk.gray(`\n Report saved to: report.txt`));
    
} catch (error) {
    console.log(chalk.red.bold(`\n ERROR: ${error.message}`));
}