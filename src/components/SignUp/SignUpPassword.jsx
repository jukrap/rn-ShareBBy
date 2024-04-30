import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Dimensions,
  TextInput,
  Alert,
} from 'react-native';

const passwordHideIcon = require('../../assets/icons/passwordHide.png');
const {width, height} = Dimensions.get('window');

const SignUpPassword = ({onNextStep}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLengthValid, setIsLengthValid] = useState(false);
  const [isUppercaseValid, setIsUppercaseValid] = useState(false);
  const [isSpecialCharacterValid, setIsSpecialCharacterValid] = useState(false);

  const handleNext = () => {
    if (password.trim() === '') {
      Alert.alert('비밀번호 입력', '비밀번호를 입력해주세요.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('비밀번호 확인', '비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!isLengthValid || !isUppercaseValid || !isSpecialCharacterValid) {
      Alert.alert('유효성 검사', '비밀번호가 조건을 충족하지 않습니다.');
      return;
    }
    onNextStep({password}); // 비밀번호 데이터만 전달
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
      Alert.alert('한글 사용 불가', '비밀번호에는 한글을 사용할 수 없습니다.');
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
    <SafeAreaView style={styles.container}>
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
            />
            <TouchableOpacity onPress={passwordShow}>
              <Image
                source={passwordHideIcon}
                style={styles.passwordHideIcon}
              />
            </TouchableOpacity>
          </View>
          <View
            style={styles.validationTextContainer}>
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
          />
        </View>
        <View>
          <TouchableOpacity
            style={styles.button}
            onPress={handleNext}>
            <Text style={styles.buttonText}>
              다음
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
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
    marginBottom: 95,
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
    marginBottom: 40,
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonText: {
    color: '#fff', fontSize: 16, fontWeight: 'bold'
  }
});

export default SignUpPassword;
