/**
 * @format
 */

import {AppRegistry, Platform} from 'react-native';
import App from './App';
import appJson from './app.json';

const appName = Platform.select({
    ios: appJson.ios.name,
    android: appJson.android.name,
});

AppRegistry.registerComponent(appName, () => App);
