import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Text,
  TextInput,
  Dimensions,
  FlatList,
} from 'react-native';
import firestore from '@react-native-firebase/firestore'; // firebase 대신 firestore만 import
import auth from '@react-native-firebase/auth'; // Firebase auth 모듈 추가
import signUpBackIcon from '../../assets/icons/signUpBack.png';


const { width, height } = Dimensions.get('window');

const SearchLogin = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isVerificationCodeSent, setIsVerificationCodeSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [userEmail, setUserEmail] = useState('');

  const saveUserPhoneNumber = async (phoneNumber, email) => {
    try {
      await firestore().collection('users').doc(phoneNumber).set({
        email: email
      });
      console.log('전화번호와 이메일이 저장되었습니다.');
    } catch (error) {
      console.error('데이터 저장 중 오류 발생:', error);
    }
  };
  
  const getUserEmailByPhoneNumber = async (phoneNumber) => {
    try {
      const doc = await firestore().collection('users').doc(phoneNumber).get();
      if (doc.exists) {
        return doc.data().email;
      } else {
        console.log('해당 전화번호에 대한 사용자 데이터가 없습니다.');
        return null;
      }
    } catch (error) {
      console.error('데이터 조회 중 오류 발생:', error);
      return null;
    }
  };
  

  const sendVerificationCode = async () => {
    try {
      const formattedPhoneNumber = '+82' + phoneNumber;
      const confirmation = await auth().signInWithPhoneNumber(formattedPhoneNumber);
      setConfirmation(confirmation);
      setIsVerificationCodeSent(true); // 인증번호가 발송되었음을 표시합니다.
      console.log('인증번호가 성공적으로 발송되었습니다.');
    } catch (error) {
      console.error('인증번호 발송에 실패했습니다:', error);
    }
  };

  const confirmVerificationCode = async () => {
    try {
      if (!confirmation) {
        throw new Error('확인 객체가 없습니다.'); // 예외 처리 추가
      }
      const credential = auth.PhoneAuthProvider.credential(confirmation.verificationId, verificationCode);
      await auth().signInWithCredential(credential);
      console.log('사용자가 성공적으로 인증되었습니다.');
      setIsPhoneVerified(true); // 전화번호 인증이 완료되었음을 표시합니다.
      setVerificationCode(''); // 인증이 성공하면 verificationCode를 초기화합니다.
      const email = auth().currentUser.email;
      setUserEmail(email);
      // 전화번호와 이메일을 데이터베이스에 저장
      saveUserPhoneNumber(phoneNumber, email);
    } catch (error) {
      console.error('인증 오류:', error);
    }
  };
  

  return (
    <SafeAreaView>
      <View style={styles.firstContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={signUpBackIcon} />
        </TouchableOpacity>
        <View style={styles.titleTextContainer}>
          <Text style={styles.firstTItle}>아이디 찾기</Text>
          <Text style={styles.secondTitle}>
            아이디를 찾기 위해 정보를 입력해 주세요
          </Text>
        </View>
      </View>
      <Text style={styles.phoneNumberText}>전화번호</Text>
      <View style={styles.phoneNumberContainer}>
        <View style={styles.phoneNumberInputContainer}>
          <TextInput
            style={{fontSize: 16}}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="- 제외 휴대전화 번호"
          />
        </View>
        <TouchableOpacity
          onPress={sendVerificationCode}
          style={[styles.numberButton]}>
          <Text style={styles.numberButtonText}>인증번호 발송</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.phoneNumberContainer}>
        <View style={styles.phoneNumberInputContainer}>
          <TextInput
            style={{fontSize: 16}}
            value={verificationCode}
            onChangeText={setVerificationCode}
            placeholder="인증번호를 입력해주세요"
          />
        </View>
        <TouchableOpacity
          onPress={confirmVerificationCode}
          style={[
            styles.numberButton,
            verificationCode ? {} : {backgroundColor: '#ccc'},
          ]}
          disabled={!verificationCode}>
          <Text style={styles.numberButtonText}>확인</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
  style={[
    styles.signInButton,
    isPhoneVerified ? {} : {backgroundColor: '#ccc'},
  ]}
  disabled={!isPhoneVerified}
  onPress={async () => {
    const email = await getUserEmailByPhoneNumber(phoneNumber);
    if (email) {
      console.log('사용 중인 아이디:', email);
      // 사용자 아이디를 화면에 출력하거나 다른 작업을 수행할 수 있습니다.
      Alert.alert('사용 중인 아이디:', email);
    } else {
      console.log('해당 전화번호에 대한 사용자 데이터가 없습니다.');
    }
  }}>
  <Text style={[styles.signInText,
    !isPhoneVerified ? {} : {color:'#07AC7D'}]}>완료</Text>
</TouchableOpacity>


      
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  titleTextContainer: {
    padding: 16,
    gap: 8,
  },
  firstTItle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#07AC7D',
  },
  secondTitle: {
    fontSize: 16,
    color: '#a5a5a5',
  },
  phoneNumberText: {
    marginLeft: 16,
    marginTop: 16,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#07AC7D',
  },
  phoneNumberContainer: {
    paddingHorizontal: 25,
    marginTop: 7,
    flexDirection: 'row',
    gap: 7,
    height: height / 25,
  },
  phoneNumberInputContainer: {
    justifyContent: 'center',
    paddingLeft: 10,
    borderWidth: 1,
    borderRadius: 4,
    backgroundColor: '#fff',
    width: width / 1.7,
  },
  numberButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    backgroundColor: '#fff',
    backgroundColor: '#07AC7D',
    width: width / 3.5,
  },
  numberButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  signInButton: {
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 35,
    marginTop: 16,
    backgroundColor: '#D7FFF3',
    width: width / 1.2,
    height: height / 20,
  },
  signInText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default SearchLogin;
