const { merge } = require("webpack-merge");
const common = require("./webpack.common");
const TerserPlugin = require("terser-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

module.exports = merge(common, {
	mode: "production",
	output: {
		filename: "static/js/main.[contenthash].bundle.js",
		clean: true,
	},
	plugins: [
		new TerserPlugin(),
		new MiniCssExtractPlugin({
			filename: "static/css/[name].[fullhash].css",
		}),
		new HtmlWebpackPlugin({
			template: "./frontend/src/index.html",
			inject: "body",
			minify: {
				removeComments: true,
				collapseWhitespace: true,
				removeAttributeQuotes: true,
			},
		}),
	],
	module: {
		rules: [
			{
				test: /\.s?css$/,
				use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
			},
		],
	},
	optimization: {
		minimizer: [new CssMinimizerPlugin()],
	},
});
