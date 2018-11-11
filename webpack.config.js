const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

const nodeCommon = {
  target: 'node',
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
  externals: [nodeExternals()],
};

const clientCommon = {
  target: 'web',
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
};

const api = {
  entry: ['babel-polyfill', './src/api/index.js'],
  output: {
    path: __dirname + '/build/js',
    libraryTarget: 'umd',
    filename: 'api.node.bundle.js',
  },
};

const clientApi = {
  entry: ['babel-polyfill', './src/api/index.js'],
  output: {
    path: __dirname + '/build/js',
    filename: 'api.bundle.js',
  },
};

const client = {
  entry: ['babel-polyfill', './src/client/index.js'],
  output: {
    path: __dirname + '/build/js',
    filename: 'client.bundle.js',
  },
}

module.exports = [
  Object.assign({}, nodeCommon, server),
  Object.assign({}, nodeCommon, api),
  Object.assign({}, clientCommon, clientApi),
  Object.assign({}, clientCommon, client),
];
