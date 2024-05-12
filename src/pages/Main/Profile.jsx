import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
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
import {useFocusEffect} from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import userStore from '../../lib/userStore' 

const heart = require('../../assets/newIcons/heart-icon.png');
const pencil = require('../../assets/newIcons/pencil-icon.png');
const marker = require('../../assets/newIcons/marker-icon.png');

const {width, height} = Dimensions.get('window');
const rightArrow = require('../../assets/icons/right-arrow.png');

const Profile = () => {
  const [users, setUsers] = useState(null);
  const [userUid, setUserUid] = useState('');
  const usersCollection = firestore().collection('users');
  const userData = userStore(state => state.userData); 
  
  const navigation = useNavigation();

  const fetchUserUid = async () => {
    try {
      const user = auth().currentUser;
      if (user) {
        // set uuid
        const userUID = user.uid;
        setUserUid(userUID);
      }
    } catch (error) {
      console.error('Error fetching current user: ', error);
    }
    // console.log('call user uid', userUid);
  };
  const fetchUserData = async () => {
    try {
      const querySnapshot = (await usersCollection.doc(userUid).get()).data();
      // console.log(querySnapshot);
      setUsers(querySnapshot); // 사용자 데이터 상태 설정
    } catch (error) {
      console.log(error.message);
    }
  };
  useFocusEffect(
    useCallback(() => {
      fetchUserUid();
    }, [setUserUid]), // setUserUid를 의존성 배열에 포함
  );
   useEffect(() => {
    if (userData) {
      // userStore에서 사용자 데이터가 이미 존재하는 경우 해당 데이터를 사용하여 UI를 렌더링합니다.
      setUsers(userData);
    } else {
      // userStore에 사용자 데이터가 없는 경우 fetchUserUid를 호출하여 데이터를 가져옵니다.
      fetchUserData();
    }
  }, [userData]);

  const handleLogout = async () => {
    try {
      // Firebase에서 로그아웃
      await auth().signOut();
  
      // AsyncStorage에서 사용자 정보 제거
      await AsyncStorage.removeItem('userInfo');
  
      // Zustand 스토어에서 사용자 토큰 및 정보 초기화
      userStore.getState().setUserData(null);
  
      // 로그인 화면으로 이동
      navigation.replace('Login');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  return (
    <SafeAreaView style={styles.safeAreaViewStyle}>
      {users ? (
        <ScrollView>
          <Text style={styles.title}>마이페이지</Text>
          <View style={styles.profileHeader}>
            {/* onPress 추가 */}
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
                <Text style={styles.nameStyle}>{userData ? (userData.nickname) : '데이터 없음'}</Text>
                <Image source={rightArrow} style={styles.arrow} />
              </TouchableOpacity>
              <Text style={styles.emailStyle}>{userData ? JSON.stringify(userData.email) : '데이터 없음'}</Text>
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
              <Image source={pencil} style={styles.icon} />
              <Text style={styles.listStyle}>내가 쓴 글</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('MyLikes', {
                  uuid: userUid,
                })
              }
              style={styles.myList}>
              <Image source={heart} style={styles.icon} />
              <Text style={styles.listStyle}>찜한 글</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.myList}>
              <Image source={marker} style={styles.icon} />
              <Text
                // onPress={() => navigation.navigate('Home')}
                style={styles.listStyle}>
                참여한 취미 목록
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.additionalInfo}>
            <Text style={styles.info}>기타</Text>
            <TouchableOpacity
              // onPress={() => navigation.navigate('Home')}
              style={styles.noticeWrapper}>
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
              onPress={handleLogout}
              style={styles.noticeWrapper}>
              <Text style={styles.noticeStyle}>로그아웃</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <ScrollView>
          <Text style={styles.title}>마이페이지</Text>

          <Text>not users</Text>
        </ScrollView>
      )}
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
    // paddingBottom: 15,
    justifyContent: 'flex-start',
    // alignItems: 'center',
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
  },
  nameStyle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    paddingBottom: 10,
  },
  arrow: {
    width: 20,
    height: 20,
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
  profileWrapper: {
    backgroundColor: '#fff',

    // marginTop: -80,

    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
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
    // textAlign: 'center',
    // justifyContent: 'center',
    margin: 10,
    fontWeight: 'bold',
  },
  infoStyle: {
    fontSize: 16,
    // flexDirection: 'row',
    // textAlign: 'center',
    // justifyContent: 'center',
    marginTop: 10,
    marginLeft: 30,
    marginRight: 30,
    fontSize: 16,
    fontWeight: 'bold',
  },
  myList: {
    margin: 5,
    flexDirection: 'row',
    textAlign: 'center',
    alignItems: 'center',
    // justifyContent: 'center',
  },
  noticeStyle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#3f3f3f',
    alignItems: 'center',
    marginLeft: 5,
  },
  noticeWrapper: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
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
});
export default Profile;
