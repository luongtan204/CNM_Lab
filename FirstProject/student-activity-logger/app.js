const logger = require('./logger');

console.log('Starting Student Activity Logger Simulation...');

// 1. Simulate Login
logger.emit('login', 'Alice');

// 2. Simulate Viewing a Lesson
logger.emit('view_lesson', {
    name: 'Alice',
    lesson: 'Node.js Events'
});

// 3. Simulate Quiz Attempt (Exercise 2)
logger.emit('quiz_attempt', {
    name: 'Alice',
    score: 8,
    total: 10
});

// 4. Simulate Submitting Assignment
logger.emit('submit_assignment', {
    name: 'Alice',
    assignment: 'Lab 3'
});

// 5. Simulate Logout (Exercise 1)
logger.emit('logout', 'Alice');

// 6. Simulate Error (Exercise 4)
logger.emit('error', 'Database connection failed');

console.log('Events emitted. Checking logs...');
