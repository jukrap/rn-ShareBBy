import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Image,
} from 'react-native';
import Modal from 'react-native-modal';

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';

const ChatRoom = ({route, navigation}) => {
  const {chatRoomId, chatRoomName} = route.params;
  // console.log('chatRoomId:', chatRoomId);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isHamburgerModalVisible, setIsHamburgerModalVisible] = useState(false);
  const [isPlusModalVisible, setIsPlusModalVisible] = useState(false);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const toggleHamburgerModal = () => {
    setIsHamburgerModalVisible(!isHamburgerModalVisible);
  };

  const togglePlusModal = () => {
    setIsPlusModalVisible(!isPlusModalVisible);
  };

  useEffect(() => {
    const messageListener = firestore()
      .collection('chatRooms')
      .doc(chatRoomId)
      .collection('messages')
      .where('actflag', '==', true)
      .orderBy('timestamp', 'desc')
      .onSnapshot(querySnapshot => {
        if (querySnapshot) {
          const newMessages = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().timestamp.toDate(),
          }));
          setMessages(newMessages);
        }
      });

    return () => messageListener();
  }, [chatRoomId]);

  const sendMessage = async () => {
    try {
      const currentUser = auth().currentUser;

      let senderName = 'Unknown';
      if (currentUser) {
        const userSnapshot = await firestore()
          .collection('users')
          .doc(currentUser.uid)
          .get();
        if (userSnapshot.exists) {
          senderName = userSnapshot.data().name;
        }
      }

      const newMessage = {
        text: inputMessage,
        sender: senderName,
        actflag: true,
        senderId: currentUser ? currentUser.uid : null,
        timestamp: firestore.FieldValue.serverTimestamp(),
      };

      await firestore()
        .collection('chatRooms')
        .doc(chatRoomId)
        .collection('messages')
        .add(newMessage);

      setMessages(prevMessages => [newMessage, ...prevMessages]);

      setInputMessage('');
    } catch (error) {
      console.error('Error sending message: ', error);
    }
  };

  const deleteChat = async () => {
    try {
      const currentUser = auth().currentUser;

      const currentUserUID = currentUser ? currentUser.uid : null;

      const chatRoomRef = firestore().collection('chatRooms').doc(chatRoomId);
      const chatRoomSnapshot = await chatRoomRef.get();
      const currentMembers = chatRoomSnapshot.data().members;

      const updatedMembers = currentMembers.filter(
        memberUID => memberUID !== currentUserUID,
      );

      await chatRoomRef.update({members: updatedMembers});

      console.log('채팅방 삭제 완료');
      navigation.goBack();
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const renderItem = ({item, index}) => {
    dayjs.locale('ko');
    const isCurrentUser = item.senderId === auth().currentUser?.uid;

    const isFirstMessage = index === messages.length - 1;
    const prevItem = messages[index + 1];
    const isDifferentDay =
      prevItem &&
      !dayjs(item.createdAt).isSame(dayjs(prevItem.createdAt), 'day');

    const showDateSeparator = isFirstMessage || isDifferentDay;

    const showTime =
      index === 0 ||
      item.senderId !== messages[index - 1].senderId ||
      isDifferentDay ||
      (index > 0 &&
        !dayjs(item.createdAt).isSame(
          dayjs(messages[index - 1].createdAt),
          'minute',
        ));

    const showProfileInfo =
      ((showDateSeparator && item.senderId !== auth().currentUser?.uid) ||
        item.senderId !== prevItem?.senderId) &&
      item.senderId !== auth().currentUser?.uid;

    return (
      <View>
        <View style={{justifyContent: 'center', alignItems: 'center'}}>
          {showDateSeparator && (
            <View>
              <Text style={{paddingVertical: 22, color: '#aaa', fontSize: 12}}>
                {dayjs(item.createdAt).format('YYYY년 MM월 DD일')}{' '}
              </Text>
            </View>
          )}
        </View>
        {showProfileInfo && (
          <View
            style={{
              flexDirection: 'row',
              gap: 8,
              marginHorizontal: 12,
              marginBottom: 12,
            }}>
            <Image
              style={{width: 32, height: 32, borderRadius: 10}}
              source={require('../../assets/images/defaultProfileImg.jpeg')}
            />
            <Text style={{fontSize: 16, fontWeight: '700'}}>{item.sender}</Text>
          </View>
        )}
        {isCurrentUser ? (
          <View style={styles.sentByUserWrapper}>
            {showTime && (
              <View style={{marginBottom: 8}}>
                <Text style={{color: '#aaa', fontSize: 10}}>
                  {dayjs(item.createdAt).format('A hh:mm')}
                </Text>
              </View>
            )}
            <View style={styles.sentByUserMessage}>
              <Text>{item.text}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.sentByOtherWrapper}>
            <View style={styles.sentByOtherMessage}>
              <Text>{item.text}</Text>
            </View>
            {showTime && (
              <View style={{marginBottom: 8}}>
                <Text style={{color: '#aaa', fontSize: 10}}>
                  {dayjs(item.createdAt).format('A hh:mm')}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleGoBack}>
          <Image
            style={{width: 30, height: 30}}
            source={require('../../assets/icons/back.png')}
          />
        </TouchableOpacity>
        <Text style={styles.roomName}>{chatRoomName}</Text>
        <TouchableOpacity onPress={toggleHamburgerModal}>
          <Image
            style={{width: 40, height: 40}}
            source={require('../../assets/icons/HamburgerMenu.png')}
          />
        </TouchableOpacity>
      </View>
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        inverted
      />
      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
        style={styles.inputContainer}>
        <TouchableOpacity onPress={togglePlusModal}>
          <Image
            style={{width: 24, height: 24}}
            source={require('../../assets/icons/plus.png')}
          />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="메시지를 입력하세요"
          value={inputMessage}
          onChangeText={text => setInputMessage(text)}
          spellCheck={false}
          autoCorrect={false}
          autoCapitalize="none"
          multiline={true}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Image
            style={{width: 25, height: 25}}
            source={require('../../assets/icons/right-arrow.png')}
          />
        </TouchableOpacity>
      </KeyboardAvoidingView>

      <Modal
        isVisible={isHamburgerModalVisible}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropOpacity={0.5}
        onBackdropPress={toggleHamburgerModal}
        style={styles.modal}>
        <View style={styles.modalContent}>
          <TouchableOpacity onPress={deleteChat}>
            <Text style={{color: '#D21F3C', fontSize: 18, fontWeight: '700'}}>
              채팅방 나가기
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleHamburgerModal}>
            <Text>취소</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal
        isVisible={isPlusModalVisible}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropOpacity={0.5}
        onBackdropPress={togglePlusModal}
        style={styles.modal}>
        <View style={styles.modalContent}>
          <TouchableOpacity>
            <Text style={{fontSize: 18, fontWeight: '700'}}>사진 업로드</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={togglePlusModal}>
            <Text>취소</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topBar: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  roomName: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    padding: 10,
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
  },
  sentByUserWrapper: {
    flexDirection: 'row',
    marginRight: 14,
    marginBottom: 4,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    gap: 6,
  },
  sentByUserMessage: {
    backgroundColor: '#7AD2B9',
    borderRadius: 12,
    padding: 10,
    maxWidth: '50%',
    marginBottom: 8,
  },
  sentByOtherWrapper: {
    flexDirection: 'row',
    marginLeft: 14,
    marginBottom: 4,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    gap: 8,
  },
  sentByOtherMessage: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 10,
    maxWidth: '50%',
    marginBottom: 8,
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    height: 100,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 20,
    gap: 16,
  },
});

export default ChatRoom;
