/** @type {import('jest').Config} */
module.exports = {
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'node',
    extensionsToTreatAsEsm: ['.ts'],
    roots: ['<rootDir>/__tests__'],
    testMatch: ['**/__tests__/**/*.test.ts'],
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
        '^@bl-framework/mvvm$': '<rootDir>/../mvvm/src/index.ts',
        '^@bl-framework/mvvm-creator$': '<rootDir>/src/index.ts',
        '^cc$': '<rootDir>/__tests__/mocks/cc.ts'
    },
    transform: {
        '^.+\\.ts$': ['ts-jest', {
            useESM: true,
            tsconfig: 'tsconfig.test.json'
        }]
    },
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!src/examples/**',
        '!src/contracts/**'
    ]
};

