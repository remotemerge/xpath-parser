// init path module
const path = require('path');

module.exports = (env, argv) => ({
  entry: {
    'hali': './src/Hali.ts',
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: '/',
    filename: '[name].js',
    libraryTarget: 'commonjs2'
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.(js|ts)x?$/,
        exclude: /node_modules/,
        loader: 'eslint-loader',
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ]
  },
  performance: {
    hints: argv.mode !== 'production'
  },
  watch: argv.mode !== 'production' || (argv.watch !== undefined && argv.watch === 'true'),
  devtool: false,
});
