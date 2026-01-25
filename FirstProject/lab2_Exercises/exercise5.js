const fs = require('fs');
const _ = require('lodash');

console.log("=== LOG ANALYSIS START ===");

try {
    // Read the log file
    const logData = fs.readFileSync('log.txt', 'utf8');
    const lines = logData.split('\n').filter(line => line.trim() !== '');

    console.log(`Read ${lines.length} lines from log.txt`);

    // Parse lines to extract log level/type pattern
    // Assuming format: [DATE] MESSAGE or [DATE] LEVEL: MESSAGE
    // Let's infer types based on keywords if explicit level isn't there
    const parsedLogs = lines.map(line => {
        if (line.includes('Error')) return { type: 'ERROR', message: line };
        if (line.includes('Warning')) return { type: 'WARNING', message: line };
        if (line.includes('API request')) return { type: 'API', message: line };
        if (line.includes('User')) return { type: 'USER', message: line };
        if (line.includes('Database')) return { type: 'DB', message: line };
        return { type: 'INFO', message: line };
    });

    // Use lodash to count by type
    const typeCounts = _.countBy(parsedLogs, 'type');

    console.log("\nSummary by Type (using lodash):");
    console.log(typeCounts);

    // Use lodash to find specific items, e.g., reversed list of API requests
    const apiRequests = _.chain(parsedLogs)
        .filter(log => log.type === 'API')
        .map(log => log.message)
        .reverse()
        .value();

    console.log("\nRecent API Requests (Last 5):");
    apiRequests.slice(0, 5).forEach(req => console.log(req));

    console.log("\n=== LOG ANALYSIS COMPLETE ===");

} catch (err) {
    console.error("Error reading or processing file:", err);
}
