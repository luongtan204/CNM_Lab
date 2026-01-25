// Exercise 1: Read and Write File
const fs = require('fs');

console.log("=== EXERCISE 1: BASIC FILE OPERATIONS ===\n");

// Đọc file student.txt
try {
    // Đọc file đồng bộ (synchronous)
    const data = fs.readFileSync('student.txt', 'utf8');

    console.log("📖 Reading student.txt.. .");
    console.log("Content:");
    console.log(data);

    // Ghi vào file backup.txt
    fs.writeFileSync('backup.txt', data, 'utf8');

    console.log("\n✅ SUCCESS: File has been backed up to backup.txt");

} catch (error) {
    console.error("❌ ERROR:", error.message);
}