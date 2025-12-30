import type { Config } from 'jest';

const commonConfig: Partial<Config> = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.(t|j)s$': '@swc/jest',
  },
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
  transformIgnorePatterns: ['node_modules/(?!(@nestjs|@swc)/)'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
};

const config: Config = {
  projects: [
    {
      ...commonConfig,
      displayName: 'unit',
      roots: ['<rootDir>/src', '<rootDir>/__tests__'],
      testMatch: ['**/?(*.)+(spec|test).ts'],
      testPathIgnorePatterns: ['/node_modules/', '/dist/', '/__tests__/e2e/'],
      coverageDirectory: 'coverage',
      coverageReporters: ['text', 'lcov', 'html'],
      coveragePathIgnorePatterns: [
        'index.ts',
        '/__tests__/',
        '/src/config/.*\\.ts$',
        '/src/migrations/.*\\.ts$',
        '/src/modules/.*/dto/.*\\.ts$',
        '/src/modules/.*/entities/.*\\.ts$',
        '/src/modules/.*/strategies/.*\\.ts$',
      ],
    },
    {
      ...commonConfig,
      displayName: 'e2e',
      roots: ['<rootDir>/src', '<rootDir>/__tests__'],
      testMatch: ['**/?(*.e2e-)+(spec|test).ts'],
      testPathIgnorePatterns: ['/node_modules/', '/dist/', '/__tests__/unit/'],
      setupFilesAfterEnv: ['<rootDir>/test/setup-e2e.ts'],
      testTimeout: 30000,
      maxWorkers: 1,
    },
  ],
};

export default config;
