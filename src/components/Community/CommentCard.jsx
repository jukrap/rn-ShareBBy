import React, {useEffect, useState} from 'react';
import {
  View,
  Image,
  Alert,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {formatDistanceToNow, format} from 'date-fns';
import {ko} from 'date-fns/locale';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Modal from 'react-native-modal';
import BottomSheetModal from './BottomSheetModal';

const CommentCard = ({item, onDelete, onEdit}) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [commentUserData, setCommentUserData] = useState(null);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      setCurrentUser(user);
    });

    fetchCommentUserData();
    return () => unsubscribe();
  }, []);

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  // 댓글 작성자 정보 가져오기
  const fetchCommentUserData = async () => {
    try {
      const documentSnapshot = await firestore()
        .collection('users')
        .doc(item.userId)
        .get();

      if (documentSnapshot.exists) {
        const userData = documentSnapshot.data();
        setCommentUserData({
          profileImage: userData.profileImage,
          nickname: userData.nickname,
        });
      }
    } catch (error) {
      console.log('사용자 데이터를 가져오는 중에 오류가 발생했습니다:', error);
    }
  };

  return (
    <View style={styles.topContainer}>
      <View style={styles.commentCard}>
        <View style={styles.userInfoContainer}>
          <Image
            style={styles.userProfileImage}
            source={
              commentUserData && commentUserData.profileImage
                ? {uri: commentUserData.profileImage}
                : defaultProfileImg
            }
          />
          <View style={styles.userInfoTextContainer}>
            <View style={styles.commentTopContainer}>
              <Text style={styles.userNameText}>
                {commentUserData?.nickname}
              </Text>
              <View style={styles.moreIconContainer}>
                <TouchableOpacity onPress={toggleModal}>
                  <Image
                    style={styles.moreIcon}
                    resizeMode="cover"
                    source={moreIcon}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.commentContentText}>
              {item.comment_content}
            </Text>
            <Text style={styles.commentTimeText}>
              {format(item.comment_created.toDate(), 'yyyy.MM.dd HH:mm', {
                locale: ko,
              })}
            </Text>
            <View style={styles.separator} />
          </View>
        </View>
      </View>
      <BottomSheetModal isVisible={isModalVisible} onClose={toggleModal}>
        <View style={styles.modalContent}>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => {
              onEdit(item.id);
              toggleModal();
            }}>
            <Image source={pencilIcon} style={{width: 24, height: 24}} />
            <Text style={styles.modalButtonText}>댓글 수정</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => {
              onDelete(item.id);
              toggleModal();
            }}>
            <Image source={deleteIcon} style={{width: 24, height: 24}} />
            <Text style={styles.modalButtonText}>댓글 삭제</Text>
          </TouchableOpacity>
        </View>
      </BottomSheetModal>
    </View>
  );
};

export default CommentCard;

const moreIcon = require('../../assets/newIcons/moreIcon.png');
const pencilIcon = require('../../assets/newIcons/pencil-icon.png');
const deleteIcon = require('../../assets/newIcons/deleteIcon.png');
const defaultProfileImg = require('../../assets/images/defaultProfileImg.jpeg');

const styles = StyleSheet.create({
  topContainer: {
    backgroundColor: '#FEFFFE',
  },
  separator: {
    height: 1,
    backgroundColor: '#D9D9D9',
    width: '100%',
    marginTop: 16,
  },
  commentCard: {
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  userProfileImage: {
    width: 48,
    height: 48,
    borderRadius: 100,
    marginRight: 16,
  },
  userInfoTextContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  commentTopContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  moreIconContainer: {
    justifyContent: 'center',
  },
  moreIcon: {
    width: 24,
    height: 24,
  },
  userNameText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Pretendard',
    color: '#212529',
  },
  commentContentText: {
    fontSize: 14,
    fontFamily: 'Pretendard',
    marginBottom: 10,
    marginRight: 8,
  },
  commentTimeText: {
    fontSize: 11,
    fontFamily: 'Pretendard',
    color: '#898989',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FEFFFE',
    padding: 16,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FEFFFE',
  },
  modalButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Pretendard',
    color: '#898989',
  },
  modalCloseButton: {
    backgroundColor: '#FEFFFE',
    padding: 16,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontFamily: 'Pretendard',
    color: '#212529',
  },
});
