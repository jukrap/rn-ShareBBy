import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
} from 'react-native';
import dayjs from 'dayjs';
import firestore from '@react-native-firebase/firestore';
import Modal from 'react-native-modal';

import {BackIcon} from '../../assets/assets';

const NoticeDetail = ({navigation, route}) => {
  const {notices, chatRoomId} = route.params;
  const date = notices.timestamp.toDate();
  const formattedTime = dayjs(date).format('YYYY년 MM월 DD일 A hh:mm');
  const [profileImg, setProfileImg] = useState('');
  const [chatOutModalVisible, setChatOutModalVisible] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userSnapshot = await firestore()
          .collection('users')
          .doc(notices.senderId)
          .get();

        const senderProfileImg = userSnapshot.data().profileImage;
        setProfileImg(senderProfileImg);
      } catch (error) {
        console.error('Error fetching:', error);
      }
    };

    fetchUser();
  }, []);

  const handleDelete = async () => {
    try {
      await firestore()
        .collection('chatRooms')
        .doc(chatRoomId)
        .collection('notice')
        .doc(notices.id)
        .delete();

      navigation.goBack();
    } catch (error) {
      console.error('Error deleting notice:', error);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleGoBack}>
          <Image source={BackIcon} style={{width: 24, height: 24}} />
        </TouchableOpacity>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
          <Text style={styles.roomName}>상세보기</Text>
        </View>
        <TouchableOpacity
          onPress={() => setChatOutModalVisible(!chatOutModalVisible)}>
          <Text
            style={{
              color: '#07AC7D',
              fontWeight: '700',
              fontFamily: 'Pretendard',
            }}>
            삭제하기
          </Text>
        </TouchableOpacity>
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 12,
          paddingVertical: 12,
        }}>
        <View>
          {profileImg !== '' && (
            <Image
              style={{width: 32, height: 32, borderRadius: 10}}
              source={{uri: profileImg}}
            />
          )}
        </View>
        <View
          style={{
            paddingHorizontal: 12,
            paddingVertical: 12,
          }}>
          <Text style={{fontSize: 12, fontFamily: 'Pretendard'}}>
            {notices.sender}
          </Text>
          <Text style={{fontSize: 12, color: '#aaa', fontFamily: 'Pretendard'}}>
            {formattedTime}
          </Text>
        </View>
      </View>

      <View style={{paddingHorizontal: 12}}>
        <Text style={{fontFamily: 'Pretendard'}}>{notices.text}</Text>
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
        onBackButtonPress={() => setChatOutModalVisible(!chatOutModalVisible)}
        onBackdropPress={() => setChatOutModalVisible(!chatOutModalVisible)}>
        <View style={styles.chatOutConfirm}>
          <View
            style={{
              padding: 16,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text style={styles.pressText}>정말 삭제하시겠습니까?</Text>
          </View>
          <View style={styles.pressOptionView}>
            <TouchableOpacity
              activeOpacity={0.6}
              style={[styles.pressOptionBtn, {backgroundColor: '#07AC7D'}]}
              onPress={handleDelete}>
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
  );
};

const styles = StyleSheet.create({
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

export default NoticeDetail;
