import dts from "rollup-plugin-dts"
import pkg from "./o-data-grid-pro/package.json"
import typescript from "rollup-plugin-typescript2";

export default [
    {
        input: "./o-data-grid-pro/src/index.ts",
        output: [
            {
                file: "./o-data-grid-pro/build/o-data-grid-pro-esm.js",
                format: "esm"
            },
            {
                file: "./o-data-grid-pro/build/o-data-grid-pro-cjs.js",
                format: "cjs"
            }
        ],
        plugins: [
            typescript({ clean: true })
        ],
        external: Object.keys({ ...pkg.peerDependencies, ...pkg.dependencies }).map((packageName) => {
            // Make sure that e.g. `react` as well as `react/jsx-runtime` is considered an external
            return new RegExp(`(${packageName}|${packageName}\\/.*)`);
        }),
    },
    {
        input: "./o-data-grid-pro/build/o-data-grid-pro/src/index.d.ts",
        output: [
            {
                file: "./o-data-grid-pro/build/o-data-grid-pro.d.ts",
                format: "es"
            }
        ],
        plugins: [
            dts()
        ]
    }
]