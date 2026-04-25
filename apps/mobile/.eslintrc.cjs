const { reactNative } = require('@sanda/config-eslint');

module.exports = {
  ...reactNative,
  parserOptions: { ...reactNative.parserOptions, tsconfigRootDir: __dirname },
};
