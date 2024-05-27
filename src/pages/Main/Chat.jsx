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
import ChatRoomItem from '../../components/Chat/ChatRoomItem';
import {BackIcon} from '../../assets/assets';

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
    const latestChat = lastChat[item.id];
    return <ChatRoomItem item={item} latestChat={latestChat} />;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          paddingTop: 8,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 16,
          marginBottom: 32,
        }}>
        <TouchableOpacity style={{flex: 1}} onPress={() => navigation.goBack()}>
          <Image source={BackIcon} style={{width: 24, height: 24}} />
        </TouchableOpacity>
        <View style={{flex: 1, alignItems: 'center'}}>
          <Text
            style={{fontSize: 24, fontWeight: '700', fontFamily: 'Pretendard'}}>
            채팅목록
          </Text>
        </View>
        <View style={{flex: 1, backgroundColor: 'green'}} />
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
    backgroundColor: '#fefffe',
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
});

export default Chat;
