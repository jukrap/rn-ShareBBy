import React, {useEffect, useState} from 'react';
import {
  Text,
  View,
  TextInput,
  Alert,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {signIn} from '../../lib/auth';
import firestore from '@react-native-firebase/firestore';

import {GoogleSignin} from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import * as KakaoLogin from '@react-native-seoul/kakao-login';
import {WEB_CLIENT_ID} from '@env';
import NaverLogin from '@react-native-seoul/naver-login';
import storage from '@react-native-firebase/storage'; // Firebase Storage 추가

const naverIcon = require('../../assets/icons/naver.png');
const kakaoIcon = require('../../assets/icons/kakao.png');
const googleIcon = require('../../assets/icons/google.png');

const LoginTitle = require('../../assets/images/LoginTitle.png');

const Login = ({navigation}) => {
  const [email, setEmail] = useState();
  const [password, setPass] = useState();
  const [userData, setUserData] = useState(null);
  const [nickName, setNickName] = useState();
  const [phoneNumber, setPhoneNumber] = useState();

  const {width, height} = Dimensions.get('window');

  useEffect(() => {
    const initializeNaverLogin = async () => {
      console.log('Initializing Naver Login');
      try {
        await NaverLogin.initialize({
          serviceUrlScheme: 'naverlogin',
          consumerKey: '8RlLfixVUV3Mc0LMjYeE',
          serviceUrlSchemeIOS: 'naverlogin',
          consumerSecret: 'HTZtyAWg2c',
          appName: 'Sharebby',
        });
        console.log('Naver Login Initialized');
      } catch (error) {
        console.error('Error initializing Naver Login:', error);
      }
    };
    initializeNaverLogin();
  }, []);

  const handleNaverLogin = async () => {
    try {
      console.log('Attempting Naver Login');
      const result = await NaverLogin.login();
      console.log('Naver Login Result:', result);
      if (result) {
        console.log('Naver Login Success');
        await getProfiles();
      } else {
        console.log('Naver Login Failed');
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

  const getProfiles = async () => {
    try {
      console.log('Fetching Naver Profile');
      // Naver Login 결과에서 액세스 토큰 추출
      const {
        successResponse: {accessToken},
      } = await NaverLogin.login();
      console.log('Naver Access Token:', accessToken);

      const profileRequestUrl = 'https://openapi.naver.com/v1/nid/me';
      const response = await fetch(profileRequestUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`, // 액세스 토큰을 헤더에 추가합니다.
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const profileData = await response.json();
        console.log('Naver Profile Data:', profileData);
        const profileImageUrl = await storage()
          .ref('dummyprofile.png') // Storage 경로 지정
          .getDownloadURL();

        // Firebase Authentication에 사용자 등록
        const {user} = await auth().createUserWithEmailAndPassword(
          profileData.response.email,
          'temporary_password',
        );
        console.log('Firebase Auth User:', user);

        // Firestore에 사용자 정보 저장
        await firestore().collection('users').doc(user.uid).set({
          id: user.uid,
          email: profileData.response.email,
          nickname: profileData.response.nickname,
          profileImage: profileImageUrl, // Firebase Storage에서 가져온 URL 사용
          // 원하는 데이터를 여기에 추가할 수 있습니다.
        });

        // Main 화면으로 이동
        navigation.navigate('Main', {
          userId: profileData.response.email,
          nickname: profileData.response.nickname,
        });
      } else {
        console.error('Failed to fetch Naver Profile:', response.status);
        Alert.alert(
          '네이버 프로필 정보 가져오기 실패',
          '네이버 프로필 정보를 가져오는 데 실패했습니다.',
        );
      }
    } catch (error) {
      console.error('네이버 프로필 정보를 가져오는 데 오류 발생:', error);
      Alert.alert(
        '네이버 프로필 정보 가져오기 오류',
        '네이버 프로필 정보를 가져오는 데 오류가 발생했습니다.',
      );
    }
  };

  useEffect(() => {
    const googleSigninConfigure = async () => {
      await GoogleSignin.configure({
        webClientId: WEB_CLIENT_ID,
      });
    };
    googleSigninConfigure();
  }, []);

  const onGoogleButtonPress = async () => {
    try {
      const {idToken} = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      await auth().signInWithCredential(googleCredential);
      const user = auth().user;

      // 사용자 정보 가져오기
      const email = user.email;
      const displayName = user.displayName;
      const photoURL = user.photoURL;

      console.log('구글 사용자 정보:', {
        id: user.uid, // 유저 ID 사용
        email: email,
        nickName: displayName,
        photoURL: photoURL,
      });

      // Firestore에 사용자 정보 저장
      await firestore().collection('users').doc(user.uid).set({
        id: user.uid,
        email: email,
        nickName: displayName,
        photoURL: photoURL,
      });

      // Main 화면으로 이동
      navigation.navigate('Main', {userId: email, nickname: displayName});
    } catch (error) {
      console.error('구글 로그인 오류:', error);
      Alert.alert('구글 로그인 실패');
    }
  };

  const kakaoLogins = async () => {
    try {
      const result = await KakaoLogin.login();
      console.log('Kakao Login Result:', result);
      if (result) {
        console.log('Kakao Login Success');
        await getKakaoProfile();
      } else {
        console.log('Kakao Login Failed');
        Alert.alert('카카오 로그인 실패', '카카오 로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('카카오 로그인 오류:', error);
      Alert.alert(
        '카카오 로그인 오류',
        '카카오 로그인 중 오류가 발생했습니다.',
      );
    }
  };

  const getKakaoProfile = async () => {
    try {
      console.log('Fetching Kakao Profile');
      const profile = await KakaoLogin.getProfile();
      console.log('Kakao Profile:', profile);
      if (profile) {
        console.log('Kakao Profile Success');
        await registerKakaoUser(profile);
      } else {
        console.log('Failed to get Kakao profile');
        Alert.alert(
          '카카오 프로필 정보 가져오기 실패',
          '카카오 프로필 정보를 가져오는 데 실패했습니다.',
        );
      }
    } catch (error) {
      console.error('Failed to get Kakao profile:', error);
      Alert.alert(
        '카카오 프로필 정보 가져오기 오류',
        '카카오 프로필 정보를 가져오는 데 오류가 발생했습니다.',
      );
    }
  };

  const registerKakaoUser = async profile => {
    try {
      // Firebase Authentication에 사용자 등록
      const {user} = await auth().createUserWithEmailAndPassword(
        `${profile.email}`,
        'temporary_password',
      );
      console.log('Firebase Auth User:', user);

      // Firestore에 사용자 정보 저장
      await firestore().collection('users').doc(user.uid).set({
        id: user.uid,
        email: profile.email,
        nickname: profile.nickname,
        // 다른 사용자 정보도 필요한 경우에 추가할 수 있습니다.
      });

      // Main 화면으로 이동
      navigation.navigate('Main', {
        userId: user.uid,
        nickname: profile.nickname,
      });
    } catch (error) {
      console.error('사용자 등록 및 정보 저장 중 오류 발생:', error);
      Alert.alert('오류', '사용자 등록 및 정보 저장 중 오류가 발생했습니다.');
    }
  };

  const onSignIn = async () => {
    try {
      const {user} = await signIn({email, password});
      // 로그인 정보 가져오기
      const userCollection = firestore().collection('users');
      console.log((await userCollection.doc(user.uid).get()).data());
      navigation.navigate('Main', {userId: user.uid});
    } catch (e) {
      console.error('로그인 실패:', e);
      Alert.alert('로그인 실패');
    }
  };

  return (
    <View style={styles.firstContainer}>
      <View>
        <Image source={LoginTitle} />
        <View style={styles.titleTextContainer}>
          <View>
            <Text style={styles.firstTitleText}>당신의 취미를</Text>
          </View>
          <View>
            <Text style={styles.secondTitleText}>함께할 준비가 되셨나요?</Text>
          </View>
        </View>

        <View style={styles.loginTextInput}>
          <TextInput
            style={{paddingLeft: 12}}
            value={email}
            placeholder="아이디를 입력해주세요"
            onChangeText={setEmail}
            placeholderTextColor={'#A7A7A7'}
          />
        </View>
        <View style={styles.passwordTextInput}>
          <TextInput
            style={{paddingLeft: 12}}
            value={password}
            secureTextEntry={true}
            placeholder="비밀번호를 입력해주세요"
            onChangeText={setPass}
            placeholderTextColor={'#A7A7A7'}
          />
        </View>

        <TouchableOpacity onPress={onSignIn} style={styles.loginButton}>
          <Text style={styles.loginButtonText}>로그인</Text>
        </TouchableOpacity>

        <View style={styles.searchContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('SearchId')}>
            <Text style={styles.searchId}>아이디 찾기</Text>
          </TouchableOpacity>
          <View>
            <View style={styles.searchBar} />
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('SearchPassword')}>
            <Text style={styles.searchPassword}>비밀번호 찾기</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('SignUp')}
          style={styles.signInButton}>
          <Text style={styles.signInText}>Are You Ready 가입하기</Text>
        </TouchableOpacity>

        <View style={styles.orContainer}>
          <View style={styles.orLeftBar} />
          <Text style={styles.orText}>또는</Text>
          <View style={styles.orRightBar} />
        </View>
        <View style={styles.loginIconCantainer}>
          <TouchableOpacity onPress={handleNaverLogin}>
            <Image source={naverIcon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={kakaoLogins}>
            <Image source={kakaoIcon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onGoogleButtonPress}>
            <Image source={googleIcon} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  firstContainer: {
    flex: 0.9,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eef0ed',
  },
  titleTextContainer: {
    alignSelf: 'center',
    alignItems: 'center',
  },
  firstTitleText: {
    color: '#07AC7D',
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondTitleText: {
    color: '#07AC7D',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loginTextInput: {
    backgroundColor: '#d9d9d9',
    borderRadius: 10,
    flex: 0.12,
    justifyContent: 'center',
    marginTop: 44,
    marginBottom: 13,
  },
  passwordTextInput: {
    backgroundColor: '#d9d9d9',
    borderRadius: 10,
    flex: 0.12,
    justifyContent: 'center',
  },
  loginButton: {
    borderRadius: 10,
    flex: 0.12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 13,
    backgroundColor: '#07AC7D',
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
  },
  searchId: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#a7a7a7',
  },
  searchBar: {
    borderWidth: 1,
    flex: 1,
    marginHorizontal: 10,
  },
  searchPassword: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#a7a7a7',
  },
  signInButton: {
    borderRadius: 10,

    backgroundColor: '#D7FFF3',
    flex: 0.12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 13,
  },
  signInText: {
    color: '#07AC7D',
    fontWeight: 'bold',
    fontSize: 15,
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 13,
  },
  orLeftBar: {
    flex: 1,
    height: 1,
    backgroundColor: '#07AC7D',
    marginTop: 23,
  },
  orText: {
    marginHorizontal: 13,
    marginTop: 23,
    color: '#07AC7D',
    fontWeight: 'bold',
  },
  orRightBar: {
    flex: 1,
    height: 1,
    backgroundColor: '#07AC7D',
    marginTop: 23,
  },
  loginIconCantainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 16,
  },
});

export default Login;
