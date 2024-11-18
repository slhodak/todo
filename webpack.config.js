const path = require('path');
const webpack = require('webpack');
const env = require('dotenv').config({path: __dirname + '/.env'}).parsed;

module.exports = {
  mode: 'development',
  entry: path.resolve('src/client/client.js'),
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
      'ENV': env.ENV || 'development'
    })
  ]
};
