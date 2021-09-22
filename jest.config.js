module.exports = {
  clearMocks: true,
  coverageDirectory: 'coverage',
  testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
  testEnvironment: 'jsdom',
  testTimeout: 30 * 1000, // 30 seconds
};
