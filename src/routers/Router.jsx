// Router.js
import React, {useEffect} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import BottomTab from '../routers/BottomTab';
import Show from '../pages/Main/Show';
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
import ServiceAgree from '../components/SignUp/AgreeList/ServiceAgree';
import InformationAgree from '../components/SignUp/AgreeList/InformationAgree';
import MarketingAgree from '../components/SignUp/AgreeList/MarketringAgree';
import SplashScreen from '../pages/SplashScreen';


const Stack = createNativeStackNavigator();

const Router = () => {

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="SplashScreen" component={SplashScreen} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="BottomTab" component={BottomTab} />
      <Stack.Screen name="Show" component={Show} />
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen name="SignUpAgree" component={SignUpAgree} />
      <Stack.Screen name="SignUpEmail" component={SignUpEmail} />
      <Stack.Screen name="SignUpPassword" component={SignUpPassword} />
      <Stack.Screen name="SignUpNickname" component={SignUpNickname} />
      <Stack.Screen name="SignUpAddress" component={SignUpAddress} />
      <Stack.Screen name="SearchId" component={SearchId} />
      <Stack.Screen name="SearchPassword" component={SearchPassword} />
      <Stack.Screen name="TeenagerAgree" component={TeenagerAgree} />
      <Stack.Screen name="ServiceAgree" component={ServiceAgree} />
      <Stack.Screen name="InformationAgree" component={InformationAgree} />
      <Stack.Screen name="MarketingAgree" component={MarketingAgree} />
    </Stack.Navigator>
  );
};

// Stack BottomTab
// 


export default Router;
