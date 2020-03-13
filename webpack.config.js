// init path module
const path = require('path');

// common configs
const commonConfig = (argv) => ({
  entry: {
    'hali': './src/Hali.ts',
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: '/',
    libraryTarget: 'commonjs2',
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
    hints: argv.mode !== 'production' ? 'warning' : false
  },
  watch: argv.mode !== 'production' || (argv.watch !== undefined && argv.watch === 'true'),
  devtool: false,
});

// server configs
const serverConfig = (argv) => Object.assign(commonConfig(argv), {
  output: {
    filename: '[name].node.js',
  },
  target: 'node',
});

// browser configs
const browserConfig = (argv) => Object.assign(commonConfig(argv), {
  output: {
    filename: '[name].web.js',
  },
  target: 'web',
});

// export multiple configs
module.exports = (env, argv) => [serverConfig(argv), browserConfig(argv)];
