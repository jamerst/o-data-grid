const ESLintPlugin = require('eslint-webpack-plugin');
const HtmlWebPackPlugin = require("html-webpack-plugin");
const path = require("path");

module.exports = {
    mode: "development",
    entry: "./o-data-grid/dev/index.tsx",
    output: {
        path: __dirname + "/o-data-grid/dev-build",
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
        extensions: [".js", ".ts", ".tsx"],
        alias: {
            "react": path.resolve('./node_modules/react'),
            "react-dom": path.resolve('./node_modules/react-dom')
        }
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: "./o-data-grid/dev/index.html"
        }),
        new ESLintPlugin({ context: "./o-data-grid/" })
    ]
}