import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import LoginToast from './LoginToast';

const SignUpEmail = ({onNextStep}) => {
  const [email, setEmail] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const validateEmail = email => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  };

  const handleNext = async () => {
    if (!validateEmail(email)) {
      // 유효하지 않은 이메일인 경우
      setToastMessage('유효하지 않은 이메일입니다.');
      setShowToast(true);
      return;
    }

    try {
      // 파이어베이스에서 이메일 중복 확인
      const userQuery = await firestore()
        .collection('users')
        .where('email', '==', email)
        .get();
      if (!userQuery.empty) {
        // 중복된 이메일인 경우
        setToastMessage('중복된 이메일입니다. 다른 이메일을 사용해주세요.');
        setShowToast(true);
        return;
      } else {
        // 중복된 이메일이 없으면 다음 단계로 진행
        onNextStep({email});
      }
    } catch (error) {
      // 에러가 발생한 경우
      setToastMessage('오류가 발생했습니다. 나중에 다시 시도해주세요.');
      setShowToast(true);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={150}
      style={styles.container}>
      <View style={styles.secondContariner}>
        <View>
          <View style={styles.textContainer}>
            <Text style={styles.text}>이메일을 입력해주세요.</Text>
            <Text style={styles.secondText}>
              가입을 위해 이메일 인증을 진행해 주세요.
            </Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="이메일을 입력해주세요."
            placeholderTextColor={'#A7A7A7'}
            onChangeText={setEmail}
            value={email}
            autoFocus={true}
            autoCompleteType="email"
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        <View>
          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>다음</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  secondContariner: {
    justifyContent: 'space-between',
    flex: 1,
  },
  textContainer: {
    marginTop: 40,
    marginLeft: 16,
    marginBottom: 32,
  },
  text: {
    color: '#07AC7D',
    fontWeight: 'bold',
    fontSize: 24,
  },
  secondText: {
    color: '#A7A7A7',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 45,
  },
  input: {
    borderBottomWidth: 2,
    borderColor: '#07AC7D',
    marginHorizontal: 16,
    paddingBottom: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    borderRadius: 10,
    backgroundColor: '#07AC7D',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 16,
    marginBottom: 36,
    height: 55,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SignUpEmail;
