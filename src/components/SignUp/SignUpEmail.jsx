// SignUpEmail.jsx
import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import firestore from '@react-native-firebase/firestore'; // firestore import 추가

const SignUpEmail = ({onNextStep}) => {
  const [email, setEmail] = useState('');

  const validateEmail = email => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  };

  const handleNext = async () => {
    if (!validateEmail(email)) {
      Alert.alert('유효하지 않은 이메일', '올바른 이메일 형식이 아닙니다.');
      return;
    }

    try {
      // 파이어베이스에서 이메일 중복 확인
      const userQuery = await firestore()
        .collection('users')
        .where('email', '==', email)
        .get();
      if (!userQuery.empty) {
        // 중복된 이메일이 있으면 알림 표시
        Alert.alert('중복된 이메일', '이미 사용 중인 이메일입니다.');
      } else {
        // 중복된 이메일이 없으면 다음 단계로 진행
        onNextStep({email});
      }
    } catch (error) {
      console.error('이메일 중복 확인 오류:', error);
      Alert.alert(
        '이메일 중복 확인 실패',
        '이메일 중복 확인 중 오류가 발생했습니다.',
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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
          />
        </View>
        <View>
          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>다음</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  secondContariner: {
    justifyContent: 'space-between', flex: 1
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
});

export default SignUpEmail;
