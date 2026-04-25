const { nextjs } = require('@sanda/config-eslint');

module.exports = {
  ...nextjs,
  parserOptions: { ...nextjs.parserOptions, tsconfigRootDir: __dirname },
};
