import React, {useState} from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Alert, // Alert import 추가
} from 'react-native';
import firestore from '@react-native-firebase/firestore'; // firestore import 추가

const SignUpNickname = ({onNextStep}) => {
  // onNextStep props 추가
  const {width, height} = Dimensions.get('window');
  const [nickname, setNickname] = useState('');

  const handleNext = async () => {
    // async 키워드 추가
    try {
      // 파이어베이스에서 닉네임 중복 확인
      const userQuery = await firestore() // firestore() 호출 추가
        .collection('users')
        .where('nickname', '==', nickname)
        .get();

      if (nickname.trim() === '') {
        Alert.alert('닉네임 입력', '닉네임을 입력해주세요.');
        return;
      }
      if (!userQuery.empty) {
        // 중복된 닉네임이 있으면 알림 표시
        Alert.alert('중복된 닉네임', '이미 사용 중인 닉네임입니다.');
      } else {
        // 중복된 닉네임이 없으면 다음 단계로 진행
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

  return (
    <SafeAreaView style={styles.container}>
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
                띄어쓰기 포함 촤대 15자까지 가능합니다.
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
                marginBottom: 40,
                fontSize: 16,
                fontWeight: 'bold',
              }}
              placeholder="닉네임 입력"
              placeholderTextColor={'#A7A7A7'}
              value={nickname}
              onChangeText={text => {
                if (text.length <= 15) {
                  // 최대 길이 제한
                  setNickname(text);
                }
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
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
  },
});

export default SignUpNickname;
