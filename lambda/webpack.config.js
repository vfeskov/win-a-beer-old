const path = require('path');

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
  }
};

module.exports = config;
