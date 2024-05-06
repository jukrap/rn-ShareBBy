import {Alert} from 'react-native';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import * as KakaoLogin from '@react-native-seoul/kakao-login';
import NaverLogin from '@react-native-seoul/naver-login';
import auth from '@react-native-firebase/auth';
import {WEB_CLIENT_ID} from '@env';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';

const initializeNaverLogin = async () => {
  try {
    await NaverLogin.initialize({
      serviceUrlScheme: 'naverlogin',
      consumerKey: '8RlLfixVUV3Mc0LMjYeE',
      serviceUrlSchemeIOS: 'naverlogin',
      consumerSecret: 'HTZtyAWg2c',
      appName: 'Sharebby',
    });
  } catch (error) {
    console.error('Error initializing Naver Login:', error);
  }
};

const initializeGoogleLogin = async () => {
  try {
    await GoogleSignin.configure({
      webClientId: WEB_CLIENT_ID,
    });
  } catch (error) {
    console.error('구글 로그인 설정 오류:', error);
  }
};

const getProfileAndSave = async (profileData, navigation) => {
  const profileImageUrl = await storage()
    .ref('dummyprofile.png')
    .getDownloadURL();

  const {user} = await auth().createUserWithEmailAndPassword(
    profileData.response.email,
    'temporary_password',
  );

  await firestore().collection('users').doc(user.uid).set({
    id: user.uid,
    email: profileData.response.email,
    nickname: profileData.response.nickname,
    profileImage: profileImageUrl,
  });

  navigation.navigate('BottomTab');
};

const handleLogin = async (loginFunction, navigation) => {
  try {
    await loginFunction();
  } catch (error) {
    Alert.alert('로그인 실패', error.message);
  }
};

export const handleNaverLogin = async navigation => {
  await handleLogin(async () => {
    await initializeNaverLogin();
    const result = await NaverLogin.login();
    if (!result) {
      throw new Error('네이버 로그인 실패');
    }
    const {
      successResponse: {accessToken},
    } = await NaverLogin.login();
    const profileRequestUrl = 'https://openapi.naver.com/v1/nid/me';
    const response = await fetch(profileRequestUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const profileData = await response.json();
      await getProfileAndSave(profileData, navigation);
    } else {
      throw new Error('네이버 프로필 정보 가져오기 실패');
    }
  }, navigation);
};

export const onGoogleButtonPress = async navigation => {
  await handleLogin(async () => {
    await initializeGoogleLogin();
    const {idToken} = await GoogleSignin.signIn();
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    await auth().signInWithCredential(googleCredential);
    const user = auth().currentUser;
    if (user) {
      const email = user.email;
      const displayName = user.displayName;
      const profileImageUrl = await storage()
        .ref('dummyprofile.png')
        .getDownloadURL();
      await firestore().collection('users').doc(user.uid).set({
        id: user.uid,
        email: email,
        nickname: displayName,
        profileImage: profileImageUrl,
      });
      navigation.navigate('BottomTab');
    } else {
      throw new Error('사용자 정보가 없습니다.');
    }
  }, navigation);
};

export const kakaoLogins = async navigation => {
  await handleLogin(async () => {
    const result = await KakaoLogin.login();
    if (!result) {
      throw new Error('카카오 로그인 실패');
    }
    const profile = await KakaoLogin.getProfile();
    if (profile) {
      await getProfileAndSave(profile, navigation);
    } else {
      throw new Error('카카오 프로필 정보 가져오기 실패');
    }
  }, navigation);
};
