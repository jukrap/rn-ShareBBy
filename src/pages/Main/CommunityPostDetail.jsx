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
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import PostDetailHeader from '../../components/Community/PostDetailHeader';
import CommentCard from '../../components/Community/CommentCard';
import {formatDistanceToNow} from 'date-fns';
import {ko} from 'date-fns/locale';
import Modal from 'react-native-modal';
import { useNavigation } from '@react-navigation/native';
import {SwiperFlatList} from 'react-native-swiper-flatlist';
import BottomSheetModal from '../../components/Community/BottomSheetModal';

const {width, height} = Dimensions.get('window');

const CommunityPostDetail = ({route}) => {
  const navigation = useNavigation();
  const [post, setPost] = useState(null);
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

  const maxCommentContentLength = 200;

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const {postId} = route.params;
    setPostId(postId);
    fetchPost(postId);
  }, [route.params]);

  useEffect(() => {
    if (postId) {
      fetchComments();
      fetchCommentCount();
    }
  }, [postId]);

  const fetchPost = async postId => {
    try {
      const documentSnapshot = await firestore()
        .collection('posts')
        .doc(postId)
        .get();

      if (documentSnapshot.exists) {
        const postData = documentSnapshot.data();
        setPost(postData);
        fetchPostUserData(postData.userId);
        setLikeCount(postData.likeCount || 0);
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
        .get();

      const commentData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setComments(commentData);
    } catch (error) {
      console.log('댓글을 가져오는 중에 오류가 발생했습니다:', error);
    }
  };

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

  const fetchCommentCount = async () => {
    try {
      const querySnapshot = await firestore()
        .collection('comments')
        .where('comment_actflag', '==', true)
        .where('postId', '==', postId)
        .get();

      const count = querySnapshot.size;
      setCommentCount(count);
    } catch (error) {
      console.log('댓글 수를 가져오는 중에 오류가 발생했습니다:', error);
    }
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
    if (commentContent && commentContent.trim() !== '') {
      submitComment();
    } else {
      Alert.alert('댓글 내용을 입력해주세요.');
    }
  }, [commentContent, submitComment]);

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
      fetchComments();
      fetchCommentCount();
    } catch (error) {
      console.log(
        'Firestore에 댓글을 추가하는 중에 문제가 발생했습니다.',
        error,
      );
    }
  };

  const handleDelete = () => {
    const selectedPost = post;
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
    const selectedPost = post;
    if (
      selectedPost &&
      currentUser &&
      currentUser.uid === selectedPost.userId
    ) {
      Alert.alert(
        '게시글 수정',
        '해당 게시글을 수정하겠습니까?',
        [
          {
            text: '아니오',
            onPress: () => console.log('아니오를 클릭'),
            style: 'cancel',
          },
          {
            text: '네',
            onPress: () => editPost(),
          },
        ],
        {cancelable: false},
      );
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

  const deleteComment = commentId => {
    firestore()
      .collection('comments')
      .doc(commentId)
      .update({
        comment_actflag: false,
      })
      .then(() => {
        Alert.alert('댓글 삭제', '댓글이 성공적으로 삭제되었습니다!');
        fetchComments();
      })
      .catch(e => {
        console.log('댓글을 삭제하는 중에 오류가 발생', e);
      });
  };

  const handleCommentEdit = commentId => {
    if (comments) {
      const selectedComment = comments.find(item => item.id === commentId);
      if (
        selectedComment &&
        currentUser &&
        currentUser.uid === selectedComment.userId
      ) {
        Alert.alert(
          '댓글 수정',
          '해당 댓글을 수정하겠습니까?',
          [
            {
              text: '아니오',
              onPress: () => console.log('아니오를 클릭'),
              style: 'cancel',
            },
            {
              text: '네',
              onPress: () => editComment(commentId),
            },
          ],
          {cancelable: false},
        );
      } else {
        Alert.alert('권한 없음', '댓글 작성자만 수정할 수 있습니다.');
      }
    }
  };

  const editComment = commentId => {
    //CommunityPostDetail에 있는 TextInput commentInput 댓글 입력 부분을 이용해서 수정할 수 있게 해야 함
  };

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  if (!post || !postUserData) {
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
                  : require('../../assets/images/defaultProfileImg.jpeg')
              }
            />
            <View style={styles.userInfoTextContainer}>
              <Text style={styles.userNameText}>{postUserData.nickname}</Text>
              <Text style={styles.postTimeText}>
                {formatDistanceToNow(post.post_created.toDate(), {
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
        <Text style={styles.postContentText}>{post.post_content}</Text>
        {post?.post_files?.length > 0 ? (
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
              data={post.post_files}
              style={styles.postSwiperFlatList}
              renderItem={({item}) => (
                <Image
                  style={styles.postImage}
                  source={{uri: item}}
                  resizeMode="cover"
                  defaultSource={defaultPostImg}
                />
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
            <TouchableOpacity
              style={styles.interactionButton}
              onPress={() => {}}>
              <Image source={commentLineIcon} style={{width: 24, height: 24}} />
              <Text style={styles.interactionText}>{commentCount}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.rightInteractionContainer}>
            <TouchableOpacity style={styles.interactionRightButton}>
              <Image source={shareIcon} style={{width: 24, height: 24}} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={styles.separatorBottom} />
    </View>
  );

  return (
    <SafeAreaView style={{flex: 1}}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={48}
        style={{flex: 1, backgroundColor: 'white'}}>
        <FlatList
          data={[{key: 'postContent'}, ...comments]}
          renderItem={({item}) =>
            item.key === 'postContent' ? (
              renderPostContent()
            ) : (
              <CommentCard
                item={item}
                onDelete={() => handleCommentDelete(item.id)}
                onEdit={() => handleCommentEdit(item.id)}
              />
            )
          }
          keyExtractor={(item, index) =>
            item.key || item.id || index.toString()
          }
          style={styles.container}
        />
        <View style={styles.commentInputContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder="댓글 입력"
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
              source={require('../../assets/icons/planeMessageIcon.png')} //밑에 분리하기
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
const heartLineIcon = require('../../assets/icons/heartLineIcon.png');
const heartRedIcon = require('../../assets/icons/heartRedIcon.png');
const shareIcon = require('../../assets/icons/shareIcon.png');
const pencilIcon = require('../../assets/icons/pencilIcon.png');
const deleteIcon = require('../../assets/icons/deleteIcon.png');
const defaultPostImg = require('../../assets/images/defaultPostImg.jpg');

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

export default CommunityPostDetail;
