import React, {useEffect, useState} from 'react';
import {
  View,
  ScrollView,
  Text,
  Image,
  TextInput,
  Dimensions,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';

import firestore from '@react-native-firebase/firestore';

import {useFocusEffect} from '@react-navigation/native';

import PostCard from '../../components/Community/PostCard';
import auth from '@react-native-firebase/auth';

const {width, height} = Dimensions.get('window');

const CommunityBoard = ({navigation}) => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleted, setDeleted] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      setCurrentUser(user);
    });

    return unsubscribe;
  }, []);

  const fetchPost = async () => {
    try {
      const list = [];

      const querySnapshot = await firestore()
        .collection('posts')
        .where('post_actflag', '==', true)
        .orderBy('post_created', 'desc')
        .get();

      querySnapshot.forEach(doc => {
        const {
          userId,
          post_content,
          post_files,
          post_created,
          post_actflag,
          likeCount,
        } = doc.data();
        list.push({
          id: doc.id,
          userId,
          post_content,
          post_files,
          post_created,
          post_actflag,
          likeCount,
        });
      });

      setPost(list);

      if (loading) {
        setLoading(false);
      }

    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    fetchPost();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchPost();
    }, []),
  );

  /*
  useEffect(() => {
    fetchPost();
    setDeleted(false);
  }, [deleted]);
  */

  const handleDelete = postId => {
    if (post) {
      const selectedPost = post.find(item => item.id === postId);

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
              onPress: () => deletePost(postId),
            },
          ],
          {cancelable: false},
        );
      } else {
        Alert.alert('권한 없음', '게시글 작성자만 삭제할 수 있습니다.');
      }
    }
  };

  const deletePost = postId => {
    firestore()
      .collection('posts')
      .doc(postId)
      .update({
        post_actflag: false,
      })
      .then(() => {
        Alert.alert('게시글 삭제', '게시글이 성공적으로 삭제되었습니다!');
        fetchPost();
      })
      .catch(e => {
        console.log('게시물을 삭제하는 중에 오류가 발생', e);
      });
  };

  const handleEdit = postId => {
    if (post) {
      const selectedPost = post.find(item => item.id === postId);

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
              onPress: () => editPost(postId),
            },
          ],
          {cancelable: false},
        );
      } else {
        Alert.alert('권한 없음', '게시글 작성자만 수정할 수 있습니다.');
      }
    }
  };

  const editPost = postId => {
    navigation.navigate('CommunityEditPost', {postId});
  };

  const handleProfilePress = userId => {
    navigation.navigate('Profile', {userId});
  };


  const handlePostDetail = (postId) => {
    navigation.navigate('CommunityPostDetail', { postId });
  };

  const ListHeader = () => {
    return null;
  };
  return (
    <SafeAreaView style={{flex: 1}}>
      {loading ? (
        <ScrollView
          style={{flex: 1}}
          contentContainerStyle={{alignItems: 'center'}}>
        </ScrollView>
      ) : (
        <View style={{flex: 1, backgroundColor: '#FEFFFE'}}>
          <View style={styles.topView}>
            <View style={styles.searchAndWriteContainer}>
              <View style={styles.searchGroup}>
                <View />
                <Image source={searchIcon} style={{width: 24, height: 24}} />
                <TextInput
                  placeholder="검색"
                  placeholderTextColor="#898989"
                  style={{flex: 1, fontSize: 12, fontFamily: 'Pretendard'}}
                />
              </View>

              <TouchableOpacity
                style={styles.postWriteButton}
                onPress={() => navigation.navigate('CommunityAddPost')}>
                <Image
                  style={styles.pencilIcon}
                  resizeMode="cover"
                  source={pencilIcon}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.Container}>
            <FlatList
              data={post}
              renderItem={({item}) => (
                <PostCard
                  item={item}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  onComment={() => handlePostDetail(item.id)}
                  onProfile={handleProfilePress}
                  onDetail={() => handlePostDetail(item.id)}
                />
              )}
              keyExtractor={item => item.id}
              ListHeaderComponent={() => (
                <View style={styles.realtimeTextContainer}>
                  <Text style={styles.realtimeText}>실시간</Text>
                </View>
              )}
              ListFooterComponent={ListHeader}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default CommunityBoard;

const searchIcon = require('../../assets/icons/searchIcon.png');
const pencilIcon = require('../../assets/icons/pencilIcon.png');

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FEFFFE',
    padding: 20,
  },
  topView: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    position: 'absolute',
    zIndex: 2,
  },
  searchAndWriteContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
  },
  searchGroup: {
    width: width * 0.75,
    height: 40,
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    borderRadius: 10,
    backgroundColor: '#FEFFFE',
    shadowColor: '#212529',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 10,
    elevation: 10,
    shadowOpacity: 1,
  },
  pencilIcon: {
    width: 24,
    height: 24,
  },
  postWriteButton: {
    width: width * 0.1,
    paddingHorizontal: 8,
    height: 40,
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    borderRadius: 10,
    backgroundColor: '#FEFFFE',
    shadowColor: '#212529',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 10,
    elevation: 10,
    shadowOpacity: 1,
  },
  realtimeTextContainer: {
    marginTop: 56,
    marginBottom: 16,
    marginLeft: 4,
  },
  realtimeText: {
    color: '#07AC7D',
    fontSize: 24,
    letterSpacing: 0,
    fontWeight: '600',
  },
});
