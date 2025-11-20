import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/__tests__'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.(t|j)s$': '@swc/jest',
  },
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coveragePathIgnorePatterns: [
    'index.ts',
    '/src/config/.*\\.ts$',
    '/src/migrations/.*\\.ts$',
    '/src/modules/.*/dto/.*\\.ts$',
    '/src/modules/.*/entities/.*\\.ts$',
    '/src/modules/.*/strategies/.*\\.ts$',
  ],
  transformIgnorePatterns: ['node_modules/(?!(@nestjs|@swc)/)'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
};

export default config;
