import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Dimensions, TextInput, Alert } from 'react-native';
import auth from '@react-native-firebase/auth'; 
import firestore from '@react-native-firebase/firestore';
import Postcode from '@actbase/react-daum-postcode';

const SignUpAddress = ({ navigation, checkboxState, email, nickname, password }) => {
  const { width } = Dimensions.get('window');
  const [address, setAddress] = useState('');
  const [showPostcode, setShowPostcode] = useState(false);

  // 주소 입력 시 state 업데이트
  const handleChangeAddress = (text) => {
    setAddress(text);
  };

  const onSignUp = async () => {
    try {
      // Firebase를 사용하여 회원가입 처리
      console.log('회원가입 데이터:', { checkboxState, email, password, address, nickname }); 
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // 회원 정보를 Firestore에 저장
      await firestore().collection('users').doc(user.uid).set({
        checkboxState,
        email,
        password,
        address,
        nickname
        // 기타 회원 정보 필드 추가 가능
      });

      Alert.alert('회원가입 성공');
      navigation.navigate('Login')
    } catch (error) {
      console.error('회원가입 실패:', error);
      Alert.alert('회원가입 실패');
    }
  };

  // 다음 주소 API 모달에서 주소 선택 시 처리
  const handleCompleteDaumPostcode = (data) => {
    setAddress(data.address); // 선택된 주소로 state 업데이트
    setShowPostcode(false); // 모달 닫기
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ justifyContent: 'space-between', flex: 1 }}>
        <View>
          <View>
            <View style={styles.textContainer}>
              <Text style={styles.text}>주소를 선택해주세요.</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row' }}>
            <TextInput
              style={{
                width: width * 0.92,
                borderBottomWidth: 2,
                borderColor: '#07AC7D',
                marginHorizontal: 16,
                paddingBottom: 8,
                marginBottom: 40,
                fontSize: 16,
                fontWeight: 'bold',
              }}
              placeholder="지번, 도로명, 건물명으로 검색"
              value={address}
              onChangeText={handleChangeAddress} // 주소 입력 시 state 업데이트
              onPress={() => setShowPostcode(true)} // 다음 주소 API 모달 열기
            />
          </View>
        </View>

        <View>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#07AC7D' }]}
            onPress={onSignUp}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
              회원가입 완료
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* 다음 주소 API 모달 */}
      {showPostcode && (
        <Postcode
          style={{ flex: 1, position:'absolute', width:'100%', height:'100%'}}
          jsOptions={{ animated: true }}
          onSelected={(data) => handleCompleteDaumPostcode(data)} // 다음 주소 선택 시 처리
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
  button: {
    borderRadius: 10,
    backgroundColor: '#07AC7D',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 16,
    marginBottom: 36,
  },
});

export default SignUpAddress;
