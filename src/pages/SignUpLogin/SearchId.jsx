// SignUpEmail.jsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Alert, Image, Modal} from 'react-native';
import firestore from '@react-native-firebase/firestore'; // firestore import 추가

const backIcon = require('../../assets/icons/back.png');

const SignUpEmail = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [showModal, setShowModal] = useState(false); // 모달 표시 여부 상태 추가


  const validateEmail = (email) => {
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
        Alert.alert('가입된 이메일', '같은 주소로 가입된 계정이 있어요!');
      } else {
        // 중복된 이메일이 없으면 모달 표시
        setShowModal(true);
      }
    } catch (error) {
      console.error('이메일 중복 확인 오류:', error);
      Alert.alert(
        '이메일 중복 확인 실패',
        '이메일 중복 확인 중 오류가 발생했습니다.',
      );
    }
  };

  const handleModalClose = () => {
    // 모달 닫기
    setShowModal(false);
  };

  const handleSignUp = () => {
    // 회원가입 화면으로 이동
    navigation.navigate('SignUp');
    setShowModal(false);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
       <TouchableOpacity style={styles.backIcon} onPress={()=> navigation.goBack()}>
        <Image source={backIcon} />
      </TouchableOpacity>
      <View style={{ justifyContent: 'space-between', flex: 1 }}>
        <View>
          <View style={styles.textContainer}>
            <Text style={styles.text}>아이디 찾기</Text>
            <Text style={styles.secondText}>이메일 주소를 입력하여 가입여부를 확인해 주세요.</Text>
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
            <Text style={styles.buttonText}>확인</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>아이디 찾기 결과</Text>
            <Text>입력하신 이메일로 가입된 계정을 찾을 수 없어요</Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={styles.modalButton1} onPress={handleModalClose}>
                <Text style={styles.modalButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={handleSignUp}>
                <Text style={styles.modalButtonText}>회원가입</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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

export default SignUpEmail;
