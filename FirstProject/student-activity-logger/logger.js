const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');

class StudentLogger extends EventEmitter {
    constructor() {
        super();
        this._initListeners();
    }

    _initListeners() {
        // Base Events
        this.on('login', (studentName) => {
            this.logToFile(`Student ${studentName} logged in`);
        });

        this.on('view_lesson', (data) => {
            this.logToFile(`Student ${data.name} viewed lesson ${data.lesson}`);
        });

        this.on('submit_assignment', (data) => {
            this.logToFile(`Student ${data.name} submitted assignment ${data.assignment}`);
        });

        // Exercise 1: Logout Event
        this.on('logout', (studentName) => {
            this.logToFile(`Student ${studentName} logged out`);
        });

        // Exercise 2: Quiz Attempt Event
        this.on('quiz_attempt', (data) => {
            this.logToFile(`Student ${data.name} attempted quiz: ${data.score}/${data.total}`);
        });

        // Exercise 4: Error Event
        this.on('error', (err) => {
            console.error('Error received:', err);
            this.logErrorToFile(err);
        });
    }

    // Exercise 3: Log to logs/ folder with date format
    logToFile(message) {
        const timestamp = new Date().toISOString();
        const logMessage = `${timestamp} - ${message}\n`;
        
        const dateStr = timestamp.split('T')[0];
        const dir = path.join(__dirname, 'logs');
        
        // Ensure directory exists
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }

        const filePath = path.join(dir, `activity-${dateStr}.log`);

        fs.appendFile(filePath, logMessage, (err) => {
            if (err) {
                console.error('Error writing to activity log:', err);
            }
        });
    }

    // Exercise 4: Log errors to error.log
    logErrorToFile(errorMessage) {
        const timestamp = new Date().toISOString();
        const logMessage = `${timestamp} - ${errorMessage}\n`;
        const filePath = path.join(__dirname, 'error.log');

        fs.appendFile(filePath, logMessage, (err) => {
            if (err) {
                console.error('Error writing to error log:', err);
            }
        });
    }
}

const logger = new StudentLogger();

module.exports = logger;
