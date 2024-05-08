import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import PostDetailHeader from '../../components/Community/PostDetailHeader';

const CommunityPostDetail = ({route}) => {
  const {postId} = route.params;
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([
    {id: '1', author: 'User1', content: 'This is a sample comment.'},
    {id: '2', author: 'User2', content: 'Great post!'},
  ]);
  const [commentText, setCommentText] = useState('');

  const handleCommentSubmit = () => {
    // 댓글 제출 로직을 구현
    setCommentText(''); // 댓글 제출 후 입력칸 비우기
  };

  //헤더는 나중에 넣기
  return (
    <SafeAreaView style={{flex: 1}}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={48}
        style={{width: '100%', height: '100%', backgroundColor: 'white'}}>
        <View style={styles.container}>
          {/* 여기에 다른 컨텐츠를 렌더링 */}
          <View style={{flex: 1}} />
          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="댓글 입력"
              multiline={true}
              value={commentText}
              onChangeText={setCommentText}
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
    marginVertical: 10,
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
