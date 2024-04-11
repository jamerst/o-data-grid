import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import reactRecommended from "eslint-plugin-react/configs/recommended.js";
import hooksPlugin from "eslint-plugin-react-hooks";

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    reactRecommended,
    {
        plugins: {
          "react-hooks": hooksPlugin,
        },
        rules: {
            ...hooksPlugin.configs.recommended.rules
        },
    },
    {
        rules: {
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "error",
            "react/display-name": "off",
            "react/prop-types": "off",
            "@typescript-eslint/no-non-null-assertion": "off",
            "@typescript-eslint/no-explicit-any": "off"
        },
        settings: {
            "react": {
                "version": "detect"
            }
        }
    },
    {
        ignores: ["**/build/**"]
    }
)