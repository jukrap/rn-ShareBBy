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
} from 'react-native';
import firestore from '@react-native-firebase/firestore';

const SignUpNickname = ({onNextStep}) => {
  const {width, height} = Dimensions.get('window');
  const [nickname, setNickname] = useState('');

  const handleNext = async () => {
    try {
      const userQuery = await firestore()
        .collection('users')
        .where('nickname', '==', nickname)
        .get();

      if (nickname.trim().length === 0) {
        Alert.alert('닉네임 입력', '닉네임을 입력해주세요.');
        return;
      }
      if (nickname.length > 12) {
        Alert.alert('닉네임 길이 초과', '닉네임은 12글자 이내로 작성해주세요.');
        return;
      }
      if (/[!@#$%^&*(),.?":{}|<>]/.test(nickname)) {
        Alert.alert('특수문자 사용 안됨', '특수문자를 사용할 수 없습니다.');
        return;
      }
      if (!userQuery.empty) {
        Alert.alert('중복된 닉네임', '이미 사용 중인 닉네임입니다.');
      } else {
        onNextStep({nickname});
      }
    } catch (error) {
      console.error('닉네임 중복 확인 오류:', error);
      Alert.alert(
        '닉네임 중복 확인 실패',
        '닉네임 중복 확인 중 오류가 발생했습니다.',
      );
    }
  };

  const handleInfo = () => {
    Alert.alert(
      '닉네임 안내',
      '띄어쓰기 포함 12글자 이하로 입력해 주세요.',
    );
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
              <Text style={styles.text}>닉네임을 </Text>
              <Text style={styles.text}>입력해주세요.</Text>
              <TouchableOpacity onPress={handleInfo}>
                <Text
                  style={{
                    color: '#A7A7A7',
                    fontWeight: 'bold',
                    fontSize: 16,
                    marginTop: 45,
                  }}>
                  띄어쓰기 포함 12글자 이내로 입력해 주세요.
                </Text>
              </TouchableOpacity>
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
                marginBottom: 40,
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
              }}
            />
          </View>
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
    marginBottom: 95,
  },
  backIcon: {
    marginHorizontal: 8,
    marginBottom: 24,
  },
  text: {
    color: '#07AC7D',
    fontWeight: 'bold',
    fontSize: 24,
  },
  secondText: {
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
});

export default SignUpNickname;
