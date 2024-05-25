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
  Platform,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';

const SignUpNickname = ({onNextStep}) => {
  const {width, height} = Dimensions.get('window');
  const [nickname, setNickname] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // 에러 메시지 상태 추가

  const handleNext = async () => {
    try {
      const userQuery = await firestore()
        .collection('users')
        .where('nickname', '==', nickname)
        .get();

      if (!validateNickname(nickname)) return;

      if (!userQuery.empty) {
        setErrorMessage('이미 사용 중인 닉네임입니다.');
      } else {
        onNextStep({nickname});
        setNickname(''); // 닉네임 초기화
        setErrorMessage(''); // 에러 메시지 초기화
      }
    } catch (error) {
      console.error('닉네임 중복 확인 오류:', error);
      setErrorMessage('닉네임 중복 확인 중 오류가 발생했습니다.');
    }
  };

  const validateNickname = nickname => {
    if (nickname.trim().length === 0) {
      setErrorMessage('닉네임을 입력해주세요.');
      return false;
    }
    if (nickname.length > 12) {
      setErrorMessage('닉네임은 12글자 이내로 작성해주세요.');
      return false;
    }
    if (/[!@#$%^&*(),.?":{}|<>]/.test(nickname)) {
      setErrorMessage('특수문자를 사용할 수 없습니다.');
      return false;
    }
    setErrorMessage(''); // 유효한 닉네임일 경우 에러 메시지 초기화
    return true;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? '150' : '130'}
      style={styles.container}>
      <View style={{justifyContent: 'space-between', flex: 1}}>
        <View>
          <View>
            <View style={styles.textContainer}>
              <Text style={styles.text}>닉네임을 </Text>
              <Text style={styles.text}>입력해주세요.</Text>
                <Text
                  style={{
                    color: '#A7A7A7',
                    fontWeight: 'bold',
                    fontSize: 16,
                    marginTop: 45,
                  }}>
                  띄어쓰기 포함 12글자 이내로 입력해 주세요.
                </Text>
            </View>
          </View>
          <View style={{flexDirection: 'row'}}>
            <TextInput
              style={{
                width: width * 0.92,
                borderBottomWidth: 2,
                borderColor: '#07AC7D',
                marginHorizontal: 16,
                paddingBottom: 8,
                marginBottom: 8,
                fontSize: 16,
                fontWeight: 'bold',
              }}
              placeholder="닉네임 입력"
              placeholderTextColor={'#A7A7A7'}
              autoFocus={true}
              autoCapitalize="none"
              value={nickname}
              onChangeText={text => {
                setNickname(text);
                setErrorMessage(''); // 텍스트 변경 시 에러 메시지 초기화
              }}
            />
          </View>
          {errorMessage ? (
            <Text style={styles.errorMessage}>{errorMessage}</Text>
          ) : null}
        </View>

        <View>
          <TouchableOpacity
            style={[styles.button, {backgroundColor: '#07AC7D'}]}
            onPress={handleNext}>
            <Text style={{color: '#fff', fontSize: 16, fontWeight: 'bold'}}>
              다음
            </Text>
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
  textContainer: {
    marginTop: 40,
    marginLeft: 16,
    marginBottom: 45,
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
    height: 55,
  },
  errorMessage: {
    color: 'red',
    marginLeft: 16,
    marginTop: 8,
    fontSize: 14,
  },
});

export default SignUpNickname;
