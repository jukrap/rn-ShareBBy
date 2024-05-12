import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import userStore from '../lib/userStore'; // Zustand 스토어 import
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from "react-native-geolocation-service";

const SplashScreen = ({ navigation }) => {
  const { userToken, setUserToken, user, setUser } = userStore();

  useEffect(() => {
    checkUser();
  }, [userToken]);

  const checkUser = async () => {
    if (userToken) {
      // 사용자 정보가 이미 존재하면 바로 다음 화면으로 이동
      setTimeout(() => {
        navigation.replace('BottomTab');
      }, 2000); // 2초 후에 이동하도록 설정
    } else {
      // 사용자 정보가 없는 경우
      const storedUserToken = await AsyncStorage.getItem('userToken');
      if (storedUserToken) {
        // AsyncStorage에 토큰이 존재하는 경우 Zustand 스토어에 설정
        setUserToken(storedUserToken);
      } else {
        // AsyncStorage에 토큰이 없는 경우 로그인 화면으로 이동
        navigation.replace('Login');
      }
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
