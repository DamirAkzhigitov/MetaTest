const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')
// const webpack = require('webpack'); //to access built-in plugins
// const { CleanWebpackPlugin } = require('clean-webpack-plugin')
module.exports = {
  entry: './src/javascript/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '',
    filename: 'bundle.js'
  },
  devServer: {
    port: 8080,
    contentBase: path.join(__dirname, 'dist'),
    watchContentBase: true,
    hot: true
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          {
            loader: "css-loader",
          },
          {
            loader: "postcss-loader",
          },
          {
            loader: "sass-loader",
            options: {
              implementation: require('sass')
            }

          }
        ]
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              outputPath: 'images'
            }
          }
        ]
      }

    ]
  },
  plugins: [
    // new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
    new HtmlWebpackPlugin({ template: './src/html/index.html'}),
    require('autoprefixer'),
    require('cssnano'),
    new MiniCssExtractPlugin({
      filename: 'bundle.css'
    }),
  ],
  resolve: {
    alias: {
      images: path.resolve(__dirname, 'src/images/'),
    },
  },
  mode: 'development'
}
