import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Image,
  Modal,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Postcode from '@actbase/react-daum-postcode';
import storage from '@react-native-firebase/storage';
import LoginToast from './LoginToast';

const {width} = Dimensions.get('window');

const addressSearch = require('../../assets/newIcons/addressSearch.png');


const SignUpAddress = ({
  navigation,
  checkboxState,
  email,
  nickname,
  password,
  showPostcode,
  setShowPostcode,
}) => {
  const [address, setAddress] = useState('');
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false); // 회원가입 성공 모달 상태 추가
  const [showToast, setShowToast] = useState(false); // 토스트 표시 여부 상태 추가
  const [toastMessage, setToastMessage] = useState(''); // 토스트 메시지 상태 추가

  // 주소 입력 시 state 업데이트
  const handleChangeAddress = text => {
    setAddress(text);
  };

  const onSignUp = async () => {
    try {
      const profileImageUrl = await storage()
        .ref('dummyprofile.png')
        .getDownloadURL();

      const userCredential = await auth().createUserWithEmailAndPassword(
        email,
        password,
      );
      const user = userCredential.user;
      await firestore().collection('users').doc(user.uid).set({
        id: user.uid,
        checkboxState,
        email,
        address,
        nickname,
        profileImage: profileImageUrl,
      });
      setIsSuccessModalVisible(true); // 회원가입 성공 시 모달 표시
    } catch (error) {
      console.error('회원가입 실패:', error);
      setToastMessage('회원가입 실패 다시 시도 해주세요'); // 토스트 메시지 설정
      setShowToast(true); // 토스트 표시
    }
  };

  // 다음 주소 API 모달에서 주소 선택 시 처리
  const handleCompleteDaumPostcode = data => {
    setAddress(data.address); // 선택된 주소로 state 업데이트
    setShowPostcode(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      keyboardVerticalOffset={150}
      style={styles.container}>
      <View style={{justifyContent: 'space-between', flex: 1}}>
        <View>
          <View>
            <View style={styles.textContainer}>
              <Text style={styles.text}>주소를 선택해주세요.</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setShowPostcode(true)}
            style={{
              flexDirection: 'row',
              borderBottomWidth: 2,
              borderColor: '#07AC7D',
              marginHorizontal: 16,
            }}>
            <Image style={{width: 21, height: 21}} source={addressSearch} />
            <TextInput
              style={styles.addressTextInput}
              placeholder="지번, 도로명, 건물명으로 검색"
              placeholderTextColor={'#A7A7A7'}
              autoFocus={true}
              autoCapitalize="none"
              value={address}
              onChangeText={handleChangeAddress}
            />
          </TouchableOpacity>
        </View>
        <View>
          <TouchableOpacity
            style={[styles.button, {backgroundColor: '#07AC7D'}]}
            onPress={onSignUp}>
            <Text style={{color: '#fff', fontSize: 16, fontWeight: 'bold'}}>
              회원가입 완료
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 회원가입 성공 모달 */}
      <Modal
        visible={isSuccessModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsSuccessModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>😍 ShareBBy 가입 성공! 😍</Text>
            <TouchableOpacity
              onPress={() => {
                setIsSuccessModalVisible(false);
                navigation.navigate('Login');
              }}>
              <Text style={styles.modalButtonText}>로그인하러 가기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <LoginToast
        text={toastMessage}
        visible={showToast}
        handleCancel={() => setShowToast(false)}
      />
      {/* 다음 주소 검색 모달 */}
      {showPostcode && (
        <Postcode
          style={{flex: 1, position: 'absolute', width: '100%', height: '100%'}}
          jsOptions={{animated: true}}
          onSelected={data => handleCompleteDaumPostcode(data)}
        />
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  textContainer: {
    marginTop: 40,
    marginLeft: 16,
    marginBottom: 95,
  },
  text: {
    color: '#07AC7D',
    fontWeight: 'bold',
    fontSize: 24,
  },
  addressTextInput: {
    width: width * 0.92,
    marginHorizontal: 8,
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
    alignItems: 'center',
  },
  modalText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalButtonText: {
    fontSize: 16,
    color: '#07AC7D',
    fontWeight: 'bold',
  },
});

export default SignUpAddress;
