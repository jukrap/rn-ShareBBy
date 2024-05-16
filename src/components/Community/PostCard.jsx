import React, {useEffect, useState} from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {formatDistanceToNow} from 'date-fns';
import {ko} from 'date-fns/locale';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import BottomSheetModal from './BottomSheetModal';
import ImageDetailModal from './ImageDetailModal';
import {FasterImageView} from '@candlefinance/faster-image';
import ImageSlider from './ImageSlider';
import LoginToast from '../SignUp/LoginToast';

const {width, height} = Dimensions.get('window');

const PostCard = ({item, onDelete, onComment, onEdit, onProfile, onDetail}) => {
  const [postUserData, setPostUserData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null); //나중에 전부 통일해서 빈문자열로 교체
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(item.likeCount || 0);
  const likeIcon = isLiked ? HeartIcon : RedHeartIcon;
  const [commentCount, setCommentCount] = useState(item.commentCount || 0);
  const [isLikeProcessing, setIsLikeProcessing] = useState(false);
  const [isMoreContent, setIsMoreContent] = useState(false);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isChatOutModalVisible, setIsChatOutModalVisible] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleSharePress = () => {
    setIsChatOutModalVisible(true);
  };

  const colors = ['tomato', 'thistle', 'skyblue', 'teal'];

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      setCurrentUser(user);
    });

    fetchPostUserData();
    return () => unsubscribe();
  }, []);

  const toggleReportModal = async () => {
    try {
      // 해당 유저 정보 가져오기
      const userDoc = await firestore().collection('users').doc(item.userId).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        let reportCount = userData.report || 0;
        reportCount++; 
        
        await firestore().collection('users').doc(item.userId).update({ report: reportCount });
        // 모달이 닫힐 때 토스트를 보여주기
        setIsModalVisible(!isModalVisible);
        setShowToast(true);

      } else {
        console.log("해당 유저 정보가 존재하지 않습니다.");
      }
    } catch (error) {
      console.error("유저 정보를 업데이트하는 중에 오류가 발생했습니다:", error);
    }
  };

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  useFocusEffect(
    React.useCallback(() => {
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
          } else {
            setIsLiked(false);
          }
        }
      };
      checkLikeStatus();
      updateLikeCount();
      updateCommentCount();
    }, [currentUser, item.id]),
  );
  // 좋아요 카운팅 업데이트
  const updateLikeCount = async () => {
    const postDoc = await firestore().collection('posts').doc(item.id).get();
    if (postDoc.exists) {
      const postData = postDoc.data();
      setLikeCount(postData.likeCount || 0);
    }
  };

  const updateCommentCount = async () => {
    try {
      const postDoc = await firestore().collection('posts').doc(item.id).get();
      if (postDoc.exists) {
        const postData = postDoc.data();
        setCommentCount(postData.commentCount || 0);
      }
    } catch (error) {
      console.log('댓글 개수를 가져오는 중에 오류가 발생했습니다:', error);
    }
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

  const handleLikePress = async () => {
    //handleIsLike로 함수명 변경
    if (currentUser && !isLikeProcessing) {
      setIsLikeProcessing(true);

      try {
        if (isLiked) {
          // 좋아요 취소 처리
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

          await firestore()
            .collection('posts')
            .doc(item.id)
            .update({
              likeCount: firestore.FieldValue.increment(-1),
            });
        } else {
          // 좋아요 추가 처리
          await firestore().collection('likes').add({
            postId: item.id,
            userId: currentUser.uid,
            createdAt: firestore.FieldValue.serverTimestamp(),
          });
          //try catch 깊이 좀 줄이기 (특정 부분 함수로 빼던지 하기)
          setIsLiked(true);
          setLikeCount(prevCount => prevCount + 1);

          await firestore()
            .collection('posts')
            .doc(item.id)
            .update({
              likeCount: firestore.FieldValue.increment(1),
            });
        }
      } catch (error) {
        console.log('좋아요 처리 중 오류 발생:', error);
      }

      setIsLikeProcessing(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.userInfoContainer}>
        <View
          style={styles.userInfoWrapper}>
          <FasterImageView
            style={[styles.userProfileImage, {overflow: 'hidden'}]}
            source={{
              url: postUserData?.profileImage,
              priority: 'high',
              cachePolicy: 'discWithCacheControl',
              failureImageUrl: DefaultProfileIcon,
              resizeMode: 'cover',
              borderRadius: 50,
            }}
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
        </View>
        <View style={styles.moreIconContainer}>
          <TouchableOpacity onPress={toggleModal}>
            <Image
              style={styles.moreIcon}
              resizeMode="cover"
              source={MoreIcon}
            />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity onPress={onDetail}>
        <Text
          style={styles.postContentText}
          numberOfLines={2}
          ellipsizeMode="tail"
          onTextLayout={({nativeEvent: {lines}}) => {
            if (lines.length > 2) {
              setIsMoreContent(true);
            } else {
              setIsMoreContent(false);
            }
          }}>
          {item.post_content}
        </Text>
        {isMoreContent && <Text style={styles.readMoreText}>...더보기</Text>}
      </TouchableOpacity>
      {item?.post_files?.length > 0 ? (
        <ImageSlider
          images={item.post_files}
          autoSlide={true}
          autoSlideInterval={5000}
        />
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
              source={isLiked ? RedHeartIcon : HeartIcon}
              style={{width: 20, height: 20}}
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
            <Image source={CommentLineIcon} style={{width: 20, height: 20}} />
            <Text style={styles.interactionText}>{commentCount}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.rightInteractionContainer}>
          <TouchableOpacity
            style={styles.interactionButton}
            onPress={handleSharePress}>
            <Image source={ShareIcon} style={{width: 20, height: 20}} />
          </TouchableOpacity>
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
            <Image source={PencilIcon} style={{width: 20, height: 20}} />
            <Text style={styles.modalButtonText}>게시글 수정</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => {
              onDelete(item.id);
              toggleModal();
            }}>
            <Image source={DeleteIcon} style={{width: 20, height: 20}} />
            <Text style={styles.modalButtonText}>게시글 삭제</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.modalButton}
            onPress={toggleReportModal}>
            <Image source={CautionIcon} style={{width: 20, height: 20}} />
            <Text style={styles.modalButtonText}>신고하기</Text>
          </TouchableOpacity>
        </View>
      </BottomSheetModal>
      {isImageModalVisible && (
        <ImageDetailModal
          images={item.post_files}
          currentIndex={currentImageIndex}
          isVisible={isImageModalVisible}
          onClose={() => setIsImageModalVisible(false)}
        />
      )}
      <LoginToast
          text="신고되었습니다."
          visible={showToast}
          handleCancel={() => setShowToast(false)}
        />
    </View>
  );
};
import {
  MoreIcon,
  CommentLineIcon,
  HeartIcon,
  RedHeartIcon,
  ShareIcon,
  PencilIcon,
  DeleteIcon,
  CautionIcon ,
  DefaultProfileIcon,
} from '../../assets/assets';
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
    width: 20,
    height: 20,
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
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderRadius: 8,
  },
  postSwiperFlatList: {},
  postImage: {
    height: height * 0.3,
    width,
  },
  paginationStyleItems: {
    top: 40,
    width: 4,
    height: 4,
    borderRadius: 50,
    marginHorizontal: 2,
  },
  paginationStyleItemActives: {
    top: 39,
    width: 6,
    height: 6,
    borderRadius: 50,
    marginHorizontal: 2,
  },
  divider: {},
  interactionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
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
    color: '#A7A7A7',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  modalContainer: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalViewContainer: {
    backgroundColor: '#FEFFFE',
    paddingTop: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalContent: {
    padding: 16,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#FEFFFE',
  },
  modalButtonText: {
    marginLeft: 16,
    marginBottom: 2,
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
  imageSliderContainer: {
    height: height * 0.3,
    marginBottom: 24,
    borderRadius: 8,
    overflow: 'hidden',
  },
  imageSliderImage: {
    width,
    height: height * 0.3,
  },
});
