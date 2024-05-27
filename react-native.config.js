module.exports = {
  project: {
    ios: {},
    android: {}, // grouped into "project"
  },
  assets: ['./src/assets/fonts/'],
  dependencies: {
    '@react-native-community/google-signin': {
      platforms: {
        ios: null,
      },
    },
    'react-native-fbsdk': {
      platforms: {
        ios: null,
      },
    },
  },
};
