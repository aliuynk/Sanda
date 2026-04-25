const { base } = require('@sanda/config-eslint');

module.exports = {
  ...base,
  parserOptions: { ...base.parserOptions, tsconfigRootDir: __dirname },
};
