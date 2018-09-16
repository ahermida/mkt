const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

const nodeCommon = {
  devtool: 'eval',
  resolve: {
    extensions: ['.js']
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: 'babel-loader',
        exclude: /node_modules/,

      }
    ]
  },
};

const clientCommon = {
  devtool: 'eval',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      }
    ]
  },
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  },
};
/*
const client = {
  entry: ['babel-polyfill', './src/client/index.js'],
  output: {
    path: __dirname + '/dist',
    filename: 'client.bundle.js',
    publicPath: '/static/',
  },
  target: 'web',
};
*/
const server = {
  entry: ['babel-polyfill','./src/server/index.js'],
  output: { path: __dirname + '/build/js', filename: 'server.bundle.js' },
  target: 'node',
  externals: [nodeExternals()],
};

const api = {
  entry: ['babel-polyfill', './src/api/index.js'],
  output: {
    path: __dirname + '/build/js',
    libraryTarget: 'umd',
    filename: 'api.node.bundle.js',
  },
  target: 'node',
  externals: [nodeExternals()],
};

const clientApi = {
  entry: ['babel-polyfill', './src/api/index.js'],
  output: {
    path: __dirname + '/build/js',
    filename: 'api.bundle.js',
  },
};

module.exports = [
  Object.assign({}, nodeCommon, server),
  Object.assign({}, nodeCommon, api),
  Object.assign({}, clientCommon, clientApi),
];
