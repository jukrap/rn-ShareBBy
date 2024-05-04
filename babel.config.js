module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module:react-native-dotenv',
      {
        envName: 'APP_ENV',
        moduleName: '@env',
        path: '.env.local',
        blocklist: null,
        allowlist: null,
        blacklist: null,
        whitelist: null,
        safe: false,
        allowUndefined: true,
        verbose: false,
      },
    ],
    ['@babel/plugin-transform-private-methods', { loose: true }],
  ],
  overrides: [
    {
      test: fileName => !fileName.includes('node_modules'),
      plugins: [[require('@babel/plugin-proposal-class-properties'), { loose: true }]],
    },
  ],
};
