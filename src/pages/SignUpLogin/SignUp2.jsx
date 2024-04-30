import React, {useState} from 'react';
import {
  Image,
  StyleSheet,
  TextInput,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert,
  
} from 'react-native';
import {signUp} from '../../lib/auth';
import {createUser} from '../../lib/user';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth'; 

const signUpBackIcon = require('../../assets/icons/signUpBack.png');
const passwordHideIcon = require('../../assets/icons/passwordHide.png');
const {width, height} = Dimensions.get('window');

const SignUp = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassWord] = useState('');
  const [checkPassword, setCheckPassword] = useState('');
  const [nickName, setNickName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordErrorVisible, setPasswordErrorVisible] = useState(false);
  const [passwordMismatchErrorVisible, setPasswordMismatchErrorVisible] =
    useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmation, setConfirmation] = useState(null);
  const [isVerificationCodeSent, setIsVerificationCodeSent] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);

  // 인증번호 발송 함수
  const sendVerificationCode = async () => {
    try {
      const formattedPhoneNumber = '+82' + phoneNumber;
      const confirmation = await auth().signInWithPhoneNumber(
        formattedPhoneNumber,
      );
      setConfirmation(confirmation);
      setIsVerificationCodeSent(true); // 인증번호가 발송되었음을 표시합니다.
      console.log('인증번호가 성공적으로 발송되었습니다.');
    } catch (error) {
      console.error('인증번호 발송에 실패했습니다:', error);
      Alert.alert('인증번호 발송 실패', '인증번호 발송에 실패했습니다.');
    }
  };

  // 인증번호 확인 함수
  const confirmVerificationCode = async () => {
    try {
      if (!confirmation) {
        throw new Error('확인 객체가 없습니다.'); // 예외 처리 추가
      }
      const credential = auth.PhoneAuthProvider.credential(
        confirmation.verificationId,
        verificationCode,
      );
      await auth().signInWithCredential(credential);
      console.log('사용자가 성공적으로 인증되었습니다.');
      setIsPhoneVerified(true); // 전화번호 인증이 완료되었음을 표시합니다.
      setVerificationCode(''); // 인증이 성공하면 vegrificationCode를 초기화합니다.
    } catch (error) {
      console.error('인증 오류:', error);
      Alert.alert('인증 실패', '인증에 실패했습니다.');
    }
  };
  // 비밀번호 유효성 검사 함수
  const isValidPassword = password => {
    const containsUppercase = /[A-Z]/.test(password);
    const containsLowercase = /[a-z]/.test(password);
    const containsSpecialCharacter = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isShortEnough = password.length >= 6 && password.length <= 15;
    return (
      containsUppercase &&
      containsLowercase &&
      containsSpecialCharacter &&
      isShortEnough
    );
  };

  // 비밀번호 입력 핸들러
  const handlePasswordChange = text => {
    if (text.trim() !== '') {
      const isValid = isValidPassword(text);
      if (!isValid) {
        setPasswordErrorVisible(true);
      } else {
        setPasswordErrorVisible(false);
      }
    } else {
      setPasswordErrorVisible(false);
    }
    setPassWord(text);
    checkPasswordDuplicate(text);
  };

  // 비밀번호 중복 확인 함수
  const checkPasswordDuplicate = text => {
    if (text.length > 0 && password !== text) {
      // 비밀번호 확인 입력란이 비어있는지 확인
      console.log('비밀번호가 일치하지 않습니다.');
      setPasswordMismatchErrorVisible(true);
    } else {
      console.log('비밀번호가 일치합니다.');
      setPasswordMismatchErrorVisible(false);
    }
  };

  // 패스워드 숨김 함수
  const passwordShow = () => {
    setShowPassword(!showPassword);
  };

  // 회원가입 함수
  const onSignUp = async () => {
    try {
      const {user} = await signUp({email, password});
      await createUser({
        id: user.uid,
        nickName,
        email,
        phoneNumber,
      });
      navigation.goBack();
      Alert.alert('회원가입 성공');
    } catch (e) {
      console.error('회원가입 실패:', e);
      Alert.alert('회원가입 실패');
    }
  };

  // 아이디 중복 확인 함수
  const checkIdDuplicate = async () => {
    try {
      const userQuery = await firestore()
        .collection('users')
        .where('email', '==', email)
        .get();

      if (!userQuery.empty) {
        Alert.alert('중복된 이메일', '이미 사용 중인 이메일입니다.');
      } else {
        Alert.alert('사용 가능한 이메일', '사용할 수 있는 이메일입니다.');
      }
    } catch (error) {
      console.error('이메일 중복 확인 오류:', error);
      Alert.alert(
        '이메일 중복 확인 실패',
        '이메일 중복 확인 중 오류가 발생했습니다.',
      );
    }
  };

  // 닉네임 중복 확인 함수
  const checkNicknameDuplicate = async () => {
    try {
      const userQuery = await firestore()
        .collection('users')
        .where('nickName', '==', nickName)
        .get();

      if (!userQuery.empty) {
        Alert.alert('중복된 닉네임', '이미 사용 중인 닉네임입니다.');
      } else {
        Alert.alert('사용 가능한 닉네임', '사용할 수 있는 닉네임입니다.');
      }
    } catch (error) {
      console.error('닉네임 중복 확인 오류:', error);
      Alert.alert(
        '닉네임 중복 확인 실패',
        '닉네임 중복 확인 중 오류가 발생했습니다.',
      );
    }
  };

  return (
    <SafeAreaView>
      <View style={styles.firstContainer}>
        <TouchableOpacity style={{}} onPress={() => navigation.goBack()}>
          <Image source={signUpBackIcon} />
        </TouchableOpacity>
        <View style={styles.titleTextContainer}>
          <Text style={styles.firstTItle}>쉐어비 시작하기</Text>
          <Text style={styles.secondTitle}>
            가입을 위해 기본 정보를 입력해 주세요
          </Text>
        </View>

        <Text style={styles.idText}>아이디</Text>
        <View style={styles.idCantainer}>
          <View style={styles.idInputConainer}>
            <TextInput
              style={{fontSize: 16}}
              value={email}
              onChangeText={text => setEmail(text)}
              placeholder="이메일 형식으로 입력해주세요"
            />
          </View>
          <TouchableOpacity
            onPress={checkIdDuplicate}
            style={styles.idCheckButton}>
            <Text style={styles.checkButtonText}>중복확인</Text>
          </TouchableOpacity>
        </View>

        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text style={styles.passwordText}>비밀번호</Text>
          {passwordErrorVisible && (
            <Text style={styles.passwordTextError}>
              * 대소문자,특수문자 포함 15자 이하로 만들어주세요.
            </Text>
          )}
        </View>
        <View style={styles.passwordContainer}>
          <View style={styles.passInputContainer}>
            <TextInput
              style={{fontSize: 16, flex: 0.96}}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={handlePasswordChange}
              placeholder="비밀번호를 입력해주세요"
            />
            <TouchableOpacity onPress={passwordShow}>
              <Image
                source={passwordHideIcon}
                style={{width: 16, height: 16}}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text style={styles.passwordCheckText}>비밀번호 확인</Text>
          {passwordMismatchErrorVisible && (
            <Text style={styles.passwordCheckTextError}>
              * 비밀번호가 일치하지 않습니다.
            </Text>
          )}
        </View>
        <View style={styles.passwordCheckContainer}>
          <View style={styles.passwordCheckInputContainer}>
            <TextInput
              style={{fontSize: 16}}
              secureTextEntry={true}
              placeholder="비밀번호를 확인해주세요"
              value={checkPassword}
              onChangeText={text => {
                setCheckPassword(text);
                checkPasswordDuplicate(text);
              }}
            />
          </View>
        </View>

        <Text style={styles.nickNameText}>닉네임</Text>
        <View style={styles.nickNameContainer}>
          <View style={styles.nickNameInputContainer}>
            <TextInput
              style={{fontSize: 16}}
              value={nickName}
              onChangeText={setNickName}
              placeholder="한글,영문 최대 30자까지 가능"
            />
          </View>
          <TouchableOpacity
            onPress={checkNicknameDuplicate}
            style={styles.idCheckButton}>
            <Text style={styles.checkButtonText}>중복확인</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.phoneNumberText}>전화번호</Text>
        <View style={styles.phoneNumberContainer}>
          <View style={styles.phoneNumberInputContainer}>
            <TextInput
              style={{fontSize: 16}}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="- 제외 휴대전화 번호"
            />
          </View>
          <TouchableOpacity
            onPress={sendVerificationCode}
            style={[styles.numberButton]}>
            <Text style={styles.numberButtonText}>인증번호 발송</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.phoneNumberContainer}>
          <View style={styles.phoneNumberInputContainer}>
            <TextInput
              style={{fontSize: 16}}
              value={verificationCode}
              onChangeText={setVerificationCode}
              placeholder="인증번호를 입력해주세요"
            />
          </View>
          <TouchableOpacity
            onPress={confirmVerificationCode}
            style={[
              styles.numberButton,
              verificationCode ? {} : {backgroundColor: '#ccc'},
            ]}
            disabled={!verificationCode}>
            <Text style={styles.numberButtonText}>확인</Text>
          </TouchableOpacity>
        </View>
            
        <TouchableOpacity
          onPress={onSignUp}
          style={[
            styles.signInButton,
            isPhoneVerified ? {} : {backgroundColor: '#ccc'},
          ]}
          disabled={!isPhoneVerified}>
          <Text style={[styles.signInText,
        !isPhoneVerified ? {} : {color:'#07AC7D'}]}>완료</Text>
        </TouchableOpacity>
      </View>
      
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  titleTextContainer: {
    padding: 16,
    gap: 8,
  },
  firstTItle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#07AC7D',
  },
  secondTitle: {
    fontSize: 16,
    color: '#a5a5a5',
  },
  idText: {
    marginLeft: 16,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#07AC7D',
  },
  idCantainer: {
    paddingHorizontal: 25,
    marginTop: 7,
    flexDirection: 'row',
    gap: 7,
    height: height / 25,
  },
  idInputConainer: {
    justifyContent: 'center',
    paddingLeft: 10,
    borderWidth: 1,
    borderRadius: 4,
    backgroundColor: '#fff',
    width: width / 1.7,
  },
  idCheckButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    backgroundColor: '#fff',
    backgroundColor: '#07AC7D',
    width: width / 3.5,
  },
  checkButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  passwordText: {
    marginLeft: 16,
    marginTop: 16,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#07AC7D',
  },
  passwordTextError: {
    marginLeft: '4%',
    marginTop: 16,
    fontSize: 12,
    fontWeight: 'bold',
    color: 'red',
  },
  passwordContainer: {
    paddingHorizontal: 25,
    marginTop: 7,
    flexDirection: 'row',
    gap: 7,
    height: height / 25,
  },
  passInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    borderWidth: 1,
    borderRadius: 4,
    backgroundColor: '#fff',
    width: width / 1.7,
  },
  passwordCheckText: {
    marginLeft: 16,
    marginTop: 16,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#07AC7D',
  },
  passwordCheckTextError: {
    marginLeft: '5%',
    paddingTop: 16,
    fontSize: 12,
    fontWeight: 'bold',
    color: 'red',
  },
  passwordCheckContainer: {
    paddingHorizontal: 25,
    marginTop: 7,
    flexDirection: 'row',
    gap: 7,
    height: height / 25,
  },
  passwordCheckInputContainer: {
    justifyContent: 'center',
    paddingLeft: 10,
    borderWidth: 1,
    borderRadius: 4,
    backgroundColor: '#fff',
    width: width / 1.7,
  },
  nickNameText: {
    marginLeft: 16,
    marginTop: 16,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#07AC7D',
  },
  nickNameContainer: {
    paddingHorizontal: 25,
    marginTop: 7,
    flexDirection: 'row',
    gap: 7,
    height: height / 25,
  },
  nickNameInputContainer: {
    justifyContent: 'center',
    paddingLeft: 10,
    borderWidth: 1,
    borderRadius: 4,
    backgroundColor: '#fff',
    width: width / 1.7,
  },
  phoneNumberText: {
    marginLeft: 16,
    marginTop: 16,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#07AC7D',
  },
  phoneNumberContainer: {
    paddingHorizontal: 25,
    marginTop: 7,
    flexDirection: 'row',
    gap: 7,
    height: height / 25,
  },
  phoneNumberInputContainer: {
    justifyContent: 'center',
    paddingLeft: 10,
    borderWidth: 1,
    borderRadius: 4,
    backgroundColor: '#fff',
    width: width / 1.7,
  },
  numberButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    backgroundColor: '#fff',
    backgroundColor: '#07AC7D',
    width: width / 3.5,
  },
  numberButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  signInButton: {
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 35,
    marginTop: 16,
    backgroundColor: '#D7FFF3',
    width: width / 1.2,
    height: height / 20,
  },
  signInText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default SignUp;
