var path = require('path');

module.exports = {
  mode: 'development',
  entry: path.resolve('src/javascript/client/index.js'),
  output: {
    path: path.resolve('public'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] }
    ]
  }
};
