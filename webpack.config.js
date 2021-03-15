const path = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv').config({path: __dirname + '/.env'});

module.exports = {
  mode: 'development',
  entry: path.resolve('src/javascript/client/client.js'),
  output: {
    path: path.resolve('public'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] }
    ]
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      'ENV': dotenv.ENV || 'development'
    })
  ]
};
