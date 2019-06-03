const path = require('path')

const babelSettings = {
  extends: path.join(__dirname, 'babel.config.js'),
}

module.exports = ({ platform }, { module, resolve }) => ({
  entry: `./index.js`,
  module: {
    ...module,
    rules: [
      {
        test: /\.tsx?$/,
        exclude: '/node_modules/',
        use: [
          {
            loader: 'babel-loader',
            options: babelSettings,
          },
          {
            loader: 'ts-loader'
          },
        ],
      },
      ...module.rules
    ]
  },
  resolve: {
    ...resolve,
    extensions: [
      '.ts',
      '.tsx',
      `.${platform}.ts`,
      '.native.ts',
      `.${platform}.tsx`,
      '.native.tsx',
      ...resolve.extensions],
  },
});
