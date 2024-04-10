import dts from "rollup-plugin-dts"
import pkg from "./o-data-grid-premium/package.json" assert { type: "json" };
import typescript from '@rollup/plugin-typescript';
import { del } from "@kineticcafe/rollup-plugin-delete";

export default [
    {
        input: "./o-data-grid-premium/src/index.ts",
        output: [
            {
                file: "./o-data-grid-premium/build/o-data-grid-premium-esm.js",
                format: "esm"
            },
            {
                file: "./o-data-grid-premium/build/o-data-grid-premium-cjs.js",
                format: "cjs"
            }
        ],
        plugins: [
            del({ targets: "o-data-grid-premium/build/*"}),
            typescript(),
        ],
        external: Object.keys({ ...pkg.peerDependencies, ...pkg.dependencies }).map((packageName) => {
            // Make sure that e.g. `react` as well as `react/jsx-runtime` is considered an external
            return new RegExp(`(${packageName}|${packageName}\\/.*)`);
        }),
    },
    {
        input: "./o-data-grid-premium/build/build/o-data-grid-premium/src/index.d.ts",
        output: [
            {
                file: "./o-data-grid-premium/build/o-data-grid-premium.d.ts",
                format: "es"
            }
        ],
        plugins: [
            dts()
        ]
    }
]