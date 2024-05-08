// Router.js
import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useStore  from '../lib/useStore'; // Zustand 스토어 import

import BottomTab from '../routers/BottomTab';
import LoginTab from '../routers/LoginTab';

const Stack = createNativeStackNavigator();

const Router = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        if (userToken) {
          // Zustand 스토어에 사용자 토큰 설정
          useStore.setState({ userToken: userToken });
          navigation.navigate('BottomTab');
        } else {
          navigation.navigate('LoginTab');
        }
      } catch (e) {
        console.error('로그인 상태 확인 실패:', e);
      }
    };

    checkLoginStatus();
  }, []);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LoginTab" component={LoginTab} />
      <Stack.Screen name="BottomTab" component={BottomTab} />
    </Stack.Navigator>
  );
};

export default Router;
