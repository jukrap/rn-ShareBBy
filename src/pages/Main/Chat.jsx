import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import ChatListTime from '../../components/Chat/ChatListTime';
import {BackIcon} from '../../assets/assets';

const {width, height} = Dimensions.get('window');

const Chat = () => {
  const [chatRooms, setChatRooms] = useState([]);
  const [lastChat, setLastChat] = useState({});
  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      await fetchRoomData();
    };

    fetchData();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchData();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const fetchRoomData = async () => {
    try {
      const chatRoomsSnapshot = await firestore().collection('chatRooms').get();
      const userToken = await AsyncStorage.getItem('userToken');
      const chatRoomList = chatRoomsSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter(room => room.members.includes(userToken)); //합쳐보기 방법 고민 필요.

      const latestChats = {};

      for (const room of chatRoomList) {
        const messageSnapshot = await firestore()
          .collection('chatRooms')
          .doc(room.id)
          .collection('messages')
          .orderBy('timestamp', 'desc')
          .limit(1)
          .get();

        if (!messageSnapshot.empty) {
          const latestMessage = messageSnapshot.docs[0].data();
          latestChats[room.id] = {
            text: latestMessage.text,
            timestamp: latestMessage.timestamp.toDate(),
          };
        }
      }
      chatRoomList.forEach((room, index) => {});
      setChatRooms(chatRoomList);
      setLastChat(latestChats);
    } catch (error) {
      console.error('Error fetching chat rooms: ', error);
    }
  };

  const formatMessageTime = timestamp => {
    const date = dayjs(timestamp);
    const today = dayjs().startOf('day');
    const yesterday = dayjs().subtract(1, 'day').startOf('day');

    switch (true) {
      case date.isSame(today, 'day'):
        return {type: 'timeOnly', time: date.format('A hh:mm')};
      case date.isSame(yesterday, 'day'):
        return {type: 'yesterday'};
      default:
        return {
          type: 'monthAndDay',
          month: date.format('MM'),
          day: date.format('DD'),
        };
    }
  };

  const sortLast = () => {
    return chatRooms.sort((roomA, roomB) => {
      const latestChatA = lastChat[roomA.id];
      const latestChatB = lastChat[roomB.id];

      if (!latestChatA && !latestChatB) {
        return 0;
      } else if (!latestChatA) {
        return 1;
      } else if (!latestChatB) {
        return -1;
      } else {
        return latestChatB.timestamp - latestChatA.timestamp;
      }
    });
  };
  const renderGroups = ({item}) => {
    const goToChatRoom = () => {
      navigation.navigate('ChatRoom', {
        chatRoomId: item.id,
        chatRoomName: item.name,
        hobbiesId: item.hobbiesId,
        members: item.members,
      });
    };

    const latestChat = lastChat[item.id];
    const formattedTime = latestChat
      ? formatMessageTime(latestChat.timestamp)
      : {type: 'none'};

    return (
      <TouchableOpacity onPress={goToChatRoom} style={styles.chatRoomItem}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'flex-start',
          }}>
          <Image
            style={{width: 52, height: 52, borderRadius: 8}}
            source={{uri: item.chatRoomImage}}
          />
        </View>
        <View
          style={{
            flex: 3.5,
            alignItems: 'flex-start',
            justifyContent: 'center',
          }}>
          <View
            style={{
              flex: 1.5,
              flexDirection: 'row',
              alignItems: 'flex-end',
              gap: 4,
            }}>
            <Text style={{fontSize: 16, fontWeight: '600'}}>{item.name}</Text>
            <Text style={{fontSize: 14, color: '#A7A7A7'}}>
              {item.members.length}
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              justifyContent: 'flex-end',
              paddingBottom: 8,
              fontSize: 10,
            }}>
            {latestChat && (
              <Text style={{color: '#A7A7A7', fontSize: 13}}>
                {latestChat.text}
              </Text>
            )}
          </View>
        </View>
        <View
          style={{
            flex: 0.8,
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
          }}>
          <ChatListTime
            type={formattedTime.type}
            month={formattedTime.month}
            day={formattedTime.day}
            time={formattedTime.time}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
      <View
        style={{
          paddingTop: 8,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 16,
          marginBottom: 32,
        }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={BackIcon} style={{width: 24, height: 24}} />
        </TouchableOpacity>
        <Text style={{fontSize: 24, fontWeight: '700'}}>채팅목록</Text>
        <View />
      </View>
      <View style={{flex: 1, alignItems: 'center'}}>
        <FlatList
          data={sortLast()}
          renderItem={renderGroups}
          keyExtractor={item => item.id}
        />
      </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    width: width / 1.1,
    height: height / 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
  },
});

export default Chat;
