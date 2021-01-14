var path = require('path');

module.exports = {
  mode: 'development',
  entry: './components/App.js',
  output: {
    path: path.join(__dirname, '..', '/public'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] }
    ]
  }
};
