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
  ActivityIndicator,
  Alert,
} from 'react-native';

import firestore from '@react-native-firebase/firestore';

import {useFocusEffect} from '@react-navigation/native';

import PostCard from '../../components/Community/PostCard';
import auth from '@react-native-firebase/auth';
import {Modal} from 'react-native-modal';

import {useNavigation} from '@react-navigation/native';
import CommunityHeader from '../../components/Community/CommunityHeader';
import CommunityActionToast from '../../components/Community/CommunityActionToast';
import CommunityActionModal from '../../components/Community/CommunityActionModal';

const {width, height} = Dimensions.get('window');

const CommunityBoard = ({navigation, route}) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [oldestVisible, setOldestVisible] = useState(null);
  const [newestVisible, setNewestVisible] = useState(null);
  const [refreshingOlder, setRefreshingOlder] = useState(false);
  const [refreshingNewer, setRefreshingNewer] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null);

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

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      setCurrentUser(user);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    fetchInitialPosts();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchInitialPosts();
    }, []),
  );

  useEffect(() => {
    if (route.params?.sendToastMessage) {
      setToastMessage({
        message: route.params.sendToastMessage,
        leftIcon: 'successIcon',
        closeButton: true,
        progressBar: true,
      });
      setToastVisible(true);
    }
  }, [route.params]);

  const fetchInitialPosts = async () => {
    setLoading(true);

    try {
      const querySnapshot = await firestore()
        .collection('posts')
        .where('post_actflag', '==', true)
        .orderBy('post_created', 'desc')
        .limit(10)
        .get();

      const initialPosts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPosts(initialPosts);
      setOldestVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setNewestVisible(querySnapshot.docs[0]);
      setLoading(false);
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  };

  const fetchOlderPosts = async () => {
    if (oldestVisible) {
      setRefreshingOlder(true);

      try {
        const querySnapshot = await firestore()
          .collection('posts')
          .where('post_actflag', '==', true)
          .orderBy('post_created', 'desc')
          .startAfter(oldestVisible)
          .limit(10)
          .get();

        const olderPosts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setPosts([...posts, ...olderPosts]);
        setOldestVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
        setRefreshingOlder(false);
      } catch (e) {
        console.log(e);
        setRefreshingOlder(false);
      }
    }
  };

  const fetchNewerPosts = async () => {
    if (newestVisible) {
      setRefreshingNewer(true);

      try {
        const querySnapshot = await firestore()
          .collection('posts')
          .where('post_actflag', '==', true)
          .orderBy('post_created', 'desc')
          .endBefore(newestVisible)
          .limit(10)
          .get();

        const newerPosts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setPosts([...newerPosts, ...posts]);
        setNewestVisible(querySnapshot.docs[0]);
        setRefreshingNewer(false);
      } catch (e) {
        console.log(e);
        setRefreshingNewer(false);
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
        setSelectedPostId(postId);
        setModalMessage({
          title: '게시글 삭제',
          modalText: '해당 게시글을 삭제하겠습니까?',
          iconSource: require('../../assets/icons/warningIcon.png'),
          showConfirmButton: false,
          onConfirm: () => {
            deletePost();
            setModalVisible(false);
          },
          onCancel: () => {
            setSelectedPostId(null);
            setModalVisible(false);
          },
        });
        setModalVisible(true);
      } else {
        setModalMessage({
          title: '권한 없음',
          modalText: '게시글 작성자만 수정/삭제할 수 있습니다.',
          iconSource: require('../../assets/icons/warningIcon.png'),
          showConfirmButton: true,
          onConfirm: () => {
            setModalVisible(false);
          },
        });
        setModalVisible(true);
      }
    }
  };

  const deletePost = () => {
    const postId = selectedPostId;
    firestore()
      .collection('posts')
      .doc(postId)
      .update({
        post_actflag: false,
      })
      .then(() => {
        setToastMessage({
          message: '게시글이 성공적으로 삭제되었습니다!',
          leftIcon: 'successIcon',
          closeButton: true,
          progressBar: true,
        });
        setToastVisible(true);
        setPosts(posts.filter(post => post.id !== postId));
        setSelectedPostId(null);
      })
      .catch(e => {
        console.log('게시물을 삭제하는 중에 오류가 발생', e);
      });
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
          iconSource: require('../../assets/icons/warningIcon.png'),
          showConfirmButton: true,
        });
        setModalVisible(true);
      }
    }
  };

  const editPost = postId => {
    navigation.navigate('CommunityEditPost', {postId});
  };

  const handleProfilePress = userId => {
    navigation.navigate('Profile', {userId});
  };

  const handlePostDetail = postId => {
    navigation.navigate('CommunityPostDetail', {postId});
  };

  const ListHeader = () => {
    return null;
  };

  const renderFooter = () => {
    if (!refreshingOlder) return null;

    return (
      <ActivityIndicator
        size="large"
        color="#07AC7D"
        style={{marginVertical: 16, marginBottom: 32}}
      />
    );
  };

  const renderHeader = () => {
    return (
      <View>
        {refreshingNewer ? (
          <ActivityIndicator
            size="large"
            color="#07AC7D"
            style={{marginVertical: 16}}
          />
        ) : (
          <View style={styles.realtimeTextContainer}>
            <Text style={styles.realtimeText}>게시글</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#FEFFFE'}}>
      <View style={{flex: 1}}>
        <CommunityHeader
          showBackButton={false}
          rightIcon={pencilIcon}
          title={'실시간 게시판'}
          onPressRightIcon={() => navigation.navigate('CommunityAddPost')}
        />
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
              ListFooterComponent={renderFooter}
              onEndReached={fetchOlderPosts}
              onEndReachedThreshold={0.5}
              refreshing={refreshingNewer}
              onRefresh={fetchNewerPosts}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
      <CommunityActionToast
        visible={toastVisible}
        message={toastMessage.message}
        duration={7000}
        onClose={() => setToastVisible(false)}
        leftIcon={toastMessage.leftIcon}
        closeButton={toastMessage.closeButton}
        progressBar={toastMessage.progressBar}
      />
      <CommunityActionModal
        isVisible={modalVisible}
        onConfirm={modalMessage.onConfirm}
        onCancel={modalMessage.onCancel}
        title={modalMessage.title}
        modalText={modalMessage.modalText}
        iconSource={modalMessage.iconSource}
        showConfirmButton={modalMessage.showConfirmButton}
      />
    </SafeAreaView>
  );
};

export default CommunityBoard;

const searchIcon = require('../../assets/icons/searchIcon.png');
const pencilIcon = require('../../assets/icons/pencilIcon.png');

const styles = StyleSheet.create({
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
    marginTop: 8,
    marginBottom: 16,
    marginLeft: 4,
  },
  realtimeText: {
    color: '#07AC7D',
    fontSize: 24,
    fontFamily: 'Pretendard',
    letterSpacing: 0,
    fontWeight: '600',
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
