const path = require("path");

module.exports = {
    entry: "./src/index.ts",
    output: {
        path: path.resolve(__dirname, "build"),
        filename: "o-data-grid.bundle.js"
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
            }
        ]
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx"],
        modules: ["./node_modules", "./src"]
    }
}