import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Image,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {BackIcon} from '../../assets/assets';

const WriteNotice = ({navigation, route}) => {
  const {chatRoomId} = route.params;

  const [notice, setNotice] = useState('');

  const makeNotice = async () => {
    try {
      if (!notice.trim()) {
        return;
      }

      const currentUser = auth().currentUser;

      let senderName = 'Unknown';
      const userSnapshot = await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .get();
      if (userSnapshot.exists) {
        senderName = userSnapshot.data().nickname;
      }

      const newNotice = {
        text: notice,
        sender: senderName,
        senderId: currentUser.uid,
        timestamp: firestore.FieldValue.serverTimestamp(),
      };

      await firestore()
        .collection('chatRooms')
        .doc(chatRoomId)
        .collection('notice')
        .add(newNotice);

      setNotice('');
      handleGoBack();
    } catch (error) {
      console.error('Error sending notice: ', error);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleGoBack}>
          <Image source={BackIcon} style={styles.backIcon} />
        </TouchableOpacity>

        <Text style={styles.title}>공지사항 작성하기</Text>
        <TouchableOpacity onPress={makeNotice}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '600',
              textAlign: 'center',
              color: '#07AC7D',
            }}>
            등록
          </Text>
        </TouchableOpacity>
      </View>
      <KeyboardAvoidingView behavior="padding" style={styles.container}>
        <TextInput
          style={styles.textInput}
          placeholder="공지사항을 입력하세요!"
          multiline
          value={notice}
          maxLength={1000}
          onChangeText={text => setNotice(text)}
          spellCheck={false}
          autoCorrect={false}
          autoCapitalize="none"
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  textInput: {
    flex: 1,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 16,
  },
});

export default WriteNotice;
