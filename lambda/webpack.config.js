const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const plugins = process.env.PROD ? [new UglifyJSPlugin()] : [];

const config = {
  target: 'node',
  entry: './index',
  output: {
    filename: 'index.js',
    path: __dirname,
    libraryTarget: 'commonjs2'
  },
  module: {
    loaders: [
      {test: /\.ts$/, loader: 'awesome-typescript-loader'}
    ]
  },
  resolve: {
    extensions: ['.ts', '.js', '.json']
  },
  plugins
};

module.exports = config;
