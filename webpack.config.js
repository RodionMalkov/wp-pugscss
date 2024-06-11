const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const fs = require('fs')

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production'
  const isDevelopment = argv.mode === 'development'

  const pages = fs
    .readdirSync(path.resolve(__dirname, 'src/pages'))
    .filter(fileName => fileName.endsWith('.pug'))

  const htmlPlugins = pages.map(
    page =>
      new HtmlWebpackPlugin({
        template: `./src/pages/${page}`,
        filename: `${page.replace('.pug', '.html')}`
      })
  )

  return {
    entry: './src/scripts/index.js',
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'dist'),
      publicPath: '/'
    },
    module: {
      rules: [
        {
          test: /\.pug$/,
          use: 'pug-loader'
        },
        {
          test: /\.scss$/,
          use: [
            isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
            'css-loader',
            'sass-loader'
          ]
        },
        {
          test: /\.(png|jpe?g|gif|svg)$/i,
          type: 'asset/resource'
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource'
        }
      ]
    },
    plugins: [
      new CleanWebpackPlugin(),
      ...htmlPlugins,
      new MiniCssExtractPlugin({
        filename: '[name].css'
      }),
      new CopyWebpackPlugin({
        patterns: [{ from: 'src/public', to: '/' }]
      })
    ],
    devtool: isDevelopment ? 'source-map' : false,
    devServer: {
      static: {
        directory: path.join(__dirname, 'dist')
      },
      compress: true,
      port: 9000,
      open: true,
      hot: true,
      watchFiles: ['src/**/*']
    },
    resolve: {
      alias: {
        images: path.resolve(__dirname, 'src/public/images')
      }
    },
    optimization: {
      minimize: isProduction,
      minimizer: [new TerserPlugin(), new CssMinimizerPlugin()]
    }
  }
}
