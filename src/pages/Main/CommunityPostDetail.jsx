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

  //헤더는 나중에 넣기
  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={styles.container}>
        <View style={styles.commentInputContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder="댓글 입력"
            multiline={true}
          />
          <TouchableOpacity style={styles.commentSubmitButton}>
            <Image
              style={[styles.commentSubmitIcon, styles.frameItemLayout]}
              resizeMode="cover"
              source={require('../../assets/icons/planeMessageIcon.png')}
            />
          </TouchableOpacity>
        </View>
      </View>
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
