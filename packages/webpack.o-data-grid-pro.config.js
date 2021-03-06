const HtmlWebPackPlugin = require("html-webpack-plugin");

module.exports = {
    mode: "development",
    entry: "./o-data-grid-pro/dev/index.tsx",
    output: {
        path: __dirname + "/o-data-grid-pro/dev-build",
        filename: "bundle.js"
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
            }
        ]
    },
    resolve: {
        extensions: [".js", ".ts", ".tsx"]
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: "./o-data-grid-pro/dev/index.html"
        })
    ]
}