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
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import ImagePicker from 'react-native-image-crop-picker';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';

import ChatRoomNameChangeModal from '../../components/Chat/Modal/ChatRoomNameChangeModal';
import ImageDetail from '../../components/Chat/Modal/ImageDetail';
import PlusModal from '../../components/Chat/Modal/PlusModal';
import PhotoList from '../../components/Chat/PhotoList';
import ChatMemberList from '../../components/Chat/ChatMemberList';

import {
  BackIcon,
  ExitIcon,
  HamburgerIcon,
  PlusIcon,
  RightIcon,
} from '../../assets/assets';

const ChatRoom = ({route, navigation}) => {
  const {chatRoomId, chatRoomName, hobbiesId, members} = route.params;

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [slideModalVisible, setSlideModalVisible] = useState(false);
  const [plusModalVisible, setPlusModalVisible] = useState(false);
  const [chatOutModalVisible, setChatOutModalVisible] = useState(false);
  const [roomNameChangeModal, setRoomNameChangeModal] = useState(false);
  const [chatMembers, setChatMembers] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [imageUri, setImageUri] = useState('');

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

  useEffect(() => {
    getChatRoomMembers();
  }, []);

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

  const sendMessage = async () => {
    try {
      if (!inputMessage.trim()) {
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
      };

      await firestore()
        .collection('chatRooms')
        .doc(chatRoomId)
        .collection('messages')
        .add(newMessage);

      setInputMessage('');
    } catch (error) {
      console.error('Error sending message: ', error);
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

      await firestore()
        .collection('hobbies')
        .doc(hobbiesId)
        .update({
          personNumber: firestore.FieldValue.increment(-1),
        });

      navigation.goBack();
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const uploadImage = async (localImagePath, chatRoomId) => {
    try {
      const fileName = localImagePath.substring(
        localImagePath.lastIndexOf('/') + 1,
      );
      const path = storage().ref(`chatRoomImages/${chatRoomId}/${fileName}`);

      await path.putFile(localImagePath);

      return await path.getDownloadURL();
    } catch (error) {
      console.error('Error uploading image to Firebase Storage:', error);
      throw error;
    }
  };

  const getPhotos = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 400,
        height: 400,
        multiple: false,
        cropping: true,
        mediaType: 'photo',
        cropperChooseText: '이미지 변경',
        cropperCancelText: '취소',
        cropperRotateButtonsHidden: true,
      });
      const imageUrl = await uploadImage(image.sourceURL, chatRoomId);

      const currentUser = auth().currentUser;

      let currentUserNickname = 'Unknown';
      if (currentUser) {
        const userSnapshot = await firestore()
          .collection('users')
          .doc(currentUser.uid)
          .get();
        if (userSnapshot.exists) {
          currentUserNickname = userSnapshot.data().nickname;
          senderProfileImg = userSnapshot.data().profileImage;
        }
      }

      const newMessage = {
        sender: currentUserNickname,
        senderId: currentUser.uid,
        timestamp: firestore.FieldValue.serverTimestamp(),
        senderProfileImg: senderProfileImg,
        image: imageUrl,
      };

      await firestore()
        .collection('chatRooms')
        .doc(chatRoomId)
        .collection('messages')
        .add(newMessage);

      togglePlusModal();
    } catch (error) {
      console.error('Error selecting or uploading image:', error);
    }
  };

  const getPhotosByCamera = async () => {
    try {
      const image = await ImagePicker.openCamera({
        width: 400,
        height: 400,
        multiple: false,
        cropping: true,
        mediaType: 'photo',
        cropperChooseText: '이미지 변경',
        cropperCancelText: '취소',
        cropperRotateButtonsHidden: true,
      });
      const imageUrl = await uploadImage(image.sourceURL, chatRoomId);

      const currentUser = auth().currentUser;

      let currentUserNickname = 'Unknown';
      if (currentUser) {
        const userSnapshot = await firestore()
          .collection('users')
          .doc(currentUser.uid)
          .get();
        if (userSnapshot.exists) {
          currentUserNickname = userSnapshot.data().nickname;
          senderProfileImg = userSnapshot.data().profileImage;
        }
      }

      const newMessage = {
        sender: currentUserNickname,
        senderId: currentUser.uid,
        timestamp: firestore.FieldValue.serverTimestamp(),
        senderProfileImg: senderProfileImg,
        image: imageUrl,
      };

      await firestore()
        .collection('chatRooms')
        .doc(chatRoomId)
        .collection('messages')
        .add(newMessage);

      togglePlusModal();
    } catch (error) {
      console.error('Error selecting or uploading image:', error);
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

  const uploadProfileImage = async (localImagePath, chatRoomId) => {
    try {
      const fileName = localImagePath.substring(
        localImagePath.lastIndexOf('/') + 1,
      );
      const path = storage().ref(
        `chatRoomProfileImage/${chatRoomId}/${fileName}`,
      );

      await path.putFile(localImagePath);

      return await path.getDownloadURL();
    } catch (error) {
      console.error('Error uploading image to Firebase Storage:', error);
      throw error;
    }
  };

  const getProfileImage = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 400,
        height: 400,
        multiple: false,
        cropping: true,
        mediaType: 'photo',
        cropperChooseText: '이미지 변경',
        cropperCancelText: '취소',
        cropperRotateButtonsHidden: true,
      });

      const imageUrl = await uploadProfileImage(image.sourceURL, chatRoomId);
      await firestore()
        .collection('chatRooms')
        .doc(chatRoomId)
        .update({chatRoomImage: imageUrl});
    } catch (error) {
      if (error.code === 'E_PICKER_CANCELLED') {
        return false;
      }
      console.error('Error selecting or uploading image:', error);
    }
  };

  const renderItem = ({item, index}) => {
    const member = chatMembers.find(member => member.id === item.senderId);
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

    switch (true) {
      case index === 0:
        showTime = true;
        break;

      case item.senderId !== messages[index - 1]?.senderId:
        showTime = true;
        break;

      case isDifferentDay:
        showTime = true;
        break;

      case index > 0 &&
        item.timestamp &&
        messages[index - 1]?.timestamp &&
        !dayjs(item.timestamp.toDate()).isSame(
          dayjs(messages[index - 1].timestamp.toDate()),
          'minute',
        ):
        showTime = true;
        break;

      default:
        showTime = false;
        break;
    }

    const showProfileInfo =
      ((showDateSeparator && item.senderId !== auth().currentUser?.uid) ||
        (item.senderId !== prevItem?.senderId && !isCurrentUser)) &&
      item.senderId !== auth().currentUser?.id;

    if (member) {
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
                source={{uri: member.profileImage}}
              />
              <Text style={styles.showProfileInfoNickname}>
                {member.nickname}
              </Text>
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
                <TouchableOpacity onPress={() => toggleModal(item.image)}>
                  <Image
                    source={{uri: item.image}}
                    style={{width: 150, height: 150, borderRadius: 8}}
                  />
                </TouchableOpacity>
              ) : (
                <View style={styles.sentByUserMessage}>
                  <Text style={{fontFamily: 'Pretendard'}}>{item.text}</Text>
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
          ) : (
            <View style={styles.sentByOtherWrapper}>
              {item.image ? (
                <TouchableOpacity onPress={() => toggleModal(item.image)}>
                  <Image
                    source={{uri: item.image}}
                    style={{width: 150, height: 150, borderRadius: 8}}
                  />
                </TouchableOpacity>
              ) : (
                <View style={styles.sentByOtherMessage}>
                  <Text style={{fontFamily: 'Pretendard'}}>{item.text}</Text>
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
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const goToShowAllImages = () => {
    navigation.navigate('ShowAllImages', {messages: messages});
    setSlideModalVisible(false);
  };

  const goToChatRoomNotice = () => {
    navigation.navigate('ChatRoomNotice', {
      chatRoomId: chatRoomId,
    });
    setSlideModalVisible(false);
  };

  const toggleHamburgerModal = () => {
    setSlideModalVisible(!slideModalVisible);
  };

  const togglePlusModal = () => {
    setPlusModalVisible(!plusModalVisible);
  };

  const toggleModal = imageUri => {
    setImageUri(imageUri);
    setIsVisible(true);
  };

  const closeModal = () => {
    setIsVisible(false);
  };

  const toggleChatRoomNameChangeModal = () => {
    setRoomNameChangeModal(!roomNameChangeModal);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleGoBack}>
          <Image source={BackIcon} style={{width: 24, height: 24}} />
        </TouchableOpacity>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
          <Text style={styles.roomName}>{chatRoomName}</Text>
          <Text style={{fontSize: 18, color: '#A7A7A7', fontWeight: '600'}}>
            {members.length}
          </Text>
        </View>
        <TouchableOpacity onPress={toggleHamburgerModal}>
          <Image style={{width: 24, height: 24}} source={HamburgerIcon} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        inverted
      />

      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
        style={styles.inputContainer}>
        <TouchableOpacity onPress={togglePlusModal}>
          <Image style={{width: 18, height: 18}} source={PlusIcon} />
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
          <Image style={{width: 20, height: 20}} source={RightIcon} />
        </TouchableOpacity>
      </KeyboardAvoidingView>

      <Modal
        isVisible={slideModalVisible}
        animationIn="slideInRight"
        animationOut="slideOutRight"
        backdropOpacity={0.2}
        onBackdropPress={toggleHamburgerModal}
        style={{
          flex: 1,
          margin: 0,
          justifyContent: 'flex-end',
          alignItems: 'flex-end',
        }}>
        <View style={styles.modalContent}>
          <View style={{flex: 0.25}}></View>
          <View
            style={{
              width: '100%',
              flex: 0.6,
              paddingHorizontal: 12,
              paddingVertical: 8,
              gap: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#E0E0E0',
            }}>
            <TouchableOpacity
              onPress={goToShowAllImages}
              style={{
                justifyContent: 'space-between',
                alignItems: 'center',
                flexDirection: 'row',
                marginHorizontal: 8,
                paddingTop: 8,
              }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '700',
                  fontFamily: 'Pretendard',
                }}>
                사진
              </Text>
              <Image source={RightIcon} style={{width: 16, height: 16}} />
            </TouchableOpacity>

            <View
              style={{
                width: '100%',
                flex: 2,
                alignItems: 'flex-start',
              }}>
              <PhotoList chatRoomId={chatRoomId} />
            </View>
          </View>

          <View
            style={{
              width: '100%',
              flex: 0.2,
              borderBottomWidth: 1,
              borderBottomColor: '#E0E0E0',
              paddingHorizontal: 12,
              gap: 8,
            }}>
            <TouchableOpacity onPress={goToChatRoomNotice}>
              <Text
                style={{
                  fontSize: 16,
                  marginBottom: 8,
                  fontWeight: '700',
                  fontFamily: 'Pretendard',
                }}>
                공지 사항
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={{
              width: '100%',
              flex: 0.5,
              borderBottomWidth: 1,
              borderBottomColor: '#E0E0E0',
              paddingHorizontal: 12,
              gap: 8,
            }}>
            <Text
              style={{
                fontSize: 16,
                marginBottom: 8,
                fontWeight: '700',
                fontFamily: 'Pretendard',
              }}>
              채팅방 설정
            </Text>
            <TouchableOpacity onPress={toggleChatRoomNameChangeModal}>
              <Text style={{fontFamily: 'Pretendard'}}>채팅방 이름 변경</Text>
            </TouchableOpacity>
            <ChatRoomNameChangeModal
              isVisible={roomNameChangeModal}
              toggleChatRoomNameChangeModal={toggleChatRoomNameChangeModal}
              updateChatRoomName={updateChatRoomName}
            />
            <TouchableOpacity onPress={getProfileImage}>
              <Text style={{fontFamily: 'Pretendard'}}>채팅방 사진 변경</Text>
            </TouchableOpacity>
          </View>
          <View
            style={{
              flex: 2,
              width: '100%',
              borderBottomWidth: 1,
              borderBottomColor: '#E0E0E0',
              gap: 8,
              paddingHorizontal: 12,
            }}>
            <View style={{marginBottom: 8}}>
              <Text style={{fontSize: 16, fontWeight: '700'}}>참여 멤버</Text>
            </View>
            <ChatMemberList chatMembers={chatMembers} />
          </View>

          <View
            style={{
              width: '100%',
              alignItems: 'flex-end',
              paddingBottom: 24,
              paddingHorizontal: 32,
            }}>
            <TouchableOpacity
              onPress={() => setChatOutModalVisible(!chatOutModalVisible)}>
              <Image style={{width: 18, height: 18}} source={ExitIcon} />
            </TouchableOpacity>
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
        </View>
      </Modal>

      <PlusModal
        isVisible={plusModalVisible}
        toggleModal={togglePlusModal}
        getPhotos={getPhotos}
        getPhotosByCamera={getPhotosByCamera}
      />
      <ImageDetail
        isVisible={isVisible}
        imageUri={imageUri}
        closeModal={closeModal}
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
    fontFamily: 'Pretendard',
  },
  showDateSeparatorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  showDateSeparatorTime: {
    paddingVertical: 22,
    color: '#aaa',
    fontSize: 12,
    fontFamily: 'Pretendard',
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
    fontFamily: 'Pretendard',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
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
    fontFamily: 'Pretendard',
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
    fontFamily: 'Pretendard',
  },
});

export default ChatRoom;
