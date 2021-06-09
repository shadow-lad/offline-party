const path = require("path");

module.exports = {
	entry: "./frontend/src/js/index.js",
	output: {
		path: path.resolve(__dirname, "public"),
		publicPath: "/",
		assetModuleFilename: (data) => {
			const filename = data.filename;
			const path = filename.substring(
				filename.indexOf("src/") + 1,
				filename.lastIndexOf("/")
			);
			return `static/${path}/[name].[hash][ext]`;
		},
	},
	module: {
		rules: [
			{
				test: /\.html?$/,
				loader: "html-loader",
			},
			{
				test: /\.(svg|png|jpe?g|gif)$/i,
				type: "asset/resource",
			},
			{
				test: /\.woff2?$/i,
				type: "asset/inline",
			},
		],
	},
};
