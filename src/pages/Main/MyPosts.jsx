import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  SafeAreaView,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import React, {useEffect, useState} from 'react';
import {BackIcon, WarningIcon} from '../../assets/assets';
import PostCard from '../../components/Community/PostCard';
import {useFocusEffect} from '@react-navigation/native';
const MyPosts = ({navigation, route}) => {
  const uuid = route.params.uuid;
  const postsCollection = firestore().collection('posts');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState({
    title: '',
    modalText: '',
    iconSource: null,
    showConfirmButton: false,
    onConfirm: null,
    onCancel: null,
  });
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState({
    message: '',
    leftIcon: '',
    closeButton: true,
    progressBar: true,
  });
  const fetchPostData = async () => {
    try {
      setLoading(true);

      const snapshot = await postsCollection.where('userId', '==', uuid).get();
      const tmp_posts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      tmp_posts.sort((a, b) => {
        const dateA = a.post_created;
        const dateB = b.post_created;
        return dateB - dateA; // 내림차순 정렬
      });
      setPosts(tmp_posts);
    } catch (error) {
      console.error('Error fetching posts:', error.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchPostData();
  }, []);
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      setCurrentUser(user);
    });

    return unsubscribe;
  }, []);
  const editPost = postId => {
    navigation.navigate('CommunityEditPost', {
      postId,
      prevScreen: 'MyPosts',
    });
  };
  useFocusEffect(
    React.useCallback(() => {
      const updatedPost = route.params?.updatedPost;
      if (updatedPost) {
        setPosts(prevPosts =>
          prevPosts.map(post =>
            post.id === updatedPost.id ? {...post, ...updatedPost} : post,
          ),
        );
        navigation.setParams({updatedPost: null});
      }

      if (route.params?.sendToastMessage) {
        setToastMessage({
          message: route.params.sendToastMessage,
          leftIcon: 'successIcon',
          closeButton: true,
          progressBar: true,
        });
        setToastVisible(true);
        navigation.setParams({sendToastMessage: null});
      }
    }, [route.params]),
  );
  const handlePostDetail = postId => {
    navigation.navigate('CommunityPostDetail', {postId});
  };
  const handleProfilePress = userId => {
    navigation.navigate('Profile', {userId});
  };
  const handleEdit = postId => {
    if (posts) {
      const selectedPost = posts.find(item => item.id === postId);

      if (
        selectedPost &&
        currentUser &&
        currentUser.uid === selectedPost.userId
      ) {
        editPost(postId);
      } else {
        setModalMessage({
          title: '권한 없음',
          modalText: '게시글 작성자만 수정/삭제할 수 있습니다.',
          iconSource: WarningIcon,
          showConfirmButton: true,
          onConfirm: () => {
            setModalVisible(false);
          },
        });
        setModalVisible(true);
      }
    }
  };
  const handleDelete = postId => {
    if (posts) {
      const selectedPost = posts.find(item => item.id === postId);

      if (
        selectedPost &&
        currentUser &&
        currentUser.uid === selectedPost.userId
      ) {
        setModalMessage({
          title: '게시글 삭제',
          modalText: '해당 게시글을 삭제하겠습니까?',
          iconSource: WarningIcon,
          showConfirmButton: false,
          onConfirm: () => {
            deletePost(postId);
            setModalVisible(false);
          },
          onCancel: () => {
            setModalVisible(false);
          },
        });
        setModalVisible(true);
      } else {
        setModalMessage({
          title: '권한 없음',
          modalText: '게시글 작성자만 수정/삭제할 수 있습니다.',
          iconSource: WarningIcon,
          showConfirmButton: true,
          onConfirm: () => {
            setModalVisible(false);
          },
        });
        setModalVisible(true);
      }
    }
  };
  const renderHeader = () => {
    return <></>;
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#FEFFFE'}}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image style={styles.arrow} source={BackIcon} />
        </TouchableOpacity>
        <Text style={styles.headtext}>내가 쓴 글</Text>
      </View>
      <View style={{flex: 1}}>
        <View style={styles.Container}>
          {loading ? (
            <View style={styles.loadingOverlay}>
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#07AC7D" />
              </View>
            </View>
          ) : (
            <FlatList
              data={posts}
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
              ListHeaderComponent={renderHeader}
              // ListFooterComponent={renderFooter}

              onEndReachedThreshold={0.5}
              // refreshing={refreshingNewer}
              // onRefresh={fetchNewerPosts}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    // marginTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#DBDBDB',
    height: 56,
    marginBottom: 20,
  },
  arrow: {width: 22, height: 22},
  headtext: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },

  Container: {
    alignItems: 'center',
    backgroundColor: '#FEFFFE',
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
});
export default MyPosts;
