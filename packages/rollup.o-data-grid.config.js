import dts from "rollup-plugin-dts"
import pkg from "./o-data-grid/package.json"
import typescript from "rollup-plugin-typescript2";

export default [
    {
        input: "./o-data-grid/src/index.ts",
        output: [
            {
                file: "./o-data-grid/build/o-data-grid-esm.js",
                format: "esm"
            },
            {
                file: "./o-data-grid/build/o-data-grid-cjs.js",
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
        input: "./o-data-grid/build/o-data-grid/src/index.d.ts",
        output: [
            {
                file: "./o-data-grid/build/o-data-grid.d.ts",
                format: "es"
            }
        ],
        plugins: [
            dts()
        ]
    }
]