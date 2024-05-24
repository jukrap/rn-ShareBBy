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
import {PasswordHideIcon} from '../../assets/assets';

const {width, height} = Dimensions.get('window');
const androidMarginTop = Platform.OS === 'android' ? 10 : 0;


const SignUpPassword = ({onNextStep}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLengthValid, setIsLengthValid] = useState(false);
  const [isUppercaseValid, setIsUppercaseValid] = useState(false);
  const [isSpecialCharacterValid, setIsSpecialCharacterValid] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleNext = () => {
    if (password.trim() === '') {
      setErrorMessage('비밀번호를 입력해주세요.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!isLengthValid || !isUppercaseValid || !isSpecialCharacterValid) {
      setErrorMessage('비밀번호가 조건을 충족하지 않습니다.');
      return;
    }
    onNextStep({password});
  };

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
    if (/[\uAC00-\uD7A3]/.test(text)) {
      setErrorMessage('비밀번호에는 한글을 사용할 수 없습니다.');
      return;
    }
    setPassword(text);
    if (text.trim() === '') {
      setIsLengthValid(false);
      setIsUppercaseValid(false);
      setIsSpecialCharacterValid(false);
    } else {
      const isValid = isValidPassword(text);
      if (!isValid) {
        setErrorMessage('');
      }
    }
  };

  const handleConfirmPasswordChange = text => {
    setConfirmPassword(text);
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const passwordShow = () => {
    setShowPassword(!showPassword);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? '150' : '130'}
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
                source={PasswordHideIcon}
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
            onChangeText={handleConfirmPasswordChange}
            placeholder="비밀번호 확인"
            placeholderTextColor={'#A7A7A7'}
            autoCapitalize="none"
          />
          {errorMessage ? (
            <Text style={styles.errorMessage}>{errorMessage}</Text>
          ) : null}
        </View>
        <View>
          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>다음</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    marginTop: androidMarginTop, 
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
  errorMessage: {
    color: 'red',
    marginLeft: 16,
    marginTop: 8,
  },
});

export default SignUpPassword;
