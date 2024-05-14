import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Image
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Postcode from '@actbase/react-daum-postcode';
import storage from '@react-native-firebase/storage';
const {width} = Dimensions.get('window');

const addressSearch = require('../../assets/icons/addressSearch.png')

const SignUpAddress = ({
  navigation,
  checkboxState,
  email,
  nickname,
  password,
  showPostcode,
  setShowPostcode
  
}) => {
  const [address, setAddress] = useState('');


  // 주소 입력 시 state 업데이트
  const handleChangeAddress = text => {
    setAddress(text);
  };

  const onSignUp = async () => {
    try {
      console.log('회원가입 데이터:', {
        checkboxState,
        email,
        address,
        nickname,
        profileImageUrl,
      });

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
      Alert.alert('회원가입 성공');
      navigation.navigate('Login');
    } catch (error) {
      console.error('회원가입 실패:', error);
      Alert.alert('회원가입 실패');
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
          <TouchableOpacity onPress={() => setShowPostcode(true)} style={{flexDirection: 'row', borderBottomWidth: 2, borderColor: '#07AC7D',  marginHorizontal:16 }}>
            <Image style={{width:21, height:21}} source={addressSearch}/>
            
            <TextInput
              style={styles.addressTextInput}
              placeholder="지번, 도로명, 건물명으로 검색"
              placeholderTextColor={'#A7A7A7'}
              autoFocus={true}
              autoCapitalize="none"
              value={address}
              onChangeText={handleChangeAddress}
              onPress={() => setShowPostcode(true)}
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
});

export default SignUpAddress;
