import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  FlatList,
  Image,
  TextInput,
  useWindowDimensions,
} from 'react-native';

import Modal from 'react-native-modal';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {useNavigation} from '@react-navigation/native';

const Chat = () => {
  const {width, height} = useWindowDimensions();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalMakeNameVisible, setIsModalMakeNameVisible] = useState(false);
  const [users, setUsers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [chatRooms, setChatRooms] = useState([]);
  const [currentUserUID, setCurrentUserUID] = useState(null);
  const navigation = useNavigation();

  const handleLogout = () => {
    auth().signOut();
    navigation.navigate('LoginTab');
  };

  const handleGroupNameChange = text => {
    setGroupName(text);
  };

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  const toggleMakeNameModal = () => {
    setIsModalMakeNameVisible(!isModalMakeNameVisible);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      await fetchUsers();
      await fetchCurrentUser();
      await fetchChatRooms();
    };

    fetchUserData();

    const unsubscribe = navigation.addListener('focus', () => {
      fetchChatRooms();
    });

    return () => {
      unsubscribe();
    };
  }, [navigation, currentUserUID]);

  //전체 유저 fetch.
  const fetchUsers = async () => {
    try {
      const usersSnapshot = await firestore().collection('users').get();
      const userList = usersSnapshot.docs.map(doc => doc.data());
      setUsers(userList);
      // console.log('users:', users);
    } catch (error) {
      console.error('Error: ', error);
    }
  };

  //로그인 된 유저 uid 가져오기 위한 코드
  const fetchCurrentUser = async () => {
    try {
      const user = auth().currentUser;
      if (user) {
        const userUID = user.uid;
        setCurrentUserUID(userUID);
        setSelectedUsers([userUID]);
      }
    } catch (error) {
      console.error('Error fetching current user: ', error);
    }
    console.log('currentUserUID:', currentUserUID);
  };

  const fetchChatRooms = async () => {
    try {
      const chatRoomsSnapshot = await firestore().collection('chatRooms').get();
      const chatRoomList = chatRoomsSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter(room => room.members.includes(currentUserUID));
      setChatRooms(chatRoomList);
    } catch (error) {
      console.error('Error: ', error);
    }
  };

  const userPress = userId => {
    const index = selectedUsers.indexOf(userId);
    if (index === -1) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
    console.log('selectedUsers:', selectedUsers);
  };

  const createGroupChat = async () => {
    try {
      const chatRoomRef = await firestore().collection('chatRooms').add({
        name: groupName,
        members: selectedUsers,
      });
      const chatRoomId = chatRoomRef.id;
      toggleModal();
      navigation.navigate('ChatRoom', {
        chatRoomId: chatRoomId,
        chatRoomName: groupName,
      });
      setSelectedUsers([]);
      fetchChatRooms();
    } catch (error) {
      console.error('Error: ', error);
    }
  };

  const renderGroups = ({item}) => {
    const goToChatRoom = () => {
      navigation.navigate('ChatRoom', {
        chatRoomId: item.id,
        chatRoomName: item.name,
      });
    };
    return (
      <TouchableOpacity onPress={goToChatRoom} style={styles.chatRoomItem}>
        <Text>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  const renderItem = ({item}) => {
    const isSelected = selectedUsers.includes(item.id);

    return (
      <TouchableOpacity
        style={{
          marginTop: 16,
          borderWidth: 0.5,
          width: 300,
          height: 50,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: isSelected ? 'lightgray' : 'white',
        }}
        onPress={() => userPress(item.id)}>
        <Text>{item.nickname}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{flex: 1, gap: 16}}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 16,
        }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            style={{width: 30, height: 30}}
            source={require('../../assets/icons/back.png')}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            width: 110,
            height: 40,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 16,
          }}
          onPress={toggleModal}>
          <View
            style={{
              width: 100,
              height: 35,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#7AD2B9',
              borderRadius: 12,
            }}>
            <Text style={{fontSize: 18, fontWeight: '700'}}>방 만들기</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout}>
          <Text>Log Out</Text>
        </TouchableOpacity>
      </View>

      <View
        style={{
          flexDirection: 'row',
          width: width,
          height: 50,
          alignItems: 'center',
        }}>
        <View
          style={{
            width: width - 80,
            height: 40,
            justifyContent: 'center',
            marginHorizontal: 12,
            paddingHorizontal: 12,
            borderRadius: 10,
            backgroundColor: '#D9D9D9',
          }}>
          <TextInput placeholder="채팅방 검색" />
        </View>
        <TouchableOpacity>
          <Text style={{fontSize: 16}}>취소</Text>
        </TouchableOpacity>
      </View>

      <View>
        <FlatList
          data={chatRooms}
          renderItem={renderGroups}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>

      <Modal
        isVisible={isModalVisible}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropOpacity={0.5}
        onBackdropPress={toggleModal}
        style={styles.modal}>
        <View style={styles.modalContent}>
          <FlatList
            data={users.filter(user => user.id !== currentUserUID)}
            renderItem={renderItem}
            // keyExtractor={item => item.id}
            key={item => item.id.toString()}
          />
          <TouchableOpacity onPress={toggleMakeNameModal}>
            <Text style={{fontSize: 18, fontWeight: '700'}}>초대하기</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{marginBottom: 24}} onPress={toggleModal}>
            <Text>취소</Text>
          </TouchableOpacity>
        </View>
        <Modal
          style={{justifyContent: 'center', alignItems: 'center'}}
          isVisible={isModalMakeNameVisible}
          backdropOpacity={0.5}
          onBackdropPress={toggleMakeNameModal}>
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              width: 350,
              height: 250,
              borderRadius: 24,
              backgroundColor: 'white',
              gap: 8,
            }}>
            <View
              style={{
                width: 300,
                height: 50,
                borderWidth: 1,
                borderRadius: 12,
                justifyContent: 'center',
              }}>
              <TextInput
                style={{width: 250, height: 40}}
                onChangeText={handleGroupNameChange}
                placeholder="채팅방 이름을 입력하세요"
                value={groupName}
              />
            </View>
            <View>
              <TouchableOpacity onPress={createGroupChat}>
                <Text>확인</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={toggleMakeNameModal}>
                <Text>취소</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    justifyContent: 'flex-end',
    alignItems: 'center',
    flex: 1,
    marginTop: 150,
    gap: 16,
  },
  chatRoomItem: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12,
  },
});

export default Chat;
