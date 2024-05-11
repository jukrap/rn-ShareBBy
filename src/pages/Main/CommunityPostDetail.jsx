import React, {useState, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  Alert,
  FlatList,
  TextInput,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import CommentCard from '../../components/Community/CommentCard';
import {formatDistanceToNow} from 'date-fns';
import {ko} from 'date-fns/locale';
import Modal from 'react-native-modal';
import {useNavigation} from '@react-navigation/native';
import {SwiperFlatList} from 'react-native-swiper-flatlist';
import BottomSheetModal from '../../components/Community/BottomSheetModal';
import CommunityHeader from '../../components/Community/CommunityHeader';
import ImageDetailModal from '../../components/Community/ImageDetailModal';

const {width, height} = Dimensions.get('window');

const CommunityPostDetail = ({route}) => {
  const navigation = useNavigation();
  const [posts, setPosts] = useState(null);
  const [postUserData, setPostUserData] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState('');
  const [commentContentLength, setCommentContentLength] = useState(0);
  const [postId, setPostId] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [isLikeProcessing, setIsLikeProcessing] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lastVisible, setLastVisible] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const maxCommentContentLength = 200;

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // CommunityPostDetail로 돌아올 때마다 실행
      fetchPost(postId);
    });

    return unsubscribe;
  }, [navigation, postId]);

  useEffect(() => {
    const {postId} = route.params;
    setPostId(postId);
    fetchPost(postId);
  }, [route.params]);

  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId]);

  useFocusEffect(
    React.useCallback(() => {
      // 현재 사용자가 해당 게시글에 좋아요를 눌렀는지 확인
      const checkLikeStatus = async () => {
        if (currentUser) {
          const likeDoc = await firestore()
            .collection('likes')
            .where('postId', '==', postId)
            .where('userId', '==', currentUser.uid)
            .get();

          if (!likeDoc.empty) {
            setIsLiked(true);
          }
        }
      };

      checkLikeStatus();
    }, [currentUser, postId]),
  );

  const fetchPost = async postId => {
    try {
      const documentSnapshot = await firestore()
        .collection('posts')
        .doc(postId)
        .get();

      if (documentSnapshot.exists) {
        const postData = documentSnapshot.data();
        setPosts(postData);
        fetchPostUserData(postData.userId);
        setLikeCount(postData.likeCount || 0);
        setCommentCount(postData.commentCount || 0);
      }
    } catch (error) {
      console.log('게시글을 가져오는 중에 오류가 발생했습니다:', error);
    }
  };

  const fetchPostUserData = async userId => {
    try {
      const documentSnapshot = await firestore()
        .collection('users')
        .doc(userId)
        .get();

      if (documentSnapshot.exists) {
        const userData = documentSnapshot.data();
        setPostUserData(userData);
      }
    } catch (error) {
      console.log('사용자 데이터를 가져오는 중에 오류가 발생했습니다:', error);
    }
  };

  const fetchComments = async () => {
    try {
      const querySnapshot = await firestore()
        .collection('comments')
        .where('comment_actflag', '==', true)
        .where('postId', '==', postId)
        .orderBy('comment_created', 'asc')
        .limit(10)
        .get();

      const commentData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setComments(commentData);
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
    } catch (error) {
      console.log('댓글을 가져오는 중에 오류가 발생했습니다:', error);
    }
  };

  const fetchMoreComments = async () => {
    if (lastVisible) {
      setRefreshing(true);

      try {
        const querySnapshot = await firestore()
          .collection('comments')
          .where('comment_actflag', '==', true)
          .where('postId', '==', postId)
          .orderBy('comment_created', 'asc')
          .startAfter(lastVisible)
          .limit(10)
          .get();

        const newComments = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setComments([...comments, ...newComments]);
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
        setRefreshing(false);
      } catch (error) {
        console.log('추가 댓글을 가져오는 중에 오류가 발생했습니다:', error);
        setRefreshing(false);
      }
    }
  };

  const renderFooter = () => {
    if (!refreshing) return null;

    return (
      <ActivityIndicator
        size="large"
        color="#07AC7D"
        style={{marginVertical: 16, marginBottom: 32}}
      />
    );
  };

  const handleLikePress = async () => {
    if (currentUser && !isLikeProcessing) {
      setIsLikeProcessing(true);

      try {
        if (isLiked) {
          await firestore()
            .collection('likes')
            .where('postId', '==', postId)
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
            .doc(postId)
            .update({
              likeCount: firestore.FieldValue.increment(-1),
            });
        } else {
          await firestore().collection('likes').add({
            postId: postId,
            userId: currentUser.uid,
            createdAt: firestore.FieldValue.serverTimestamp(),
          });

          setIsLiked(true);
          setLikeCount(prevCount => prevCount + 1);

          await firestore()
            .collection('posts')
            .doc(postId)
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

  const handleCommentSubmit = useCallback(() => {
    if (editingCommentId) {
      updateComment();
    } else {
      if (commentContent && commentContent.trim() !== '') {
        submitComment();
      } else {
        Alert.alert('댓글 내용을 입력해주세요.');
      }
    }
  }, [commentContent, editingCommentId, submitComment, updateComment]);

  const handleCommentContentChange = text => {
    if (text.length <= maxCommentContentLength) {
      setCommentContent(text);
      setCommentContentLength(text.length);
    }
  };

  const submitComment = async () => {
    if (!commentContent || commentContent.trim() === '') {
      Alert.alert('댓글 내용을 입력해주세요.');
      return;
    }
    if (!currentUser) {
      console.log('사용자가 로그인되어 있지 않습니다.');
      return;
    }

    try {
      await firestore()
        .collection('comments')
        .add({
          postId,
          userId: currentUser.uid,
          comment_content: commentContent,
          comment_created: firestore.Timestamp.fromDate(new Date()),
          comment_actflag: true,
        });

      console.log('댓글 업로드 완료!');
      Alert.alert('댓글 업로드!', '성공적으로 댓글이 업로드됐습니다!');
      setCommentContent('');

      // 댓글 개수 업데이트
      await firestore()
        .collection('posts')
        .doc(postId)
        .update({
          commentCount: firestore.FieldValue.increment(1),
        });

      fetchPost(postId);
      fetchComments();
    } catch (error) {
      console.log(
        'Firestore에 댓글을 추가하는 중에 문제가 발생했습니다.',
        error,
      );
    }
  };

  const handleDelete = () => {
    const selectedPost = posts;
    if (
      selectedPost &&
      currentUser &&
      currentUser.uid === selectedPost.userId
    ) {
      Alert.alert(
        '게시글 삭제',
        '해당 게시글을 삭제하겠습니까?',
        [
          {
            text: '아니오',
            onPress: () => console.log('아니오를 클릭'),
            style: 'cancel',
          },
          {
            text: '네',
            onPress: () => deletePost(),
          },
        ],
        {cancelable: false},
      );
    } else {
      Alert.alert('권한 없음', '게시글 작성자만 삭제할 수 있습니다.');
    }
  };

  const deletePost = async () => {
    firestore()
      .collection('posts')
      .doc(postId)
      .update({
        post_actflag: false,
      })
      .then(() => {
        Alert.alert('게시글 삭제', '게시글이 성공적으로 삭제되었습니다!');
        navigation.goBack();
      })
      .catch(e => {
        console.log('게시물을 삭제하는 중에 오류가 발생', e);
      });
  };

  const handleEdit = () => {
    const selectedPost = posts;
    if (
      selectedPost &&
      currentUser &&
      currentUser.uid === selectedPost.userId
    ) {
      editPost();
    } else {
      Alert.alert('권한 없음', '게시글 작성자만 수정할 수 있습니다.');
    }
  };

  const editPost = () => {
    navigation.navigate('CommunityEditPost', {postId});
  };

  const handleCommentDelete = commentId => {
    if (comments) {
      const selectedComment = comments.find(item => item.id === commentId);
      if (
        selectedComment &&
        currentUser &&
        currentUser.uid === selectedComment.userId
      ) {
        Alert.alert(
          '댓글 삭제',
          '해당 댓글을 삭제하겠습니까?',
          [
            {
              text: '아니오',
              onPress: () => console.log('아니오를 클릭'),
              style: 'cancel',
            },
            {
              text: '네',
              onPress: () => deleteComment(commentId),
            },
          ],
          {cancelable: false},
        );
      } else {
        Alert.alert('권한 없음', '댓글 작성자만 삭제할 수 있습니다.');
      }
    }
  };

  const deleteComment = async commentId => {
    try {
      await firestore().collection('comments').doc(commentId).update({
        comment_actflag: false,
      });

      Alert.alert('댓글 삭제', '댓글이 성공적으로 삭제되었습니다!');

      // 댓글 개수 업데이트
      await firestore()
        .collection('posts')
        .doc(postId)
        .update({
          commentCount: firestore.FieldValue.increment(-1),
        });

      fetchPost(postId);
      fetchComments();
    } catch (error) {
      console.log('댓글을 삭제하는 중에 오류가 발생', error);
    }
  };

  const handleCommentEdit = commentId => {
    if (comments) {
      const selectedComment = comments.find(item => item.id === commentId);
      if (
        selectedComment &&
        currentUser &&
        currentUser.uid === selectedComment.userId
      ) {
        setEditingCommentId(commentId);
        setCommentContent(selectedComment.comment_content);
      } else {
        Alert.alert('권한 없음', '댓글 작성자만 수정할 수 있습니다.');
      }
    }
  };

  const updateComment = async () => {
    if (!commentContent || commentContent.trim() === '') {
      Alert.alert('댓글 내용을 입력해주세요.');
      return;
    }

    try {
      await firestore().collection('comments').doc(editingCommentId).update({
        comment_content: commentContent,
      });

      console.log('댓글 수정 완료!');
      Alert.alert('댓글 수정!', '성공적으로 댓글이 수정되었습니다!');
      setCommentContent('');
      setEditingCommentId(null);
      fetchComments();
    } catch (error) {
      console.log('댓글을 수정하는 중에 오류가 발생했습니다.', error);
    }
  };

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  if (!posts || !postUserData) {
    return null;
  }

  const renderPostContent = () => (
    <View style={styles.postContainer}>
      <View style={styles.postInContainer}>
        <View style={styles.userInfoContainer}>
          <View style={styles.userInfoWrapper}>
            <Image
              style={styles.userProfileImage}
              source={
                postUserData.profileImage
                  ? {uri: postUserData.profileImage}
                  : defaultProfileImg
              }
            />
            <View style={styles.userInfoTextContainer}>
              <Text style={styles.userNameText}>{postUserData.nickname}</Text>
              <Text style={styles.postTimeText}>
                {formatDistanceToNow(posts.post_created.toDate(), {
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
                source={moreIcon}
              />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.postContentText}>{posts.post_content}</Text>
        {posts?.post_files?.length > 0 ? (
          <View style={styles.postImageWrapper}>
            <SwiperFlatList
              autoplay
              autoplayDelay={5}
              autoplayLoop
              showPagination
              paginationDefaultColor="#DBDBDB"
              paginationActiveColor="#07AC7D"
              paginationStyleItem={styles.paginationStyleItems}
              paginationStyleItemActive={styles.paginationStyleItemActives}
              data={posts.post_files}
              style={styles.postSwiperFlatList}
              renderItem={({item, index}) => (
                <TouchableOpacity
                  onPress={() => {
                    setCurrentImageIndex(index);
                    setIsImageModalVisible(true);
                  }}>
                  <Image
                    style={styles.postImage}
                    source={{uri: item}}
                    resizeMode="cover"
                    defaultSource={defaultPostImg}
                  />
                </TouchableOpacity>
              )}
            />
          </View>
        ) : (
          <View style={styles.divider} />
        )}

        <View style={styles.separatorTop} />
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
            <View style={styles.interactionButton} onPress={() => {}}>
              <Image source={commentLineIcon} style={{width: 24, height: 24}} />
              <Text style={styles.interactionText}>{commentCount}</Text>
            </View>
          </View>
          <View style={styles.rightInteractionContainer}>
            <TouchableOpacity style={styles.interactionRightButton}>
              <Image source={shareIcon} style={{width: 24, height: 24}} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={styles.separatorBottom} />
      {isImageModalVisible && (
        <ImageDetailModal
          images={posts.post_files}
          currentIndex={currentImageIndex}
          isVisible={isImageModalVisible}
          onClose={() => setIsImageModalVisible(false)}
        />
      )}
    </View>
  );

  const renderEmptyComment = () => (
    <View style={styles.emptyCommentContainer}>
      <Image source={writeCommentIcon} style={styles.emptyCommentIcon} />
      <Text style={styles.emptyCommentText}>
        댓글이 없습니다. {'\n'} 첫 댓글의 주인공이 돼보세요!
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={{flex: 1}}>
      <CommunityHeader title={'게시글'} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={48}
        style={{flex: 1, backgroundColor: 'white'}}>
        <FlatList
          data={comments}
          ListHeaderComponent={renderPostContent}
          ListEmptyComponent={renderEmptyComment}
          renderItem={({item}) => (
            <CommentCard
              item={item}
              onDelete={() => handleCommentDelete(item.id)}
              onEdit={() => handleCommentEdit(item.id)}
            />
          )}
          keyExtractor={(item, index) => item.id || index.toString()}
          onEndReached={fetchMoreComments}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          style={styles.container}
        />
        <View style={styles.commentInputContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder={editingCommentId ? '댓글 수정' : '댓글 입력'}
            multiline={true}
            value={commentContent}
            onChangeText={handleCommentContentChange}
          />
          <TouchableOpacity
            style={styles.commentSubmitButton}
            onPress={handleCommentSubmit}>
            <Image
              style={[styles.commentSubmitIcon, styles.frameItemLayout]}
              resizeMode="cover"
              source={planeMessageIcon}
            />
          </TouchableOpacity>
          <BottomSheetModal isVisible={isModalVisible} onClose={toggleModal}>
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  handleEdit();
                  toggleModal();
                }}>
                <Image source={pencilIcon} style={{width: 24, height: 24}} />
                <Text style={styles.modalButtonText}>게시글 수정</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  handleDelete();
                  toggleModal();
                }}>
                <Image source={deleteIcon} style={{width: 24, height: 24}} />
                <Text style={styles.modalButtonText}>게시글 삭제</Text>
              </TouchableOpacity>
            </View>
          </BottomSheetModal>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const moreIcon = require('../../assets/icons/moreIcon.png');
const commentLineIcon = require('../../assets/icons/commentLineIcon.png');
const commentFillIcon = require('../../assets/icons/commentFillIcon.png');
const writeCommentIcon = require('../../assets/icons/WriteCommentIcon.png');
const heartLineIcon = require('../../assets/icons/heartLineIcon.png');
const heartRedIcon = require('../../assets/icons/heartRedIcon.png');
const shareIcon = require('../../assets/icons/shareIcon.png');
const pencilIcon = require('../../assets/icons/pencilIcon.png');
const deleteIcon = require('../../assets/icons/deleteIcon.png');
const defaultPostImg = require('../../assets/images/defaultPostImg.jpg');
const planeMessageIcon = require('../../assets/icons/planeMessageIcon.png');
const defaultProfileImg = require('../../assets/images/defaultProfileImg.jpeg');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFFFE',
  },
  postContainer: {
    paddingTop: 20,
  },
  postInContainer: {
    paddingHorizontal: 16,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  userInfoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userProfileImage: {
    width: 48,
    height: 48,
    borderRadius: 100,
    marginRight: 12,
  },
  userInfoTextContainer: {
    flexDirection: 'column',
  },
  userNameText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    fontWeight: '500',
    color: '#212529',
    fontFamily: 'Pretendard',
  },
  postTimeText: {
    fontSize: 12,
    color: '#9a9a9a',
    fontFamily: 'Pretendard',
  },
  postContentText: {
    fontSize: 16,
    marginBottom: 24,
    fontWeight: '500',
    fontFamily: 'Pretendard',
    color: '#898989',
  },

  postImageWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
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
  separatorTop: {
    height: 1,
    backgroundColor: '#D9D9D9',
    width: '100%',
    marginBottom: 8,
  },
  separatorBottom: {
    height: 1,
    backgroundColor: '#D9D9D9',
    width: '100%',
    marginTop: 8,
  },
  interactionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftInteractionContainer: {
    flexDirection: 'row',
  },
  rightInteractionContainer: {
    flexDirection: 'row',
  },
  interactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  interactionText: {
    marginLeft: 8,
    fontSize: 12,
    fontFamily: 'Pretendard',
    color: '#212529',
  },
  activeInteractionButton: {},
  activeInteractionText: {
    color: '#E4694E',
  },
  interactionRightButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentInputContainer: {
    paddingHorizontal: 18,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEFFFE',
    gap: 12,
    paddingVertical: 10,
  },
  commentInput: {
    flex: 1,
    minHeight: 32,
    maxHeight: 60,
    backgroundColor: '#dbdbdb',
    borderRadius: 16,
    paddingHorizontal: 20,
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Pretendard',
    paddingVertical: 4,
  },
  commentSubmitButton: {},
  commentSubmitIcon: {
    height: 32,
    width: 32,
  },
  moreIconContainer: {
    justifyContent: 'center',
  },
  moreIcon: {
    width: 24,
    height: 24,
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
  emptyCommentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 56,
  },
  emptyCommentIcon: {
    width: 48,
    height: 48,
    marginBottom: 12,
  },
  emptyCommentText: {
    fontSize: 16,
    color: '#07AC7D',
    fontFamily: 'Pretendard',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default CommunityPostDetail;