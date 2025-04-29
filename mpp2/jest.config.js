module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/tests/**/*.test.js'],
    verbose: true,
    setupFiles: ['<rootDir>/tests/setup.js'],
    testTimeout: 30000, // 30 seconds
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
}; 