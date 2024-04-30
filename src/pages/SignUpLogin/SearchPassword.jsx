// SignPassword.jsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Alert, Image, Modal} from 'react-native';

import auth from '@react-native-firebase/auth';

const backIcon = require('../../assets/icons/back.png');


const SignPassword = ({ navigation }) => {
  const [email, setEmail] = useState('');
  

  const handleResetPassword = async () => {
    if (!validateEmail(email)) {
      Alert.alert('유효하지 않은 이메일', '올바른 이메일 형식이 아닙니다.');
      return;
    }
    try {
      await auth().sendPasswordResetEmail(email);
      Alert.alert('이메일 전송 성공', '비밀번호 재설정 이메일을 전송했습니다.');
    } catch (error) {
      console.error('비밀번호 재설정 이메일 전송 오류:', error);
      Alert.alert(
        '이메일 전송 실패',
        '비밀번호 재설정 이메일 전송 중 오류가 발생했습니다.',
      );
    }
  };

  const validateEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  };



  return (
    <SafeAreaView style={{ flex: 1 }}>
       <TouchableOpacity style={styles.backIcon} onPress={()=> navigation.goBack()}>
        <Image source={backIcon} />
      </TouchableOpacity>
      <View style={{ justifyContent: 'space-between', flex: 1 }}>
        <View>
          <View style={styles.textContainer}>
            <Text style={styles.text}>비밀번호 찾기</Text>
            <Text style={styles.secondText}>비밀번호를 찾기 위해 이메일 인증을 진행해 주세요.</Text>
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
          <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
            <Text style={styles.buttonText}>인증 요청</Text>
          </TouchableOpacity>
        </View>
      </View>

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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width:'80%',
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    gap:8,
    marginTop:16,
    
  },
  modalButton1: {
    backgroundColor: '#07AC7D',
    paddingVertical: 10,
    width: 130,
    borderRadius: 5,
    alignItems:'center'
  },
  modalButton: {
    backgroundColor: '#07AC7D',
    paddingVertical: 10,
    width: 130,
    borderRadius: 5,
    alignItems:'center'
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SignPassword;
