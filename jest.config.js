module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  clearMocks: true,
  testMatch: ['**/?(*.)+(spec|test).[tj]s'],
  setupFilesAfterEnv: ['<rootDir>/src/jest.setup.ts'],
};
