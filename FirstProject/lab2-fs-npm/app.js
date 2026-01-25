const _ = require('lodash');

const numbers = [1, 2, 3, 4, 5];
const shuffled = _.shuffle(numbers);

console.log('Original:', numbers);
console.log('Shuffled:', shuffled);