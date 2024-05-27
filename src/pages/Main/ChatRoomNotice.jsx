import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Dimensions,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import dayjs from 'dayjs';
import {BackIcon, GreenPencilIcon} from '../../assets/assets';

const ChatRoomNotice = ({navigation, route}) => {
  const {width, height} = Dimensions.get('window');
  const {chatRoomId} = route.params;
  const [notices, setNotices] = useState([]);

  const fetchNotices = useCallback(async () => {
    try {
      const querySnapshot = await firestore()
        .collection('chatRooms')
        .doc(chatRoomId)
        .collection('notice')
        .orderBy('timestamp', 'desc')
        .get();
      const fetchedNotices = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setNotices(fetchedNotices);
    } catch (error) {
      console.error('Error fetching notices:', error);
    }
  }, [chatRoomId]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => {
      fetchNotices();
    });

    return unsubscribeFocus;
  }, [navigation, fetchNotices]);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const goToWriteNotice = () => {
    navigation.navigate('WriteNotice', {
      chatRoomId: chatRoomId,
    });
  };

  const renderNotices = ({item}) => {
    const date = item.timestamp.toDate();
    const formattedTime = dayjs(date).format('YYYY년 MM월 DD일 A hh:mm');

    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('NoticeDetail', {
            notices: item,
            chatRoomId: chatRoomId,
          })
        }
        style={{
          width: width,
          height: height / 16,
          gap: 6,
          paddingHorizontal: 6,
          paddingVertical: 6,
          borderBottomWidth: 0.5,
          borderBottomColor: '#ccc',
        }}>
        <View>
          <Text
            style={{fontWeight: '600'}}
            numberOfLines={1}
            ellipsizeMode="tail">
            {item.text}
          </Text>
        </View>
        <View style={{flexDirection: 'row', gap: 8}}>
          <View>
            <Text
              style={{justifyContent: 'flex-end', fontSize: 12, color: '#aaa'}}>
              {formattedTime}
            </Text>
          </View>
          <View style={{justifyContent: 'flex-end'}}>
            <Text style={{fontSize: 12, color: '#aaa'}}>{item.sender}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#fefffe'}}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleGoBack}>
          <Image source={BackIcon} style={{width: 24, height: 24}} />
        </TouchableOpacity>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
          <Text style={styles.roomName}>공지사항</Text>
        </View>
        <TouchableOpacity onPress={goToWriteNotice}>
          <Image style={{width: 24, height: 24}} source={GreenPencilIcon} />
        </TouchableOpacity>
      </View>
      <View style={{flex: 1}}>
        <FlatList
          data={notices}
          renderItem={renderNotices}
          keyExtractor={item => item.id}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  topBar: {
    backgroundColor: '#fefffe',
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
});

export default ChatRoomNotice;
