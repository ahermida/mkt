const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

const nodeCommon = {
  devtool: 'eval',
  resolve: {
    extensions: ['.js']
  },
  module: {
    rules: [{
        test: /\.jsx?$/,
        use: ['babel-loader'],
        include: path.join(__dirname, 'src')
      },
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
      }
    ]
  }
};

const clientCommon = {
  devtool: 'source-map',
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
    ]
  }
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
    filename: 'api.node.bundle.js',
  },
  target: 'node',
  externals: [nodeExternals()],
};

const clientApi = {
  entry: ['./src/api/index.js'],
  output: {
    path: __dirname + '/build/js',
    filename: 'api.bundle.js',
  },
  target: 'web',
}

module.exports = [
  Object.assign({}, nodeCommon, server),
  Object.assign({}, nodeCommon, api),
  Object.assign({}, clientCommon, clientApi),
];
