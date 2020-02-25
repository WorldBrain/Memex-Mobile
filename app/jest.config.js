module.exports = {
    preset: 'react-native',
    rootDir: '.',
    testMatch: ['<rootDir>/src/**/*.test.(js|jsx|ts|tsx)'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    moduleNameMapper: {
        '\\.(css|less)$': 'identity-obj-proxy',
        '^user-logic$': '<rootDir>/external/user-logic/ts',
        '^user-logic/lib/(.*)': '<rootDir>/external/user-logic/ts/$1',
        '^@worldbrain/storex$': '<rootDir>/external/@worldbrain/storex/ts',
        '^@worldbrain/storex/lib/(.*)':
            '<rootDir>/external/@worldbrain/storex/ts/$1',
        '^@worldbrain/storex-backend-typeorm$':
            '<rootDir>/external/@worldbrain/storex-backend-typeorm/ts',
        '^@worldbrain/storex-pattern-modules$':
            '<rootDir>/external/@worldbrain/storex-pattern-modules/ts',
        '^@worldbrain/storex-schema-migrations$':
            '<rootDir>/external/@worldbrain/storex-schema-migrations/ts',
        '^@worldbrain/memex-stemmer$':
            '<rootDir>/external/@worldbrain/memex-stemmer/ts',
        '^@worldbrain/memex-storage$':
            '<rootDir>/external/@worldbrain/memex-storage/ts',
        '^@worldbrain/memex-url-utils$':
            '<rootDir>/external/@worldbrain/memex-url-utils/ts',
        '^@worldbrain/memex-common$':
            '<rootDir>/external/@worldbrain/memex-common/ts',
    },
}
