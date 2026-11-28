module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 30000,
  transform: {
    'shared[/\\\\]loanCalculations\\.js$': '<rootDir>/tests/sharedTransform.js',
  },
};
