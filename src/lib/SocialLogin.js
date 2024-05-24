import {Alert, Platform} from 'react-native';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin'; // statusCodes 추가
import * as KakaoLogin from '@react-native-seoul/kakao-login';
import NaverLogin from '@react-native-seoul/naver-login';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import userStore from './userStore';
import {appleAuth} from '@invertase/react-native-apple-authentication';

// 애플 로그인 처리
export const onAppleButtonPress = async navigation => {
  try {
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    });

    const {identityToken, nonce} = appleAuthRequestResponse;
    const appleCredential = auth.AppleAuthProvider.credential(
      identityToken,
      nonce,
    );
    await auth().signInWithCredential(appleCredential);

    const user = auth().currentUser;

    if (user) {
      const email = user.email;
      const displayName = user.displayName;
      const profileImageUrl = await storage()
        .ref('dummyprofile.png')
        .getDownloadURL();

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

      await AsyncStorage.setItem('userToken', user.uid);
      navigation.navigate('BottomTab');
    } else {
      console.log('사용자 정보가 없습니다.');
    }
  } catch (error) {
    if (error.code === 'auth/cancelled') {
      console.log('Apple 로그인 취소:', error.message);
    } else {
      console.log('애플 로그인 중 오류가 발생했습니다:', error.message);
    }
  }
};

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

export const handleNaverLogin = async navigation => {
  try {
    await initializeNaverLogin();
    const result = await NaverLogin.login();
    if (result) {
      userStore.setState({userToken: 'accessToken'});
      await getNaverProfiles(navigation);
    } else {
      console.log('네이버 로그인에 실패하였습니다.');
    }
  } catch (error) {
    if (error.message === 'user_cancel') {
      console.log('Naver 로그인 취소:', error.message);
    } else {
      console.log('네이버 로그인 오류:', error);
    }
  }
};

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

      const userQuerySnapshot = await firestore()
        .collection('users')
        .where('email', '==', email)
        .get();

      let user;
      if (!userQuerySnapshot.empty) {
        const userData = userQuerySnapshot.docs[0].data();
        user = await auth().signInWithEmailAndPassword(
          email,
          'temporary_password',
        );
      } else {
        const newUserCredential = await auth().createUserWithEmailAndPassword(
          email,
          'temporary_password',
        );
        user = newUserCredential.user;

        const userInfo = {
          id: user.uid,
          email: profileData.response.email,
          nickname: profileData.response.nickname,
          profileImage: profileImageUrl,
        };

        await firestore().collection('users').doc(user.uid).set(userInfo);
        await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
      }

      await AsyncStorage.setItem('userToken', user.uid);
      navigation.navigate('BottomTab');
    } else {
      console.log('네이버 프로필 정보를 가져오는 데 실패했습니다.');
    }
  } catch (error) {
    console.log('이미 사용 중인 이메일입니다.', error);
  }
};

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

      await AsyncStorage.setItem('userToken', user.uid);
      navigation.navigate('BottomTab');
    } else {
      Alert.alert('사용자 정보가 없습니다.');
    }
  } catch (error) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      console.log('Google 로그인 취소:', error.message);
    } else {
      Alert.alert(
        '구글 로그인 실패',
        `구글 로그인 중 오류가 발생했습니다: ${error.message}`,
      );
      console.log(error);
    }
  }
};

export const kakaoLogins = async navigation => {
  try {
    const result = await KakaoLogin.login();
    if (result) {
      await getKakaoProfile(navigation);
      userStore.setState({userToken: 'user.uid'});
    } else {
      console.log('카카오 로그인에 실패했습니다.');
    }
  } catch (error) {
    if (error.code === 'E_CANCELLED_OPERATION') {
      console.log('Kakao 로그인 취소:', error.message);
    } else {
      console.log('카카오 로그인 중 오류가 발생했습니다:', error.message);
    }
  }
};

const getKakaoProfile = async navigation => {
  try {
    const profile = await KakaoLogin.getProfile();
    if (profile) {
      await registerKakaoUser(profile, navigation);
    } else {
      console.log('카카오 프로필 정보를 가져오는 데 실패했습니다.');
    }
  } catch (error) {
    console.log(
      '카카오 프로필 정보를 가져오는 데 오류가 발생했습니다:',
      error.message,
    );
  }
};

const registerKakaoUser = async (profile, navigation) => {
  try {
    const email = profile.email;

    const userQuerySnapshot = await firestore()
      .collection('users')
      .where('email', '==', email)
      .get();

    let user;
    if (!userQuerySnapshot.empty) {
      const userData = userQuerySnapshot.docs[0].data();
      user = await auth().signInWithEmailAndPassword(
        email,
        'temporary_password',
      );
    } else {
      const newUserCredential = await auth().createUserWithEmailAndPassword(
        email,
        'temporary_password',
      );
      user = newUserCredential.user;

      const profileImageUrl = await storage()
        .ref('dummyprofile.png')
        .getDownloadURL();

      const userInfo = {
        id: user.uid,
        email: profile.email,
        nickname: profile.nickname,
        profileImage: profileImageUrl,
      };

      await firestore().collection('users').doc(user.uid).set(userInfo);
      await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
    }

    await AsyncStorage.setItem('userToken', user.uid);
    navigation.navigate('BottomTab');
  } catch (error) {
    console.log(
      '사용자 등록 및 정보 저장 중 오류가 발생했습니다:',
      error.message,
    );
  }
};
