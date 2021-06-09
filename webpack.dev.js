const { merge } = require("webpack-merge");
const common = require("./webpack.common");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = merge(common, {
	mode: "development",
	output: {
		filename: "main.js",
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: "./frontend/src/index.html",
			inject: "body",
		}),
	],
	module: {
		rules: [
			{
				test: /\.s?css$/,
				use: ["style-loader", "css-loader", "sass-loader"],
			},
		],
	},
	devServer: {
		port: "3000",
		proxy: {
			"/": "http://localhost:8080/",
		},
	},
});
