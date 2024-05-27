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

const SignUpEmail = ({onNextStep}) => {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const validateEmail = email => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  };

  const handleNext = async () => {
    if (!validateEmail(email)) {
      setErrorMessage('유효하지 않은 이메일입니다.');
      return;
    }

    try {
      const userQuery = await firestore()
        .collection('users')
        .where('email', '==', email)
        .get();
      if (!userQuery.empty) {
        setErrorMessage('중복된 이메일입니다. 다른 이메일을 사용해주세요.');
        return;
      } else {
        onNextStep({email});
      }
    } catch (error) {
      setErrorMessage('오류가 발생했습니다. 나중에 다시 시도해주세요.');
    }
  };

  const handleEmailChange = text => {
    setEmail(text);
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? '150' : '130'}
      style={styles.container}>
      <View style={styles.secondContainer}>
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
            onChangeText={handleEmailChange}
            value={email}
            autoFocus={true}
            autoCompleteType="email"
            autoCapitalize="none"
            keyboardType="email-address"
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
  errorMessage: {
    color: 'red',
    marginLeft: 16,
    marginTop: 8,
  },
});

export default SignUpEmail;
