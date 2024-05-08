import React, {useState, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  Alert,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
} from 'react-native';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import PostDetailHeader from '../../components/Community/PostDetailHeader';
import CommentCard from '../../components/Community/CommentCard';

const CommunityPostDetail = ({route}) => {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState('');
  const [commentContentLength, setCommentContentLength] = useState(0); // 댓글 내용 길이
  const [postId, setPostId] = useState(null); // 본 게시글의 ID
  const [currentUser, setCurrentUser] = useState(null);

  const maxCommentContentLength = 200; // 최대 댓글 내용 길이

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const {postId} = route.params;
    setPostId(postId);

    const fetchComments = async () => {
      try {
        const querySnapshot = await firestore()
          .collection('comments')
          .where('postId', '==', postId)
          .orderBy('comment_created', 'desc')
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
    fetchComments();
  }, [route.params]);

  // 댓글 제출 핸들러
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
      // Firestore에 댓글 추가
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
      fetchComments(); // 댓글 추가 후 댓글 목록 갱신
    } catch (error) {
      console.log(
        'Firestore에 댓글을 추가하는 중에 문제가 발생했습니다.',
        error,
      );
    }
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={48}
        style={{flex: 1, backgroundColor: 'white'}}>
        <View style={styles.container}>
          {/* 여기에 다른 컨텐츠를 렌더링 */}
          <FlatList
            data={comments}
            renderItem={({item}) => <CommentCard item={item} />}
            keyExtractor={item => item.id}
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
                source={require('../../assets/icons/planeMessageIcon.png')}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFFFE',
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
});

export default CommunityPostDetail;
