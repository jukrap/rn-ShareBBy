import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import Login from '../pages/SignUpLogin/Login';
import SearchId from '../pages/SignUpLogin/SearchId';
import SearchPassword from '../pages/SignUpLogin/SearchPassword';
import SignUp from '../pages/SignUpLogin/SignUp';
import SignUpAgree from '../components/SignUp/SignUpAgree';
import SignUpEmail from '../components/SignUp/SignUpEmail';
import SignUpPassword from '../components/SignUp/SignUpPassword';
import SignUpAddress from '../components/SignUp/SignUpAddress';
import SignUpNickname from '../components/SignUp/SignUpNickname';
import TeenagerAgree from '../components/SignUp/AgreeList/TeenagerAgree';
import Main from '../pages/Main/Main';
import ServiceAgree from '../components/SignUp/AgreeList/ServiceAgree';
import InformationAgree from '../components/SignUp/AgreeList/InformationAgree';
import MarketingAgree from '../components/SignUp/AgreeList/MarketringAgree';

const Stack = createNativeStackNavigator();


const LoginTab = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen name="AgreeTab" component={SignUpAgree} />
      <Stack.Screen name="SignUpEmail" component={SignUpEmail} />
      <Stack.Screen name="SignUpPassword" component={SignUpPassword} />
      <Stack.Screen name="SignUpNickname" component={SignUpNickname} />
      <Stack.Screen name="SignUpAddress" component={SignUpAddress} />
      <Stack.Screen name="SearchId" component={SearchId} />
      <Stack.Screen name="TeenagerAgree" component={TeenagerAgree} />
      <Stack.Screen name="ServiceAgree" component={ServiceAgree} />
      <Stack.Screen name="InformationAgree" component={InformationAgree} />
      <Stack.Screen name="MarketingAgree" component={MarketingAgree} />
      <Stack.Screen name="SearchPassword" component={SearchPassword} />
      <Stack.Screen name="Main" component={Main} />
    </Stack.Navigator>
  );
};

export default LoginTab;
