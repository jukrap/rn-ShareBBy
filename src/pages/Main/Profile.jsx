import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useStore from '../../lib/userStore';
import {useFocusEffect} from '@react-navigation/native';
import LoginModal from '../../components/SignUp/LoginModal';
import {HeartIcon, PencilIcon, MarkerIcon} from '../../assets/assets';

const {width, height} = Dimensions.get('window');
const rightArrow = require('../../assets/newIcons/rightIcon.png');

const Profile = ({navigation, route}) => {
  const [users, setUsers] = useState(null);
  const [userUid, setUserUid] = useState(null);
  const [showLogoutModal, setLogoutShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const usersCollection = firestore().collection('users');
  const userToken = useStore(state => state.userToken);

  const fetchUserUid = async () => {
    try {
      const user = auth().currentUser;
      if (user) {
        const userUID = user.uid;
        setUserUid(userUID);
      } else {
        // 유저가 없을 경우 로그인 페이지로 이동
        navigation.reset({
          index: 0,
          routes: [{name: 'Login'}],
        });
      }
    } catch (error) {
      console.error('Error fetching current user: ', error);
      // 오류가 발생한 경우 로그인 페이지로 이동
      navigation.reset({
        index: 0,
        routes: [{name: 'Login'}],
      });
    }
  };

  const fetchUserData = async () => {
    try {
      const querySnapshot = (await usersCollection.doc(userUid).get()).data();
      if (querySnapshot) {
        setUsers(querySnapshot);
      } else {
        // 사용자 데이터가 없을 경우 로그인 페이지로 이동
        navigation.reset({
          index: 0,
          routes: [{name: 'Login'}],
        });
      }
    } catch (error) {
      console.log(error.message);
      // 오류가 발생한 경우 로그인 페이지로 이동
      navigation.reset({
        index: 0,
        routes: [{name: 'Login'}],
      });
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserUid();
    }, []),
  );

  useEffect(() => {
    if (userUid) {
      fetchUserData();
    }
  }, [userUid]);

  const handleLogout = async () => {
    try {
      await auth().signOut();
      await AsyncStorage.removeItem('userInfo');
      setLogoutShowModal(false);
      navigation.reset({
        index: 0,
        routes: [{name: 'Login'}],
      });
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  const handleLogoutModalClose = () => {
    setLogoutShowModal(false);
  };

  const handleLogoutShowModal = () => {
    setLogoutShowModal(true);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loader}>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeAreaViewStyle}>
      <ScrollView>
        <Text style={styles.title}>마이페이지</Text>
        <View style={styles.profileHeader}>
          <Image
            source={{uri: users.profileImage}}
            style={styles.profileImageStyle}
          />
          <View style={styles.profileName}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('EditProfile', {
                  address: users.address,
                  nickname: users.nickname,
                  profileImage: users.profileImage,
                  uuid: userUid,
                })
              }
              style={styles.name}>
              <Text style={styles.nameStyle}>{users.nickname}</Text>
              <Image source={rightArrow} style={styles.arrow} />
            </TouchableOpacity>
            <Text style={styles.emailStyle}>{users.email}</Text>
          </View>
        </View>
        <View style={styles.infoStyle}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('MyPosts', {
                uuid: userUid,
                nickname: users.nickname,
                profileImage: users.profileImage,
              })
            }
            style={styles.myList}>
            <Image source={PencilIcon} style={styles.icon} />
            <Text style={styles.listStyle}>내가 쓴 글</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('MyLikes', {
                uuid: userUid,
              })
            }
            style={styles.myList}>
            <Image source={HeartIcon} style={styles.icon} />
            <Text style={styles.listStyle}>찜한 글</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('MyRecruits', {
                uuid: userUid,
              })
            }
            style={styles.myList}>
            <Image source={MarkerIcon} style={styles.icon} />
            <Text style={styles.listStyle}>내 모집 공고</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.additionalInfo}>
          <Text style={styles.info}>기타</Text>
          <TouchableOpacity style={styles.noticeWrapper}>
            <Text style={styles.noticeStyle}>공지사항</Text>
            <Image style={styles.arrow} source={rightArrow} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('SynthesisAgree')}
            style={styles.noticeWrapper}>
            <Text style={styles.noticeStyle}>약관 및 개인정보 처리 방침</Text>
            <Image style={styles.arrow} source={rightArrow} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleLogoutShowModal}
            style={styles.noticeWrapper}>
            <Text style={styles.noticeStyle}>로그아웃</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <LoginModal
        animationType="slide"
        visible={showLogoutModal}
        closeModal={handleLogoutModalClose}
        message="로그아웃"
        message2="로그아웃 하시겠어요?"
        LeftButton="취소"
        RightButton="로그아웃"
        onConfirm={handleLogout}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaViewStyle: {
    flex: 1,
    backgroundColor: '#fefefe',
  },
  title: {
    color: '#212529',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 30,
    marginTop: 10,
    marginBottom: 10,
  },
  profileHeader: {
    justifyContent: 'flex-start',
    paddingBottom: 10,
    flexDirection: 'row',
    marginTop: 20,
    marginLeft: 30,
  },
  profileName: {
    justifyContent: 'center',
  },
  name: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
  },
  nameStyle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
  },
  arrow: {
    width: 15,
    height: 15,
    marginLeft: 10,
    alignItems: 'center',
  },
  emailStyle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#A7A7A7',
  },
  profileImageStyle: {
    borderRadius: 70,
    width: 70,
    height: 70,
    marginRight: 22,
  },
  icon: {
    width: 16,
    height: 16,
    marginRight: 10,
  },
  listStyle: {
    fontSize: 16,
    color: '#212529',
    flexDirection: 'row',
    margin: 10,
    fontWeight: 'bold',
  },
  infoStyle: {
    fontSize: 16,
    marginTop: 10,
    marginLeft: 30,
    marginRight: 30,
    fontWeight: 'bold',
  },
  myList: {
    margin: 5,
    flexDirection: 'row',
    textAlign: 'center',
    alignItems: 'center',
  },
  noticeStyle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#3f3f3f',
    marginLeft: 5,
  },
  noticeWrapper: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  additionalInfo: {
    marginLeft: 30,
    marginRight: 30,
  },
  info: {
    color: '#3F3F3F',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 5,
    marginBottom: 15,
    marginTop: 25,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Profile;
