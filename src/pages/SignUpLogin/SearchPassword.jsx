import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
} from 'react-native';

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore'; // firestore import 추가
import {BackIcon2} from '../../assets/assets';

const SearchPassword = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [invalidEmail, setInvalidEmail] = useState(false);
  const [message, setMessage] = useState('');

  const handleResetPassword = async () => {
    if (!validateEmail(email)) {
      setInvalidEmail(true);
      setMessage('올바른 이메일 형식이 아닙니다.');
      return;
    } else {
      setInvalidEmail(false);
      setMessage('');
    }

    try {
      // 이메일이 존재하는지 확인
      const userSnapshot = await firestore()
        .collection('users')
        .where('email', '==', email)
        .get();
      if (userSnapshot.empty) {
        setInvalidEmail(true);
        setMessage('해당 이메일 주소가 존재하지 않습니다.');
        return;
      }
      // 이메일이 존재하면 비밀번호 재설정 이메일 전송
      await auth().sendPasswordResetEmail(email);
      setMessage('비밀번호 재설정 이메일을 전송했습니다.');
    } catch (error) {
      setMessage('비밀번호 재설정 이메일 전송 중 오류가 발생했습니다.');
    }
  };

  const validateEmail = email => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#fefffe'}}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? '1' : '30'}
        style={{flex: 1}}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image style={{marginLeft: 8}} source={BackIcon2} />
        </TouchableOpacity>
        <View style={{justifyContent: 'space-between', flex: 1}}>
          <View>
            <View style={styles.textContainer}>
              <Text style={styles.text}>비밀번호 찾기</Text>
              <Text style={styles.secondText}>
                비밀번호를 찾기 위해 이메일 인증을 진행해 주세요.
              </Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="이메일을 입력해주세요."
              placeholderTextColor={'#A7A7A7'}
              onChangeText={text => {
                setEmail(text);
                setInvalidEmail(false);
                setMessage('');
              }}
              value={email}
              autoFocus={true}
              autoCompleteType="email"
              autoCapitalize="none"
              keyboardType="email-address"
            />
            {!!message && (
              <Text
                style={[
                  styles.messageText,
                  message === '비밀번호 재설정 이메일을 전송했습니다.' &&
                    styles.blueText,
                ]}>
                {message}
              </Text>
            )}
          </View>
          <View>
            <TouchableOpacity
              style={styles.button}
              onPress={handleResetPassword}>
              <Text style={styles.buttonText}>인증 요청</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 16,
    marginBottom: 36,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  messageText: {
    color: 'red',
    fontSize: 14,
    marginLeft: 16,
    marginTop: 8,
  },
  blueText: {
    color: '#07AC7D',
  },
});

export default SearchPassword;
