module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      require.resolve('babel-plugin-module-resolver'),
      {
        // root: ["./src/"],
        alias: {
          "^@worldbrain/storex$": "./external/@worldbrain/storex/ts",
          "^@worldbrain/storex/lib(.+)$": "./external/@worldbrain/storex/ts\\1",
          "^@worldbrain/storex-backend-typeorm$": "./external/@worldbrain/storex-backend-typeorm/ts",
          "^@worldbrain/storex-backend-typeorm/lib(.+)$": "./external/@worldbrain/storex-backend-typeorm/ts\\1",
        }
      }
    ],
  ]
}
