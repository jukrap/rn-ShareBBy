import React, { useState, useEffect } from 'react';
import { NavigationContainer } from "@react-navigation/native";
import Router from './src/routers/Router';

import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';

function App(): React.JSX.Element {
  // const [isTokenAvailable, setTokenAvailable] = useState(false);
  // const [isSplashVisible, setSplashVisible] = useState(true);

  // useEffect(() => {
  //   const checkToken = async () => {
  //     try {
  //       const userToken = await AsyncStorage.getItem('userToken');
  //       if (userToken) {
  //         setTokenAvailable(true); // 토큰이 있으면 true로 설정
  //       }
  //       // 스플래시 화면을 3초 후에 숨깁니다.
  //       setTimeout(() => {
  //         setSplashVisible(false);
  //       }, 3000);
  //     } catch (error) {
  //       console.error('토큰 확인 오류:', error);
  //     }
  //   };

  //   checkToken();
  // }, []);

  // useEffect(() => {
  //   // 토큰이 있는 경우 스플래시 화면을 바로 숨깁니다.
  //   if (isTokenAvailable) {
  //     setSplashVisible(false);
  //   }
  // }, [isTokenAvailable]);

  // // return (
  // //   <NavigationContainer>
  // //     {
  // //       isSplashVisible ? (
  // //         <SplashScreen />
  // //       ) : (
  // //         isTokenAvailable ? <Login/> : <Router/>
  // //       )
  // //     }
  // //   </NavigationContainer>
  // // );

  return (
    <NavigationContainer>
       <Router/>
    </NavigationContainer>
  );
}

export default App;
