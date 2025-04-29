require('dotenv').config();

// Set test environment variables
process.env.NODE_ENV = 'test';

// Increase timeout for all tests
jest.setTimeout(10000);

// Suppress console logs during tests
console.log = jest.fn();
console.error = jest.fn(); 