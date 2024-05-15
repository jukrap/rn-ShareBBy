import {Alert} from 'react-native';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import * as KakaoLogin from '@react-native-seoul/kakao-login';
import NaverLogin from '@react-native-seoul/naver-login';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import userStore from './userStore';

// 네이버 로그인 초기화
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

// 구글 로그인 초기화
const initializeGoogleLogin = async () => {
  try {
    let clientId = '';
    if (Platform.OS === 'android') {
      clientId =
        '415237944833-6hfq4ebokd06cku8s4datrda9l03p4cv.apps.googleusercontent.com';
    } else if (Platform.OS === 'ios') {
      clientId =
        '323952205702-q70ds1r3dieu2l4clkb5ohnbnonskjem.apps.googleusercontent.com';
    }

    await GoogleSignin.configure({
      webClientId:
        '323952205702-q70ds1r3dieu2l4clkb5ohnbnonskjem.apps.googleusercontent.com',
    });
  } catch (error) {
    console.error('구글 로그인 설정 오류:', error);
  }
};

// 네이버 로그인 처리
export const handleNaverLogin = async navigation => {
  try {
    await initializeNaverLogin();
    const result = await NaverLogin.login();
    if (result) {
      userStore.setState({userToken: 'accessToken'});
      await getNaverProfiles(navigation);
    } else {
      Alert.alert('네이버 로그인 실패', '네이버 로그인에 실패하였습니다.');
    }
  } catch (error) {
    console.error('네이버 로그인 오류:', error);
    Alert.alert(
      '네이버 로그인 오류',
      '네이버 로그인 중 오류가 발생하였습니다.',
    );
  }
};

// 네이버 프로필 가져오기 및 사용자 등록
const getNaverProfiles = async navigation => {
  try {
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
      const profileImageUrl = await storage()
        .ref('dummyprofile.png')
        .getDownloadURL();

      const email = profileData.response.email;

      // 이미 가입된 사용자인지 확인
      const userCredential = await auth().signInWithEmailAndPassword(
        email,
        'temporary_password',
      );
      let user = userCredential.user;

      if (!user) {
        // 가입되지 않은 사용자일 경우에만 가입 처리
        const createUserResult = await auth().createUserWithEmailAndPassword(
          email,
          'temporary_password',
        );
        user = createUserResult.user;

        // 사용자 정보를 AsyncStorage에 저장
        const userInfo = {
          id: user.uid,
          email: email,
          nickname: profileData.response.nickname,
          profileImage: profileImageUrl,
        };
        await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));

        // Firestore에 사용자 정보 저장
        await firestore().collection('users').doc(user.uid).set(userInfo);
      }

      // 사용자 토큰 및 화면 전환
      await AsyncStorage.setItem('userToken', user.uid);
      navigation.navigate('BottomTab');
    } else {
      Alert.alert(
        '네이버 프로필 정보 가져오기 실패',
        '네이버 프로필 정보를 가져오는 데 실패했습니다.',
      );
    }
  } catch (error) {
    Alert.alert('네이버 로그인 오류', '이미 사용 중인 이메일입니다.');
    console.log(error);
  }
};

// 구글 로그인 처리
export const onGoogleButtonPress = async navigation => {
  try {
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

      // 사용자 정보를 AsyncStorage에 저장 (최초 로그인 시에만 저장)
      const storedUserInfo = await AsyncStorage.getItem('userInfo');
      if (!storedUserInfo) {
        const userInfo = {
          id: user.uid,
          email: email,
          nickname: displayName,
          profileImage: profileImageUrl,
        };
        await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
      }

      // Firestore에 사용자 정보 저장 (최초 로그인 시에만 저장)
      const userDoc = await firestore().collection('users').doc(user.uid).get();
      if (!userDoc.exists) {
        const userInfo = {
          id: user.uid,
          email: email,
          nickname: displayName,
          profileImage: profileImageUrl,
        };
        await firestore().collection('users').doc(user.uid).set(userInfo);
      }

      // 사용자 토큰 및 화면 전환
      await AsyncStorage.setItem('userToken', user.uid);
      navigation.navigate('BottomTab');
    } else {
      Alert.alert('사용자 정보가 없습니다.');
    }
  } catch (error) {
    // 화면에 실패 이유를 표시
    Alert.alert(
      '구글 로그인 실패',
      `구글 로그인 중 오류가 발생했습니다: ${error.message}`,
    );
    console.log(error); // 디버깅용 로그, 필요시 주석 해제
  }
};

// 카카오 로그인 처리
export const kakaoLogins = async navigation => {
  try {
    const result = await KakaoLogin.login();
    if (result) {
      await getKakaoProfile(navigation);
      userStore.setState({userToken: 'user.uid'});
    } else {
      Alert.alert('카카오 로그인 실패', '카카오 로그인에 실패했습니다.');
    }
  } catch (error) {
    Alert.alert('카카오 로그인 오류', '카카오 로그인 중 오류가 발생했습니다.');
  }
};

// 카카오 프로필 가져오기 및 사용자 등록
const getKakaoProfile = async navigation => {
  try {
    const profile = await KakaoLogin.getProfile();
    if (profile) {
      await registerKakaoUser(profile, navigation);
    } else {
      Alert.alert(
        '카카오 프로필 정보 가져오기 실패',
        '카카오 프로필 정보를 가져오는 데 실패했습니다.',
      );
    }
  } catch (error) {
    Alert.alert(
      '카카오 프로필 정보 가져오기 오류',
      '카카오 프로필 정보를 가져오는 데 오류가 발생했습니다.',
    );
  }
};

const registerKakaoUser = async (profile, navigation) => {
  try {
    const email = profile.email;

    // 이미 가입된 사용자인지 확인
    const userCredential = await auth().signInWithEmailAndPassword(
      email,
      'temporary_password',
    );
    const user = userCredential.user;

    if (user) {
      const profileImageUrl = await storage()
        .ref('dummyprofile.png')
        .getDownloadURL();

      // 최초 로그인 시에만 AsyncStorage에 사용자 정보 저장
      const storedUserInfo = await AsyncStorage.getItem('userInfo');
      if (!storedUserInfo) {
        const userInfo = {
          id: user.uid,
          email: profile.email,
          nickname: profile.nickname,
          profileImage: profileImageUrl,
        };
        await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
      }

      // 최초 로그인 시에만 Firestore에 사용자 정보 저장
      const userDoc = await firestore().collection('users').doc(user.uid).get();
      if (!userDoc.exists) {
        const userInfo = {
          id: user.uid,
          email: profile.email,
          nickname: profile.nickname,
          profileImage: profileImageUrl,
        };
        await firestore().collection('users').doc(user.uid).set(userInfo);
      }

      // 사용자 토큰 저장 및 화면 전환
      await AsyncStorage.setItem('userToken', user.uid);
      navigation.navigate('BottomTab');
    }
  } catch (error) {
    Alert.alert('오류', '사용자 등록 및 정보 저장 중 오류가 발생했습니다.');
    console.log(error);
  }
};
