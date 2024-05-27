import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import dayjs from 'dayjs';
import ChatListTime from '../../components/Chat/ChatListTime';

const {width, height} = Dimensions.get('window');

const ChatRoomItem = ({item, latestChat}) => {
  const navigation = useNavigation();

  const goToChatRoom = () => {
    navigation.navigate('ChatRoom', {
      chatRoomId: item.id,
      chatRoomName: item.name,
      hobbiesId: item.hobbiesId,
      members: item.members,
    });
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

  const formattedTime = latestChat
    ? formatMessageTime(latestChat.timestamp)
    : {type: 'none'};

  return (
    <TouchableOpacity onPress={goToChatRoom} style={styles.container}>
      <View style={styles.ImageWrapper}>
        <Image style={styles.image} source={{uri: item.chatRoomImage}} />
      </View>
      <View style={styles.infoWrapper}>
        <View style={styles.middleWrapper}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.memberLength}>{item.members.length}</Text>
        </View>
        <View style={styles.lastChatWrapper}>
          {latestChat && (
            <Text style={styles.lastChatText}>{latestChat.text}</Text>
          )}
        </View>
      </View>
      <View style={styles.lastChatTime}>
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

const styles = StyleSheet.create({
  container: {
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
  ImageWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  image: {
    width: 52,
    height: 52,
    borderRadius: 8,
  },
  infoWrapper: {
    flex: 3.5,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  middleWrapper: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Pretendard',
  },
  memberLength: {
    fontSize: 14,
    color: '#A7A7A7',
    fontFamily: 'Pretendard',
  },
  lastChatWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 8,
    fontSize: 10,
  },
  lastChatText: {
    color: '#A7A7A7',
    fontSize: 13,
    fontFamily: 'Pretendard',
  },
  lastChatTime: {
    flex: 0.8,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
});

export default ChatRoomItem;
