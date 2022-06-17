/* eslint-disable prettier/prettier */
module.exports = {
    "settings": {
        "node":{
            "allowModules": ["electron"],
            "resolvePaths": ['typechain-types'],
            "tryExtensions": [".js", ".json", ".node", ".ts"]
        }
    },
  env: {
    browser: false,
    es2021: true,
    mocha: true,
    node: true,
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "standard",
    "plugin:prettier/recommended",
    "plugin:node/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    "node/no-unsupported-features/es-syntax": [
      "error",
      { ignores: ["modules"] },
    ],
    "node/no-missing-import": "error",
  },
};
