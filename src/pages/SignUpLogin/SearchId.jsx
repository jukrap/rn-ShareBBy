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
import firestore from '@react-native-firebase/firestore'; // firestore import 추가
import LoginToast from '../../components/SignUp/LoginToast';
import LoginModal from '../../components/SignUp/LoginModal';

import {BackIcon2} from '../../assets/assets';

const SignUpEmail = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [showSignUpModal, setSignUpShowModal] = useState(false); // 모달 표시 여부 상태 추가
  const [showLoginModal, setLoginShowModal] = useState(false); // 모달 표시 여부 상태 추가
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const validateEmail = email => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  };

  const handleNext = async () => {
    if (!validateEmail(email)) {
      setToastMessage('유효하지 않은 이메일입니다.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
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
        setLoginShowModal(true);
      } else {
        // 중복된 이메일이 없으면 모달 표시
        setSignUpShowModal(true);
      }
    } catch (error) {
      // 에러가 발생한 경우
      setToastMessage('오류가 발생했습니다. 나중에 다시 시도해주세요.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const handleModalClose1 = () => {
    // 모달 닫기
    setLoginShowModal(false);
  };

  const handleLogin = () => {
    // 회원가입 화면으로 이동
    navigation.navigate('Login');
    setLoginShowModal(false);
  };

  const handleModalClose = () => {
    // 모달 닫기
    setSignUpShowModal(false);
  };

  const handleSignUp = () => {
    // 회원가입 화면으로 이동
    navigation.navigate('SignUp');
    setSignUpShowModal(false);
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#fefffe'}}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={1}
        style={{flex: 1}}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}>
          <Image style={{marginLeft:8}} source={BackIcon2} />
        </TouchableOpacity>
        <View style={{justifyContent: 'space-between', flex: 1}}>
          <View>
            <View style={styles.textContainer}>
              <Text style={styles.text}>아이디 찾기</Text>
              <Text style={styles.secondText}>
                이메일 주소를 입력하여 가입여부를 확인해 주세요.
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
              <Text style={styles.buttonText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      <LoginModal
        animationType="slide"
        visible={showSignUpModal}
        closeModal={handleModalClose}
        message="아이디 찾기 결과"
        message2="입력하신 이메일로 가입된 계정을 찾을 수 없어요"
        LeftButton="취소"
        RightButton="회원가입"
        onConfirm={handleSignUp}
      />
      <LoginModal
        animationType="slide"
        visible={showLoginModal}
        closeModal={handleModalClose1}
        message="아이디 찾기 결과"
        message2="가입되어 있는 이메일입니다."
        LeftButton="취소"
        RightButton="로그인"
        onConfirm={handleLogin}
      />
      <LoginToast
        text={toastMessage}
        visible={showToast}
        handleCancel={() => setShowToast(false)}
      />
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
    width: '80%',
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  modalButton1: {
    backgroundColor: '#A7A7A7',
    paddingVertical: 10,
    width: 130,
    borderRadius: 5,
    alignItems: 'center',
  },
  modalButton: {
    backgroundColor: '#07AC7D',
    paddingVertical: 10,
    width: 130,
    borderRadius: 5,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SignUpEmail;
