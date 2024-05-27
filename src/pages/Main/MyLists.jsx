import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import React, {useEffect, useState} from 'react';
import {BackIcon, WarningIcon} from '../../assets/assets';
import PostCard from '../../components/Community/PostCard';

const MyLists = ({navigation, route}) => {
  const uuid = route.params.uuid;
  const postsCollection = firestore().collection('posts');
  const likesCollection = firestore().collection('likes');
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState({
    title: '',
    modalText: '',
    iconSource: null,
    showConfirmButton: false,
    onConfirm: null,
    onCancel: null,
  });
  const fetchPosts = async () => {
    const likesSnapshot = await likesCollection
      .where('userId', '==', uuid)
      .get();
    const postsPromises = likesSnapshot.docs.map(doc => {
      return postsCollection.doc(doc.data().postId).get();
    });

    const postsSnapshots = await Promise.all(postsPromises);

    try {
      setLoading(true);
      const tmpPosts = postsSnapshots.map((doc, index) => ({
        id: doc.id,
        ...doc.data(),
      }));

      tmpPosts.sort((a, b) => {
        const dateA = a.post_created;
        const dateB = b.post_created;
        return dateB - dateA; // 내림차순 정렬
      });
      setPosts(tmpPosts);
    } catch (error) {
      console.error('Error fetching posts:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const editPost = postId => {
    navigation.navigate('CommunityEditPost', {postId});
  };
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
        <Text style={styles.headtext}>내가 찜한 글</Text>
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
              onEndReachedThreshold={0.5}
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

export default MyLists;
