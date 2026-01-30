// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

const config = Array.isArray(expoConfig) ? expoConfig : [expoConfig];

module.exports = defineConfig([
  {
    ignores: ['dist/*', 'node_modules/*'],
  },
  ...config.map(cfg => {
    if (cfg.files && (cfg.files.includes('**/*.ts') || cfg.files.includes('**/*.tsx'))) {
      return {
        ...cfg,
        settings: {
          ...cfg.settings,
          'import/resolver': {
            typescript: {
              alwaysTryTypes: true,
              project: './tsconfig.json',
            },
          },
        },
      };
    }
    return cfg;
  }),
]);
