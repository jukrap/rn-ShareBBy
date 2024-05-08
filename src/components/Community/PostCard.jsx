import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Modal,
} from 'react-native';
import ProgressiveImage from './ProgressiveImage';
import {formatDistanceToNow} from 'date-fns';
import {ko} from 'date-fns/locale';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const PostCard = ({item, onDelete, onComment, onEdit, onProfile, onDetail}) => {
  const [postUserData, setPostUserData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(item.likeCount || 0);
  const likeIcon = isLiked ? heartLineIcon : heartRedIcon;
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchPostUserData();
  }, []);

  useEffect(() => {
    fetchCommentCount();
  }, []);

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  useEffect(() => {
    // 현재 사용자가 해당 게시글에 좋아요를 눌렀는지 확인
    const checkLikeStatus = async () => {
      if (currentUser) {
        const likeDoc = await firestore()
          .collection('likes')
          .where('postId', '==', item.id)
          .where('userId', '==', currentUser.uid)
          .get();

        if (!likeDoc.empty) {
          setIsLiked(true);
        }
      }
    };

    checkLikeStatus();
  }, [currentUser, item.id]);

  // 좋아요 개수 가져오기
  const getLikeCount = () => {
    return item.post_like ? `${item.post_like}` : '0';
  };

  // 댓글 개수 가져오기 (TODO: 댓글 카운팅 제작)
  const getCommentCount = () => {
    return '0';
  };

  // 게시글 작성자 정보 가져오기
  const fetchPostUserData = async () => {
    try {
      const documentSnapshot = await firestore()
        .collection('users')
        .doc(item.userId)
        .get();
      if (documentSnapshot.exists) {
        const userData = documentSnapshot.data();
        setPostUserData({
          profileImage: userData.profileImage,
          nickname: userData.nickname,
        });
      }
    } catch (error) {
      console.log('사용자 데이터를 가져오는 중에 오류가 발생했습니다:', error);
    }
  };

  const fetchCommentCount = async () => {
    try {//개수 새로이 로딩하는 거 개선 필요
      //그냥 개수 카운팅 별도로 하는 게 나을지도
      const querySnapshot = await firestore()
        .collection('comments')
        .where('postId', '==', item.id)
        .get();

      const count = querySnapshot.size;
      setCommentCount(count);
    } catch (error) {
      console.log('댓글 수를 가져오는 중에 오류가 발생했습니다:', error);
    }
  };

  const handleLikePress = async () => {
    if (currentUser) {
      if (isLiked) {
        // 좋아요 취소
        await firestore()
          .collection('likes')
          .where('postId', '==', item.id)
          .where('userId', '==', currentUser.uid)
          .get()
          .then(querySnapshot => {
            querySnapshot.forEach(doc => {
              doc.ref.delete();
            });
          });

        setIsLiked(false);
        setLikeCount(prevCount => prevCount - 1);

        // 파베 내 게시글 doc의 likeCount 감소
        await firestore()
          .collection('posts')
          .doc(item.id)
          .update({
            likeCount: firestore.FieldValue.increment(-1),
          });
      } else {
        // 좋아요 추가
        await firestore().collection('likes').add({
          postId: item.id,
          userId: currentUser.uid,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });

        setIsLiked(true);
        setLikeCount(prevCount => prevCount + 1);

        // 파베 내 게시글 doc의 likeCount 늘리기
        await firestore()
          .collection('posts')
          .doc(item.id)
          .update({
            likeCount: firestore.FieldValue.increment(1),
          });
      }
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.userInfoContainer}>
        <TouchableOpacity
          style={styles.userInfoWrapper}
          onPress={() => onProfile(item.userId)}>
          <Image
            style={styles.userProfileImage}
            source={
              postUserData && postUserData.profileImage
                ? {uri: postUserData.profileImage}
                : require('../../assets/images/defaultProfileImg.jpeg')
            }
          />
          <View style={styles.userInfoTextContainer}>
            <Text style={styles.userNameText}>{postUserData?.nickname}</Text>
            <Text style={styles.postTimeText}>
              {formatDistanceToNow(item.post_created.toDate(), {
                addSuffix: true,
                locale: ko,
              })}
            </Text>
          </View>
        </TouchableOpacity>
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
      <TouchableOpacity onPress={onDetail}>
        <Text style={styles.postContentText} ellipsizeMode="tail">
          {item.post_content ? item.post_content.slice(0, 300) : ''}
          {item.post_content && item.post_content.length > 300 && (
            <>
              ... <Text style={styles.readMoreText}>더보기</Text>
            </>
          )}
        </Text>
      </TouchableOpacity>
      {item.post_files && item.post_files.length > 0 ? (
        <View style={styles.postImageWrapper}>
          {item.post_files.map((imageUrl, index) => {
            return (
              <Image
                key={index}
                defaultImageSource={defaultPostImg}
                source={{uri: imageUrl}}
                style={styles.postImage}
                resizeMode="cover"
              />
            );
          })}
        </View>
      ) : (
        <View style={styles.divider} />
      )}
      <View style={styles.interactionContainer}>
        <View style={styles.leftInteractionContainer}>
          <TouchableOpacity
            style={[
              styles.interactionButton,
              isLiked && styles.activeInteractionButton,
            ]}
            onPress={handleLikePress}>
            <Image
              source={isLiked ? heartRedIcon : heartLineIcon}
              style={{width: 24, height: 24}}
            />
            <Text
              style={[
                styles.interactionText,
                isLiked && styles.activeInteractionText,
              ]}>
              {likeCount}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.interactionButton}
            onPress={onComment}>
            <Image source={commentLineIcon} style={{width: 24, height: 24}} />
            <Text style={styles.interactionText}>{commentCount}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.rightInteractionContainer}>
          <TouchableOpacity style={styles.interactionButton}>
            <Image source={shareIcon} style={{width: 24, height: 24}} />
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                onEdit(item.id); // 게시글 수정 기능 호출
                toggleModal();
              }}>
              <Image source={pencilIcon} style={{width: 24, height: 24}} />
              <Text style={styles.modalButtonText}>게시글 수정</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                onDelete(item.id); // 게시글 삭제 기능 호출
                toggleModal();
              }}>
              <Image source={deleteIcon} style={{width: 24, height: 24}} />
              <Text style={styles.modalButtonText}>게시글 삭제</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={toggleModal}>
            <Text style={styles.modalCloseButtonText}>닫기</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const moreIcon = require('../../assets/icons/moreIcon.png');
const commentLineIcon = require('../../assets/icons/commentLineIcon.png');
const commentFillIcon = require('../../assets/icons/commentFillIcon.png');
const heartLineIcon = require('../../assets/icons/heartLineIcon.png');
const heartRedIcon = require('../../assets/icons/heartRedIcon.png');
const shareIcon = require('../../assets/icons/shareIcon.png');
const pencilIcon = require('../../assets/icons/pencilIcon.png');
const deleteIcon = require('../../assets/icons/deleteIcon.png');
const defaultPostImg = require('../../assets/images/defaultPostImg.jpg');

export default PostCard;

const styles = StyleSheet.create({
  card: {
    width: Dimensions.get('window').width,
    maxWidth: Dimensions.get('window').width - 60,
    marginBottom: 24,
    alignSelf: 'center',
    borderRadius: 10,
    backgroundColor: '#fefffe',
    borderStyle: 'solid',
    borderColor: '#dbdbdb',
    borderWidth: 1,
    flex: 1,
    padding: 16,
    overflow: 'hidden',
  },
  userInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  userInfoWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 8,
  },
  userProfileImage: {
    width: 40,
    height: 40,
    borderRadius: 50,
  },
  userInfoTextContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginLeft: 10,
  },
  userNameText: {
    fontSize: 15,
    letterSpacing: 0,
    fontWeight: '500',
    fontFamily: 'Pretendard',
    color: '#212529',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    marginBottom: 4,
  },
  postTimeText: {
    fontSize: 10,
    letterSpacing: 0,
    fontFamily: 'Pretendard',
    color: '#898989',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
  },
  moreIconContainer: {
    justifyContent: 'center',
  },
  moreIcon: {
    width: 24,
    height: 24,
  },
  postContentText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    fontFamily: 'Pretendard',
    color: '#898989',
    textAlign: 'left',
    marginBottom: 16,
  },
  postImageWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  postImage: {
    width: '48%',
    height: 150,
    marginBottom: 8,
  },

  divider: {},
  interactionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftInteractionContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  rightInteractionContainer: {
    flexDirection: 'row',
  },
  interactionButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    borderRadius: 5,
    padding: 2,
  },
  activeInteractionButton: {},
  interactionText: {
    fontSize: 12,
    fontFamily: 'Pretendard',
    color: '#212529',
    marginTop: 4,
    marginLeft: 8,
  },
  activeInteractionText: {
    color: '#E4694E',
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Pretendard',
    color: '#898989',
    textDecorationLine: 'underline',
    paddingLeft: 20,
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
    color: '#898989',
  },
  modalCloseButton: {
    backgroundColor: '#FEFFFE',
    padding: 16,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 16,
    color: '#212529',
  },
});
