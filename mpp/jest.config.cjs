module.exports = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    moduleNameMapper: {
        '\\.(css|less)$': 'identity-obj-proxy',
    },
    testPathIgnorePatterns: [
        '/node_modules/',
        '/__mocks__/' // Ignore mock files as test suites
    ]
};