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
  Dimensions,
} from 'react-native';
import Modal from 'react-native-modal';

import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import ImagePicker from 'react-native-image-crop-picker';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';

import ChatRoomNameChangeModal from '../../components/Chat/Modal/ChatRoomNameChangeModal';
import PlusModal from '../../components/Chat/Modal/PlusModal';
import PhotoList from '../../components/Chat/PhotoList';
import ChatMemberList from '../../components/Chat/ChatMemberList';

const ChatRoom = ({route, navigation}) => {
  const {chatRoomId, chatRoomName} = route.params;
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isHamburgerModalVisible, setIsHamburgerModalVisible] = useState(false);
  const [isPlusModalVisible, setIsPlusModalVisible] = useState(false);
  const [chatOutModalVisible, setChatOutModalVisible] = useState(false);
  const [chatRoomNameChangeModalVisible, setChatRoomNameChangeModalVisible] =
    useState(false);
  const [chatMembers, setChatMembers] = useState([]);
  const [pickImage, setPickImage] = useState('');

  //사진 올리기 기능 아직 구현 안 돼서 임시로 dummy data
  const photoList = [
    {
      id: 1,
      imageUrl:
        'https://firebasestorage.googleapis.com/v0/b/sharebby-4d82f.appspot.com/o/dummyprofile.png?alt=media&token=a34d85db-3310-4052-84f0-f0bdfc9e88c8',
    },
    {
      id: 2,
      imageUrl:
        'https://firebasestorage.googleapis.com/v0/b/sharebby-4d82f.appspot.com/o/dummyprofile.png?alt=media&token=a34d85db-3310-4052-84f0-f0bdfc9e88c8',
    },
    {
      id: 3,
      imageUrl:
        'https://firebasestorage.googleapis.com/v0/b/sharebby-4d82f.appspot.com/o/dummyprofile.png?alt=media&token=a34d85db-3310-4052-84f0-f0bdfc9e88c8',
    },
    {
      id: 4,
      imageUrl:
        'https://firebasestorage.googleapis.com/v0/b/sharebby-4d82f.appspot.com/o/dummyprofile.png?alt=media&token=a34d85db-3310-4052-84f0-f0bdfc9e88c8',
    },
  ];

  const uploadImage = async (localImagePath, chatRoomId) => {
    try {
      const fileName = localImagePath.substring(
        localImagePath.lastIndexOf('/') + 1,
      );
      const reference = storage().ref(
        `chatRoomImages/${chatRoomId}/${fileName}`,
      );

      await reference.putFile(localImagePath);

      const url = await reference.getDownloadURL();
      return url;
    } catch (error) {
      console.error('Error uploading image to Firebase Storage:', error);
      throw error;
    }
  };

  const getPhotos = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 300,
        height: 400,
        multiple: false,
      });
      const imageUrl = await uploadImage(image.sourceURL, chatRoomId);
      setPickImage(imageUrl);
      sendMessage();
      togglePlusModal();
    } catch (error) {
      console.error('Error selecting or uploading image:', error);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  //modal
  const toggleHamburgerModal = () => {
    setIsHamburgerModalVisible(!isHamburgerModalVisible);
  };
  const togglePlusModal = () => {
    setIsPlusModalVisible(!isPlusModalVisible);
  };
  const toggleChatRoomNameChangeModal = () => {
    setChatRoomNameChangeModalVisible(!chatRoomNameChangeModalVisible);
  };

  useEffect(() => {
    const messageListener = firestore()
      .collection('chatRooms')
      .doc(chatRoomId)
      .collection('messages')
      .orderBy('timestamp', 'desc')
      .onSnapshot(querySnapshot => {
        if (querySnapshot) {
          const newMessages = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setMessages(newMessages);
        }
      });

    return () => messageListener();
  }, [chatRoomId]);

  const getChatRoomMembers = async () => {
    try {
      const chatRoomRef = firestore().collection('chatRooms').doc(chatRoomId);
      const chatRoomSnapshot = await chatRoomRef.get();
      if (chatRoomSnapshot.exists) {
        const {members} = chatRoomSnapshot.data();
        const memberDetails = [];
        for (const memberId of members) {
          const userSnapshot = await firestore()
            .collection('users')
            .doc(memberId)
            .get();
          if (userSnapshot.exists) {
            const userData = userSnapshot.data();
            memberDetails.push(userData);
          }
        }
        setChatMembers(memberDetails);
      } else {
        console.log('Chat room does not exist.');
      }
    } catch (error) {
      console.error('Error fetching chat room members:', error);
    }
  };

  useEffect(() => {
    getChatRoomMembers();
  }, [chatRoomId]);

  const sendMessage = async () => {
    try {
      if (!inputMessage.trim() && !pickImage) {
        return;
      }

      const currentUser = auth().currentUser;

      let senderName = 'Unknown';
      if (currentUser) {
        const userSnapshot = await firestore()
          .collection('users')
          .doc(currentUser.uid)
          .get();
        if (userSnapshot.exists) {
          senderName = userSnapshot.data().nickname;
          senderProfileImg = userSnapshot.data().profileImage;
        }
      }

      const newMessage = {
        text: inputMessage,
        sender: senderName,
        senderId: currentUser.uid,
        timestamp: firestore.FieldValue.serverTimestamp(),
        senderProfileImg: senderProfileImg,
        image: pickImage,
      };

      await firestore()
        .collection('chatRooms')
        .doc(chatRoomId)
        .collection('messages')
        .add(newMessage);

      setInputMessage('');
      setPickImage('');
    } catch (error) {
      console.error('Error sending message: ', error);
    }
  };

  const updateChatRoomName = async newName => {
    try {
      await firestore()
        .collection('chatRooms')
        .doc(chatRoomId)
        .update({name: newName});
      toggleChatRoomNameChangeModal();
      navigation.goBack();
    } catch (error) {
      console.error('Error updating chat room name:', error);
    }
  };

  const deleteChat = async () => {
    try {
      const currentUser = auth().currentUser;
      const currentUserUID = currentUser ? currentUser.uid : null;

      let currentUserNickname = 'Unknown';
      if (currentUser) {
        const userSnapshot = await firestore()
          .collection('users')
          .doc(currentUser.uid)
          .get();
        if (userSnapshot.exists) {
          currentUserNickname = userSnapshot.data().nickname;
        }
      }

      const chatRoomRef = firestore().collection('chatRooms').doc(chatRoomId);
      const chatRoomSnapshot = await chatRoomRef.get();
      const currentMembers = chatRoomSnapshot.data().members;
      const updatedMembers = currentMembers.filter(
        memberUID => memberUID !== currentUserUID,
      );

      await chatRoomRef.update({members: updatedMembers});

      const newMessage = {
        text: `${currentUserNickname}님이 나갔습니다.`,
        sender: '시스템',
        timestamp: firestore.FieldValue.serverTimestamp(),
      };

      await firestore()
        .collection('chatRooms')
        .doc(chatRoomId)
        .collection('messages')
        .add(newMessage);

      navigation.goBack();
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const renderItem = ({item, index}) => {
    dayjs.locale('ko');
    const isSystemMessage = item.sender === '시스템';
    const isCurrentUser = item.senderId === auth().currentUser?.uid;
    const isFirstMessage = index === messages.length - 1;
    const prevItem = messages[index + 1];
    const isDifferentDay =
      prevItem &&
      item.timestamp &&
      prevItem.timestamp &&
      !dayjs(item.timestamp?.toDate() || new Date()).isSame(
        dayjs(prevItem.timestamp?.toDate() || new Date()),
        'day',
      );

    const showDateSeparator = isFirstMessage || isDifferentDay;

    const showTime =
      index === 0 ||
      item.senderId !== messages[index - 1]?.senderId ||
      isDifferentDay ||
      (index > 0 &&
        item.timestamp &&
        messages[index - 1]?.timestamp &&
        !dayjs(item.timestamp.toDate()).isSame(
          dayjs(messages[index - 1].timestamp.toDate()),
          'minute',
        ));

    const showProfileInfo =
      ((showDateSeparator && item.senderId !== auth().currentUser?.uid) ||
        (item.senderId !== prevItem?.senderId && !isCurrentUser)) &&
      item.senderId !== auth().currentUser?.id;

    return (
      <View>
        <View style={styles.showDateSeparatorContainer}>
          {showDateSeparator && (
            <View>
              <Text style={styles.showDateSeparatorTime}>
                {dayjs(item.timestamp?.toDate()).format('YYYY년 MM월 DD일')}
              </Text>
            </View>
          )}
        </View>
        {showProfileInfo && (
          <View style={styles.showProfileInfoContainer}>
            <Image
              style={styles.showProfileInfoImage}
              source={{uri: item.senderProfileImg}}
            />
            <Text style={styles.showProfileInfoNickname}>{item.sender}</Text>
          </View>
        )}
        {isCurrentUser ? (
          <View style={styles.sentByUserWrapper}>
            {showTime && (
              <View style={{marginBottom: 8}}>
                <Text style={{color: '#aaa', fontSize: 10}}>
                  {item.timestamp &&
                    item.timestamp.toDate &&
                    dayjs(item.timestamp.toDate()).format('A hh:mm')}
                </Text>
              </View>
            )}

            {item.image ? (
              <Image
                source={{uri: item.image}}
                style={{width: 150, height: 150, borderRadius: 8}}
              />
            ) : (
              <View style={styles.sentByUserMessage}>
                <Text>{item.text}</Text>
              </View>
            )}
          </View>
        ) : isSystemMessage ? (
          <View style={{justifyContent: 'center', alignItems: 'center'}}>
            <Text style={{paddingVertical: 22, color: '#aaa', fontSize: 12}}>
              {item.text}
            </Text>
            {showTime && <View style={{marginBottom: 8}}></View>}
          </View>
        ) : isSystemMessage ? (
          <View style={{justifyContent: 'center', alignItems: 'center'}}>
            <Text style={{paddingVertical: 22, color: '#aaa', fontSize: 12}}>
              {item.text}
            </Text>
            {showTime && <View style={{marginBottom: 8}}></View>}
          </View>
        ) : (
          <View style={styles.sentByOtherWrapper}>
            {item.image ? (
              <Image
                source={{uri: item.image}}
                style={{width: 150, height: 150, borderRadius: 8}}
              />
            ) : (
              <View style={styles.sentByOtherMessage}>
                <Text>{item.text}</Text>
              </View>
            )}
            {showTime && (
              <View style={{marginBottom: 8}}>
                <Text style={{color: '#aaa', fontSize: 10}}>
                  {item.timestamp &&
                    item.timestamp.toDate &&
                    dayjs(item.timestamp.toDate()).format('A hh:mm')}
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
          style={styles.textInput}
          placeholder="메시지를 입력하세요"
          maxLength={500}
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
        animationIn="slideInRight"
        animationOut="slideOutRight"
        backdropOpacity={0.5}
        onBackdropPress={toggleHamburgerModal}
        style={{margin: 0, justifyContent: 'flex-end'}}>
        <SafeAreaView style={{flex: 1, alignItems: 'flex-end'}}>
          <View style={styles.modalContent}>
            <View
              style={{
                width: '100%',
                flex: 1,
                paddingHorizontal: 8,
                paddingVertical: 8,
                gap: 16,
                borderBottomWidth: 1,
                borderBottomColor: '#E0E0E0',
              }}>
              <View
                style={{
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexDirection: 'row',
                  marginHorizontal: 8,
                  paddingTop: 8,
                }}>
                <TouchableOpacity>
                  <Text style={{fontSize: 16, fontWeight: '700'}}>사진</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Image
                    source={require('../../assets/icons/right-arrow.png')}
                    style={{width: 16, height: 16}}
                  />
                </TouchableOpacity>
              </View>
              <View
                style={{
                  width: '100%',
                  flex: 2,
                  alignItems: 'center',
                }}>
                <PhotoList chatRoomId={chatRoomId} />
              </View>
            </View>

            <View
              style={{
                flex: 2,
                width: '100%',
                borderBottomWidth: 1,
                borderBottomColor: '#E0E0E0',
                gap: 8,
                paddingHorizontal: 8,
              }}>
              <View style={{marginBottom: 8}}>
                <Text style={{fontSize: 16, fontWeight: '700'}}>참여 멤버</Text>
              </View>
              <ChatMemberList chatMembers={chatMembers} />
            </View>

            <View
              style={{
                width: '100%',
                flex: 0.2,
                borderBottomWidth: 1,
                borderBottomColor: '#E0E0E0',
                paddingHorizontal: 8,
                gap: 8,
              }}>
              <TouchableOpacity>
                <Text
                  style={{fontSize: 16, fontWeight: '700', marginBottom: 8}}>
                  공지 사항
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={{
                width: '100%',
                flex: 1,
                borderBottomWidth: 1,
                borderBottomColor: '#E0E0E0',
                paddingHorizontal: 8,
                gap: 8,
              }}>
              <Text style={{fontSize: 16, fontWeight: '700', marginBottom: 8}}>
                채팅방 설정
              </Text>
              <TouchableOpacity onPress={toggleChatRoomNameChangeModal}>
                <Text>채팅방 이름 변경</Text>
              </TouchableOpacity>
              <ChatRoomNameChangeModal
                isVisible={chatRoomNameChangeModalVisible}
                toggleChatRoomNameChangeModal={toggleChatRoomNameChangeModal}
                updateChatRoomName={updateChatRoomName}
              />
              <TouchableOpacity>
                <Text>채팅방 사진 변경</Text>
              </TouchableOpacity>
            </View>

            <View
              style={{
                width: '100%',
                justifyContent: 'flex-end',
                alignItems: 'center',
                paddingBottom: 16,
                gap: 8,
              }}>
              <TouchableOpacity
                onPress={() => setChatOutModalVisible(!chatOutModalVisible)}>
                <Text style={{fontSize: 18, fontWeight: '700'}}>
                  채팅방 나가기
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={toggleHamburgerModal}>
                <Text>취소</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Modal
            isVisible={chatOutModalVisible}
            animationIn={'bounceIn'}
            animationOut={'bounceOut'}
            animationInTiming={300}
            animationOutTiming={300}
            transparent={true}
            backdropColor="#fff"
            backdropOpacity={0.5}
            onBackButtonPress={() =>
              setChatOutModalVisible(!chatOutModalVisible)
            }
            onBackdropPress={() =>
              setChatOutModalVisible(!chatOutModalVisible)
            }>
            <View style={styles.chatOutConfirm}>
              <View
                style={{
                  padding: 16,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text style={styles.pressText}>정말 나가겠습니까?</Text>
              </View>
              <View style={styles.pressOptionView}>
                <TouchableOpacity
                  activeOpacity={0.6}
                  style={[styles.pressOptionBtn, {backgroundColor: '#07AC7D'}]}
                  onPress={deleteChat}>
                  <Text style={styles.pressOptionText}>예</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.6}
                  style={[styles.pressOptionBtn, {backgroundColor: '#DBDBDB'}]}
                  onPress={() => setChatOutModalVisible(false)}>
                  <Text style={styles.pressOptionText}>아니요</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </SafeAreaView>
      </Modal>

      <PlusModal
        isVisible={isPlusModalVisible}
        toggleModal={togglePlusModal}
        getPhotos={getPhotos}
      />
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
  showDateSeparatorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  showDateSeparatorTime: {
    paddingVertical: 22,
    color: '#aaa',
    fontSize: 12,
  },
  showProfileInfoContainer: {
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  showProfileInfoImage: {
    width: 30,
    height: 30,
    borderRadius: 10,
  },
  showProfileInfoNickname: {
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    padding: 10,
    gap: 8,
  },
  textInput: {
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
  modalContent: {
    flex: 1,
    width: 300,
    marginBottom: 0,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  chatOutConfirm: {
    marginHorizontal: 30,
    borderRadius: 10,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  pressText: {
    marginBottom: 6,
    fontSize: 16,
  },
  pressOptionView: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  pressOptionBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  pressOptionText: {
    fontSize: 16,
    color: '#FFF',
  },
});

export default ChatRoom;
