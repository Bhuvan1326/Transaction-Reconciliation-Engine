const path = require('path');

module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/src/tests/**/*.test.js'],
  collectCoverageFrom: ['src/**/*.js', '!src/server.js', '!src/tests/**'],
  coverageDirectory: 'coverage',
  verbose: true,
  testTimeout: 120000,
  globalSetup: path.join(__dirname, 'src/tests/setup/globalSetup.js'),
  globalTeardown: path.join(__dirname, 'src/tests/setup/globalTeardown.js'),
  setupFilesAfterEnv: [path.join(__dirname, 'src/tests/setup/jest.setup.js')],
  maxWorkers: 1,
};
