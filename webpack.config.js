const webpack = require('webpack');
const CssModulePlugin = require("@dojo/webpack-contrib/css-module-plugin/CssModulePlugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const path = require("path");
const fs = require("fs");
const loaderUtils = require("loader-utils");
const slash = require('slash');

const basePath = process.cwd();
const packageJsonPath = path.join(basePath, 'package.json');
const packageJson = fs.existsSync(packageJsonPath) ? require(packageJsonPath) : {};
const packageName = packageJson.name || '';
const allPaths = path.join(__dirname, 'dojo');

function webpackConfigFactory(args) {
	const config = {
		entry: {
			'dojo': `imports-loader?theme=${path.join(allPaths, 'index.ts')}!${path.join(__dirname, 'template', 'theme-installer.js')}`
		},
		output: {
			filename: "[name]-" + packageJson.version + ".js",
			path: path.resolve('./dist/dojo')
		},
		resolve: {
			modules: [basePath, path.join(basePath, 'node_modules')],
			extensions: ['.ts', '.js']
		},
		devtool: 'source-map',
		plugins: [
			new CssModulePlugin.default(basePath),
			new webpack.DefinePlugin({ THEME_NAME: JSON.stringify('dojo') }),
			new UglifyJsPlugin({ sourceMap: true, cache: true }),
			new ExtractTextPlugin({
				filename: function (getPath) { return getPath("[name]-" + packageJson.version + ".css"); }
			})
		],
		module: {
			rules: [
				{
					include: allPaths,
					test: /.*\.ts?$/,
					use: [
						{
							loader: 'ts-loader',
							options: { instance: 'dojo' }
						}
					]
				},
				{
					test: /.*\.(gif|png|jpe?g|svg|eot|ttf|woff|woff2)$/i,
					loader: 'file-loader?hash=sha512&digest=hex&name=[hash:base64:8].[ext]'
				},
				{
					include: allPaths,
					test: /.*\.css?$/,
					use: ExtractTextPlugin.extract({
						fallback: ['style-loader'],
						use: [
							'@dojo/webpack-contrib/css-module-decorator-loader',
							{
								loader: 'css-loader',
								options: {
									modules: true,
									sourceMap: true,
									importLoaders: 1,
									localIdentName: '[name]__[local]__[hash:base64:5]'
								}
							},
							{
								loader: 'postcss-loader?sourceMap',
								options: {
									ident: 'postcss',
									plugins: [
										require('postcss-import')(),
										require('postcss-cssnext')({
											features: {
												autoprefixer: {
													browsers: ['last 2 versions', 'ie >= 10']
												}
											}
										})
									]
								}
							}
						]
					})
				}
			]
		}
	};
	return config;
}
exports.default = webpackConfigFactory;
