module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  collectCoverageFrom: ['src/**/*.ts', '!src/index.ts'],
  coverageDirectory: 'coverage',
  testMatch: ['**/*.spec.ts', '**/*.test.ts'],
  setupFiles: ['<rootDir>/tests/setup.ts'],
};
