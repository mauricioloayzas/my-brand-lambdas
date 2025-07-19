// webpack.config.js
const path = require('path');
const slsw = require('serverless-webpack');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
  entry: slsw.lib.entries,
  devtool: 'source-map',
  resolve: {
    extensions: ['.js', '.json', '.ts'],
    plugins: [new TsconfigPathsPlugin({ configFile: './tsconfig.json' })],
  },
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js',
  },
  target: 'node',
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        // Se excluyen tanto node_modules como la carpeta de pruebas.
        exclude: [
          path.resolve(__dirname, 'node_modules'),
          path.resolve(__dirname, 'test'),
        ],
        options: {
          configFile: 'tsconfig.json',
        },
      },
    ],
  },
  plugins: [
    new webpack.IgnorePlugin({
      checkResource(resource) {
        // Lista de dependencias opcionales de NestJS
        const lazyImports = [
          '@nestjs/microservices',
          '@nestjs/microservices/microservices-module',
          '@nestjs/websockets',
          '@nestjs/websockets/socket-module',
          'cache-manager',
          'class-validator',
          'class-transformer',
          'class-transformer/storage', 
        ];
        if (!lazyImports.includes(resource)) {
          return false;
        }
        try {
          // Intenta resolver el módulo. Si falla, es que no está instalado y debe ser ignorado.
          require.resolve(resource, {
            paths: [process.cwd()],
          });
        } catch (err) {
          return true; // Ignora el recurso si no se encuentra
        }
        return false;
      },
    }),
  ],
};