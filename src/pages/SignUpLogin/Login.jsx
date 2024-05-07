import React, {useState} from 'react';
import {
  Text,
  View,
  TextInput,
  Alert,
  Image,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {signIn} from '../../lib/auth';
import firestore from '@react-native-firebase/firestore';

import {
  onGoogleButtonPress,
  handleNaverLogin,
  kakaoLogins,
} from '../../lib/SocialLogin';
const naverIcon = require('../../assets/icons/naver.png');
const kakaoIcon = require('../../assets/icons/kakao.png');
const googleIcon = require('../../assets/icons/google.png');

const LoginTitle = require('../../assets/images/LoginTitle.png');

const Login = ({navigation}) => {

  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [isEmailValid, setIsEmailValid] = useState(false);

  const onSignIn = async () => {
    try {
      const {user} = await signIn({email, password});
      const userCollection = firestore().collection('users');
      console.log((await userCollection.doc(user.uid).get()).data());
      navigation.navigate('BottomTab');
    } catch (e) {
      console.error('로그인 실패:', e);
      Alert.alert('아이디 또는 비밀번호를 확인해주세요.');
    }
  };

  const validateEmail = email => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isValid = emailPattern.test(email);
    return isValid;
  };

  const handleEmailChange = email => {
    setEmail(email);
    const isValid = validateEmail(email);
    setIsEmailValid(isValid);
  };

  return (
    <KeyboardAvoidingView style={{flex: 1}}>
      <View style={styles.firstContainer}>
        <View>
          <Image source={LoginTitle} />
          <View style={styles.titleTextContainer}>
            <View>
              <Text style={styles.firstTitleText}>당신의 취미를</Text>
            </View>
            <View>
              <Text style={styles.secondTitleText}>
                함께할 준비가 되셨나요?
              </Text>
            </View>
          </View>

          <View style={styles.loginTextInput}>
            <TextInput
              style={{paddingLeft: 12}}
              value={email}
              placeholder="아이디를 입력해주세요"
              onChangeText={handleEmailChange} // 이메일 변경 핸들러로 변경
              placeholderTextColor={'#A7A7A7'}
              autoCompleteType="email"
              autoCapitalize="none"
              keyboardType="email-address"
              
            />
          </View>

          <View style={styles.passwordTextInput}>
            <TextInput
              style={{paddingLeft: 12}}
              value={password}
              placeholder="비밀번호를 입력해주세요"
              onChangeText={setPassword}
              placeholderTextColor={'#A7A7A7'}
              autoCapitalize="none"
              secureTextEntry={true}
            />
          </View>

          <TouchableOpacity
            onPress={onSignIn}
            style={[
              styles.loginButton,
              !isEmailValid && {backgroundColor: '#A7A7A7'},
            ]}
            disabled={!isEmailValid} // 이메일이 유효하지 않으면 버튼 비활성화
          >
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
            <TouchableOpacity onPress={() => handleNaverLogin(navigation)}>
              <Image source={naverIcon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => kakaoLogins(navigation)}>
              <Image source={kakaoIcon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onGoogleButtonPress(navigation)}>
              <Image source={googleIcon} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
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
    flex: Platform.OS === 'android' ? 0.15 : 0.12,
    justifyContent: 'center',
    marginTop: 44,
    marginBottom: 13,
  },
  passwordTextInput: {
    backgroundColor: '#d9d9d9',
    borderRadius: 10,
    flex: Platform.OS === 'android' ? 0.15 : 0.12,
    justifyContent: 'center',
  },
  loginButton: {
    borderRadius: 10,
    flex: Platform.OS === 'android' ? 0.15 : 0.12,
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
    flex: Platform.OS === 'android' ? 0.15 : 0.12,
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
