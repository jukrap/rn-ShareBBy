import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import LoginToast from './LoginToast';

const passwordHideIcon = require('../../assets/icons/passwordHide.png');
const {width, height} = Dimensions.get('window');

const SignUpPassword = ({onNextStep}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLengthValid, setIsLengthValid] = useState(false);
  const [isUppercaseValid, setIsUppercaseValid] = useState(false);
  const [isSpecialCharacterValid, setIsSpecialCharacterValid] = useState(false);
  const [showToast, setShowToast] = useState(false); // 토스트 표시 여부 상태 추가
  const [toastMessage, setToastMessage] = useState(''); // 토스트 메시지 상태 추가

  const handleNext = () => {
    if (password.trim() === '') {
      setToastMessage('비밀번호를 입력해주세요.'); // 토스트 메시지 설정
      setShowToast(true); // 토스트 표시
      return;
    }
    if (password !== confirmPassword) {
      setToastMessage('비밀번호가 일치하지 않습니다.'); // 토스트 메시지 설정
      setShowToast(true); // 토스트 표시
      return;
    }
    if (!isLengthValid || !isUppercaseValid || !isSpecialCharacterValid) {
      setToastMessage('비밀번호가 조건을 충족하지 않습니다.'); // 토스트 메시지 설정
      setShowToast(true); // 토스트 표시
      return;
    }
    onNextStep({password});
  };

  // 비밀번호 유효성 검사 함수
  const isValidPassword = password => {
    const containsUppercase = /[A-Z]/.test(password);
    const containsLowercase = /[a-z]/.test(password);
    const containsSpecialCharacter = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 6 && password.length <= 15;

    setIsLengthValid(isLongEnough);
    setIsUppercaseValid(containsUppercase);
    setIsSpecialCharacterValid(containsSpecialCharacter);

    return (
      containsUppercase &&
      containsLowercase &&
      containsSpecialCharacter &&
      isLongEnough
    );
  };

  const handlePasswordChange = text => {
    // 한글이 포함되어 있으면 입력을 막고 알림을 표시합니다.
    if (/[\uAC00-\uD7A3]/.test(text)) {
      setToastMessage('비밀번호에는 한글을 사용할 수 없습니다.'); // 토스트 메시지 설정
      setShowToast(true); // 토스트 표시
      return;
    }
    setPassword(text);
    if (text.trim() !== '') {
      const isValid = isValidPassword(text);
      if (!isValid) {
        // 비밀번호가 유효하지 않으면 여기에서 상태를 설정하거나 처리할 수 있습니다.
      }
    }
  };

  const passwordShow = () => {
    setShowPassword(!showPassword);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={150}
      style={styles.container}>
      <View style={styles.secondContainer}>
        <View>
          <View>
            <View style={styles.textContainer}>
              <Text style={styles.text}>비밀번호를 입력해주세요.</Text>
            </View>
          </View>
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={styles.passwordInput}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={handlePasswordChange}
              placeholder="비밀번호 입력"
              placeholderTextColor={'#A7A7A7'}
              autoFocus={true}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={passwordShow}>
              <Image
                source={passwordHideIcon}
                style={styles.passwordHideIcon}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.validationTextContainer}>
            <Text
              style={[
                styles.validationText,
                isLengthValid ? styles.valid : styles.invalid,
              ]}>
              6자 이상
            </Text>
            <Text
              style={[
                styles.validationText,
                isUppercaseValid ? styles.valid : styles.invalid,
              ]}>
              대문자 포함
            </Text>
            <Text
              style={[
                styles.validationText,
                isSpecialCharacterValid ? styles.valid : styles.invalid,
              ]}>
              특수문자 포함
            </Text>
          </View>
          <TextInput
            style={styles.passwordConfirmInput}
            secureTextEntry={true}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="비밀번호 확인"
            placeholderTextColor={'#A7A7A7'}
            autoCapitalize="none"
          />
        </View>
        <View>
          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>다음</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* 토스트 컴포넌트 */}
      <LoginToast
        text={toastMessage}
        visible={showToast}
        handleCancel={() => setShowToast(false)}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  secondContainer: {
    justifyContent: 'space-between',
    flex: 1,
  },
  textContainer: {
    marginTop: 40,
    marginLeft: 16,
    marginBottom: 40,
  },
  passwordInputContainer: {
    flexDirection: 'row',
  },
  passwordInput: {
    width: width * 0.92,
    borderBottomWidth: 2,
    borderColor: '#07AC7D',
    marginHorizontal: 16,
    paddingBottom: 8,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  passwordHideIcon: {
    position: 'absolute',
    width: 24,
    height: 24,
    right: width * 0.04,
  },
  text: {
    color: '#07AC7D',
    fontWeight: 'bold',
    fontSize: 24,
  },
  button: {
    borderRadius: 10,
    backgroundColor: '#07AC7D',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 16,
    marginBottom: 36,
    height: 55,
  },
  validationTextContainer: {
    flexDirection: 'row',
    marginBottom: 40,
    paddingHorizontal: 16,
  },
  validationText: {
    marginRight: 16,
  },
  valid: {
    color: '#07AC7D',
    fontWeight: 'bold',
  },
  invalid: {
    color: 'red',
  },
  passwordConfirmInput: {
    width: width * 0.92,
    borderBottomWidth: 2,
    borderColor: '#07AC7D',
    marginHorizontal: 16,
    paddingBottom: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SignUpPassword;
