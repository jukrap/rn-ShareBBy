import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import userStore from '../lib/userStore'; // Zustand 스토어 import
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from "react-native-geolocation-service";

const SplashScreen = ({ navigation }) => {
  const { setUserData } = userStore(); // 사용자 정보만 필요하므로 userToken은 사용하지 않음

  useEffect(() => {
    checkUser();
  }, []); // 최초 한 번만 실행

  const checkUser = async () => {
    // AsyncStorage에서 사용자 정보를 가져옴
    const storedUserData = await AsyncStorage.getItem('userInfo');
    if (storedUserData) {
      // 사용자 정보가 있는 경우 Zustand 스토어에 설정
      setUserData(storedUserData);
      // 다음 화면으로 이동
      navigation.replace('BottomTab');
    } else {
      // 사용자 정보가 없는 경우 로그인 화면으로 이동
      setTimeout(() => {
        navigation.replace('Login');
      }, 2000); // 2초 후에 이동하도록 설정
    }
  };

  const getMyLocation = () => {
    console.log('✅ get Location =====>');
    Geolocation.getCurrentPosition(
      async (position) => {
        console.log('✅ position =====>', position);
      }
    )
  }

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/LoginTitle.png')}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 200,
    height: 200,
  },
});

export default SplashScreen;
