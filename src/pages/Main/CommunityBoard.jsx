import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';

import firestore from '@react-native-firebase/firestore';

import {useFocusEffect} from '@react-navigation/native';

import PostCard from '../../components/Community/PostCard';
import auth from '@react-native-firebase/auth';

import CommunityHeader from '../../components/Community/CommunityHeader';
import CommunityActionToast from '../../components/Community/CommunityActionToast';
import CommunityActionModal from '../../components/Community/CommunityActionModal';
import SortModal from '../../components/Community/SortModal';
import {WarningIcon, PencilIcon, SortIcon} from '../../assets/assets';
const {width, height} = Dimensions.get('window');

const CommunityBoard = ({navigation, route}) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [oldestVisible, setOldestVisible] = useState(null);
  const [newestVisible, setNewestVisible] = useState(null);
  const [refreshingOlder, setRefreshingOlder] = useState(false);
  const [refreshingNewer, setRefreshingNewer] = useState(false);
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

  const [selectedSortOption, setSelectedSortOption] = useState('최신순');
  const [isSortOptionsVisible, setIsSortOptionsVisible] = useState(false);
  const [viewMode, setViewMode] = useState('내 주변 보기');
  const [currentUserAddress, setCurrentUserAddress] = useState('');

  const sortOptions = ['최신순', '추천순', '댓글순'];

  useEffect(() => {
    const initialViewMode = '내 주변 보기';
    const initialUserAddress = '';
    const unsubscribe = auth().onAuthStateChanged(user => {
      setCurrentUser(user);
    });

    setViewMode(initialViewMode);
    setCurrentUserAddress(initialUserAddress);
  
    fetchInitialPosts(initialViewMode, initialUserAddress);
  
    return unsubscribe;
  }, []);
  
  useEffect(() => {
    if (currentUser) {
      fetchCurrentUserAddress();
    }
  }, [currentUser]);
  
  useEffect(() => {
    fetchInitialPosts(viewMode, currentUserAddress);
  }, [viewMode, currentUserAddress]);
  

  useFocusEffect(
    React.useCallback(() => {
      const newPost = route.params?.newPost;
      if (newPost) {
        setPosts((prevPosts) => [newPost, ...prevPosts]);
        navigation.setParams({ newPost: null });
      }
      
      const deletedPostId = route.params?.deletedPostId;
      if (deletedPostId) {
        setPosts((prevPosts) => prevPosts.filter((post) => post.id !== deletedPostId));
        navigation.setParams({ deletedPostId: null });
      }
      
      const updatedPost = route.params?.updatedPost;
      if (updatedPost) {
        setPosts(prevPosts =>
          prevPosts.map(post =>
            post.id === updatedPost.id ? { ...post, ...updatedPost } : post
          )
        );
        navigation.setParams({ updatedPost: null });
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

  const fetchCurrentUserAddress = async () => {
    if (currentUser) {
      try {
        const userDoc = await firestore()
          .collection('users')
          .doc(currentUser.uid)
          .get();

        if (userDoc.exists) {
          const userData = userDoc.data();
          if (userData.address) {
            setCurrentUserAddress(userData.address);
          } else {
            setCurrentUserAddress('');
          }
        } else {
          setCurrentUserAddress('');
        }
      } catch (error) {
        console.log('사용자 주소를 가져오는 중에 오류가 발생했습니다:', error);
        setCurrentUserAddress('');
      }
    }
  };

  const fetchInitialPosts = async (viewMode, currentUserAddress) => {
    setLoading(true);
  
    try {
      let query = firestore()
        .collection('posts')
        .where('post_actflag', '==', true);
  
      if (viewMode === '내 주변 보기' && currentUserAddress) {
        const userRegion = currentUserAddress.split(' ').slice(0, 2).join(' ');
        query = query.where('userRegion', '==', userRegion);
      }
  
      query = query.orderBy('post_created', 'desc').limit(10);
  
      const querySnapshot = await query.get();
  
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
        let query = firestore()
          .collection('posts')
          .where('post_actflag', '==', true);

        if (viewMode === '내 주변 보기' && currentUserAddress) {
          const userRegion = currentUserAddress
            .split(' ')
            .slice(0, 2)
            .join(' ');
          query = query.where('userRegion', '==', userRegion);
        }

        if (selectedSortOption === '최신순') {
          query = query.orderBy('post_created', 'desc');
        } else if (selectedSortOption === '추천순') {
          query = query.orderBy('likeCount', 'desc');
        } else if (selectedSortOption === '댓글순') {
          query = query.orderBy('commentCount', 'desc');
        }

        const querySnapshot = await query
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
        let query = firestore()
          .collection('posts')
          .where('post_actflag', '==', true);

        if (viewMode === '내 주변 보기' && currentUserAddress) {
          const userRegion = currentUserAddress
            .split(' ')
            .slice(0, 2)
            .join(' ');
          query = query.where('userRegion', '==', userRegion);
        }

        if (selectedSortOption === '최신순') {
          query = query.orderBy('post_created', 'desc');
        } else if (selectedSortOption === '추천순') {
          query = query.orderBy('likeCount', 'desc');
        } else if (selectedSortOption === '댓글순') {
          query = query.orderBy('commentCount', 'desc');
        }

        const querySnapshot = await query
          .endBefore(newestVisible)
          .limit(10)
          .get();

        const newerPosts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        const uniquePosts = [...newerPosts, ...posts].reduce((acc, post) => {
          if (!acc.find(p => p.id === post.id)) {
            acc.push(post);
          }
          return acc;
        }, []);

        setPosts(uniquePosts);
        setNewestVisible(newerPosts[0]);
        setRefreshingNewer(false);
        if (querySnapshot.size > 0) {
          setToastMessage({
            message: `${querySnapshot.size}개의 새로운 게시글을 불러왔습니다!`,
            leftIcon: 'successIcon',
            closeButton: true,
            progressBar: true,
          });
          setToastVisible(true);
        } else {
          setToastMessage({
            message: '새로운 게시글이 없습니다.',
            leftIcon: 'otherIcon',
            closeButton: true,
            progressBar: true,
          });
          setToastVisible(true);
        }
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

  const deletePost = postId => {
    firestore()
      .collection('posts')
      .doc(postId)
      .get()
      .then(doc => {
        if (doc.exists) {
          // 문서가 존재하는 경우에만 삭제 작업 수행
          doc.ref
            .update({
              post_actflag: false,
            })
            .then(() => {
              // 삭제 성공 처리
              setToastMessage({
                message: '게시글이 성공적으로 삭제되었습니다!',
                leftIcon: 'successIcon',
                closeButton: true,
                progressBar: true,
              });
              setToastVisible(true);
              setPosts(posts.filter(post => post.id !== postId));
            })
            .catch(e => {
              console.log('게시물을 삭제하는 중에 오류가 발생', e);
            });
        } else {
          console.log('삭제하려는 게시물이 존재하지 않습니다.');
        }
      })
      .catch(e => {
        console.log('게시물 존재 여부를 확인하는 중에 오류가 발생', e);
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

  const handleSortOptionChange = async option => {
    setSelectedSortOption(option);
    fetchPostsBySelectedOption(option);
    setIsSortOptionsVisible(false);
  };

  const fetchPostsBySelectedOption = async option => {
    setLoading(true);

    try {
      let query = firestore()
        .collection('posts')
        .where('post_actflag', '==', true);

      if (viewMode === '내 주변 보기') {
        const userRegion = currentUserAddress.split(' ').slice(0, 2).join(' ');
        query = query.where('userRegion', '==', userRegion);
      }

      if (option === '최신순') {
        query = query.orderBy('post_created', 'desc');
      } else if (option === '추천순') {
        query = query.orderBy('likeCount', 'desc');
      } else if (option === '댓글순') {
        query = query.orderBy('commentCount', 'desc');
      }

      const querySnapshot = await query.limit(10).get();

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

  const renderHeader = () => {
    return (
      <View style={styles.headerContainer}>
        {refreshingNewer ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#07AC7D" style={{ marginVertical: 16 }} />
        </View>
        ) : (
          <>
            {currentUserAddress ? (
              <TouchableOpacity
                style={styles.viewModeButton}
                onPress={() =>
                  setViewMode((prevMode) =>
                    prevMode === '전체 보기' ? '내 주변 보기' : '전체 보기'
                  )
                }
              >
                <Text style={styles.viewModeButtonText}>{viewMode}</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.viewModeButton}>
                <Text style={[styles.viewModeButtonText, {color: '#aaa'}]}>
                  주소 정보 없음
                </Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.sortButton}
              onPress={() => setIsSortOptionsVisible(true)}
            >
              <Text style={styles.sortButtonText}>{selectedSortOption}</Text>
              <Image source={SortIcon} style={styles.sortIcon} />
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  };
  
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#FEFFFE'}}>
      <View style={{flex: 1}}>
        <CommunityHeader
          showBackButton={false}
          rightIcon={PencilIcon}
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
      <SortModal
        isVisible={isSortOptionsVisible}
        onClose={() => setIsSortOptionsVisible(false)}
        selectedOption={selectedSortOption}
        options={sortOptions}
        onSelect={handleSortOptionChange}
      />
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
  sortControlContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  sortControlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 4,
  },
  sortControlButtonText: {
    fontSize: 16,
    fontFamily: 'Pretendard',
  },
  sortControlButtonIcon: {
    width: 24,
    height: 24,
    marginLeft: 8,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FEFFFE',
    borderRadius: 4,
    padding: 16,
    marginHorizontal: 32,
  },
  modalOption: {
    paddingVertical: 8,
  },
  modalOptionText: {
    fontSize: 16,
    fontFamily: 'Pretendard',
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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  sortButtonText: {
    fontSize: 16,
    fontFamily: 'Pretendard',
    marginRight: 8,
    marginBottom: 4,
    color: '#07AC7D',
  },
  sortIcon: {
    width: 24,
    height: 24,
  },
  viewModeButton: {
    paddingVertical: 8,
  },
  viewModeButtonText: {
    fontSize: 16,
    fontFamily: 'Pretendard',
    marginRight: 8,
    marginBottom: 4,
    color: '#07AC7D',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    width: '100%',
  },
  modalOptionText: {
    fontSize: 16,
  },
  checkIcon: {
    width: 20,
    height: 20,
  },
});
