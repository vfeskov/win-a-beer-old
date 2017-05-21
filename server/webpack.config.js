const path = require('path');
const nodeExternals = require('webpack-node-externals');

const config = {
  target: 'node',
  entry: './index',
  context: path.resolve(__dirname),
  output: {
    filename: 'index.js',
    path: __dirname
  },
  module: {
    loaders: [
      {test: /\.ts$/, use: [{
        loader: 'awesome-typescript-loader',
        options: {configFileName: path.resolve(__dirname, 'tsconfig.json')}
      }]},
      {test: /(\.md|\.map)$/, loader: 'null-loader'},
      {test: /\.json$/, loader: 'json-loader'}
    ]
  },
  resolve: {
    extensions: ['.ts', '.js', '.json']
  }
};

config.externals = [nodeExternals({
  modulesDir: path.resolve(path.join(__dirname, '..', 'node_modules'))
})];

module.exports = config;
