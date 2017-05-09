var path = require('path');
var webpack = require('webpack');
var HtmlwebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

var ROOT_PATH = path.resolve(__dirname);
var APP_PATH = path.resolve(ROOT_PATH, 'app');
var BUILD_PATH = path.resolve(ROOT_PATH, 'build');
var TEM_PATH = path.resolve(ROOT_PATH, 'templates');

module.exports = {
  entry: [
    path.resolve(APP_PATH, 'index.js')
  ],
  output: {
    path: BUILD_PATH,
    filename: '[name].js'
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        loaders: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader' })
      }
    ]
  },

  plugins: [
    new HtmlwebpackPlugin({
      title: 'Web Shell',
      template: path.resolve(TEM_PATH, 'index.html'),
      filename: 'index.html',
      chunks: {
        "head": {
          "entry": "main.js",
        },
      },
      inject: 'body'
    }),
    new ExtractTextPlugin("[name].css")
  ]
}
