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

import {
  GoogleSignin,

} from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import * as KakaoLogin from '@react-native-seoul/kakao-login';
import {WEB_CLIENT_ID} from '@env';
import {NaverLogin} from '@react-native-seoul/naver-login';

const naverIcon = require('../../assets/icons/naver.png');
const kakaoIcon = require('../../assets/icons/kakao.png');
const googleIcon = require('../../assets/icons/google.png')

const LoginTitle = require('../../assets/images/LoginTitle.png');


const Login = ({navigation}) => {
  const [email, setEmail] = useState();
  const [password, setPass] = useState();
  const [userData, setUserData] = useState(null);
  const [nickName, setNickName] = useState();
  const [phoneNumber, setPhoneNumber] = useState();

  const {width, height} = Dimensions.get('window');

  // useEffect(() => {
  //     NaverLogin.init({
  //       kUrlSampleAppUrlScheme: 'http://ShareBBy.com/login',
  //       kConsumerKey: '9RPfcXnZ_6q8GOxs3bCi',
  //       kConsumerSecret: 'xaSokjPvNy',
  //       kServiceAppName: 'SharBBy',
  //     });
  //   }, []);

  const handleNaverLogin = async () => {
    try {
      const result = await NaverLogin.login();
      if (result) {
        const profile = await getProfile();
        setUserData(profile);
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
      const { idToken } = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      await auth().signInWithCredential(googleCredential);
      const currentUser = auth().currentUser;
  
      // 사용자 정보 가져오기
      const email = currentUser.email;
      const displayName = currentUser.displayName;
      const photoURL = currentUser.photoURL;
  
      console.log('구글 사용자 정보:', {
        email: email,
        displayName: displayName,
        photoURL: photoURL,
      });
  
      // Firestore에 사용자 정보 저장
      await firestore().collection('users').doc(currentUser.uid).set({
        email: email,
        displayName: displayName,
        photoURL: photoURL,
      });
  
      // Main 화면으로 이동
      navigation.navigate('Main');
    } catch (error) {
      console.error('구글 로그인 오류:', error);
      Alert.alert('구글 로그인 실패');
    }
  };
  

  const kakaoLogins = () => {
    KakaoLogin.login()
      .then(result => {
        console.log('Login Success', JSON.stringify(result));
        getProfile();


      })
      .catch(error => {
        if (error.code === 'E_CANCELLED_OPERATION') {
          console.log('Login Cancel', error.message);
        } else {
          console.log(`Login Fail(code:${error.code})`, error.message);
        }
      });
  };

  const getProfile = () => {
    KakaoLogin.getProfile()
      .then(result => {
        console.log('GetProfile Success', JSON.stringify(result));
        const email = result.email;
        const nickName = result.nickname;
        console.log('이메일:', email);
        console.log('닉네임:', nickName);
        navigation.navigate('Main', { userId: email, nickname: nickName });
      })
      .catch(error => {
        console.log(`GetProfile Fail(code:${error.code})`, error.message);
      });
  };
  
  

  // 로그인

  // 수정할 때 사용 코드
  // await userCollection.doc(user.uid).update({nickName})
  // console.log((await userCollection.doc(user.uid).get()).data());
  // await userCollection.doc(user.uid).update({phoneNumber})
  // console.log((await userCollection.doc(user.uid).get()).data());
  
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
            <Text style={styles.firstTitleText}>
              당신의 취미를
            </Text>
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

        {/* <TextInput
                style={{ height: 40, width: 200, borderColor: 'gray', borderWidth: 1, marginBottom: 10 }}
                value={displayName}
                placeholder="Display Name"
                onChangeText={setName}
            /> */}

        <TouchableOpacity onPress={() => navigation.navigate('BottomTab')} style={styles.loginButton}>
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
   
    backgroundColor:'#D7FFF3',
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
