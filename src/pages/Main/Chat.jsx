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
import auth from '@react-native-firebase/auth';
import {useNavigation} from '@react-navigation/native';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';

const {width, height} = Dimensions.get('window');

const Chat = () => {
  const [chatRooms, setChatRooms] = useState([]);
  const [currentUserUID, setCurrentUserUID] = useState(null);
  const [lastChats, setLastChats] = useState({});
  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      await fetchCurrentUser();
      await fetchChatRooms();
      await fetchLatestMessages();
    };

    fetchData();

    const unsubscribe = navigation.addListener('focus', () => {
      fetchData();
    });

    return () => {
      unsubscribe();
    };
  }, [navigation, currentUserUID]);

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
      console.error('채팅방 가져오기 오류: ', error);
    }
  };

  const fetchLatestMessages = async () => {
    const latestChats = {};
    try {
      for (const room of chatRooms) {
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
      setLastChats(latestChats);
    } catch (error) {
      console.error('오류 발생: ', error);
    }
  };

  const formatMessageTime = timestamp => {
    dayjs.locale('ko');
    const date = dayjs(timestamp);
    const today = dayjs().startOf('day');
    const yesterday = dayjs().subtract(1, 'day').startOf('day');

    if (date.isSame(today, 'day')) {
      return {
        type: 'timeOnly',
        time: date.format('A hh:mm'),
      };
    } else if (date.isSame(yesterday, 'day')) {
      return {
        type: 'yesterday',
      };
    } else {
      return {
        type: 'monthAndDay',
        month: date.format('MM'),
        day: date.format('DD'),
      };
    }
  };

  const sortChatRoomsByLatestMessage = () => {
    return chatRooms.sort((roomA, roomB) => {
      const latestChatA = lastChats[roomA.id];
      const latestChatB = lastChats[roomB.id];
      return latestChatB.timestamp - latestChatA.timestamp;
    });
  };

  const renderGroups = ({item}) => {
    const goToChatRoom = () => {
      navigation.navigate('ChatRoom', {
        chatRoomId: item.id,
        chatRoomName: item.name,
      });
    };

    const latestChat = lastChats[item.id];
    const formattedTime = latestChat
      ? formatMessageTime(latestChat.timestamp)
      : {};

    return (
      <TouchableOpacity onPress={goToChatRoom} style={styles.chatRoomItem}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'flex-start',
          }}>
          <Image
            style={{width: 48, height: 48, borderRadius: 8}}
            source={require('../../assets/images/defaultProfileImg.jpeg')}
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
            <Text
              style={{color: '##BBB4C5', fontSize: 13}}
              numberOfLines={1}
              ellipsizeMode="tail">
              {latestChat ? latestChat.text : ''}
            </Text>
          </View>
        </View>

        <View
          style={{
            justifyContent: 'flex-end',
            paddingBottom: 4,
          }}>
          {formattedTime.type === 'timeOnly' && (
            <Text style={{fontSize: 10, color: '#AEA6B9'}}>
              {formattedTime.time}
            </Text>
          )}
          {formattedTime.type === 'yesterday' && (
            <Text style={{fontSize: 10, color: '#AEA6B9'}}>어제</Text>
          )}
          {formattedTime.type === 'monthAndDay' && (
            <Text style={{fontSize: 10, color: '#AEA6B9'}}>
              {`${formattedTime.month}월 ${formattedTime.day}일`}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{flex: 1}}>
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
          <Image
            source={require('../../assets/newIcons/backIcon.png')}
            style={{width: 24, height: 24}}
          />
        </TouchableOpacity>
        <Text style={{fontSize: 24, fontWeight: '700'}}>채팅목록</Text>
        <View />
      </View>
      <View style={{flex: 1, alignItems: 'center'}}>
        <FlatList
          data={sortChatRoomsByLatestMessage()}
          renderItem={renderGroups}
          keyExtractor={(item, index) => index.toString()}
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
