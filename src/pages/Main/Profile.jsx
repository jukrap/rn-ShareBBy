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
// import ImagePicker from 'react-native-image-crop-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useStore from '../../lib/useStore';
import {useFocusEffect} from '@react-navigation/native';
const heart = require('../../assets/newIcons/heart-icon.png');
const pencil = require('../../assets/newIcons/pencil-icon.png');
const marker = require('../../assets/newIcons/marker-icon.png');

const {width, height} = Dimensions.get('window');
const rightArrow = require('../../assets/icons/right-arrow.png');

const Profile = ({navigation, route}) => {
  const [users, setUsers] = useState(null);
  const [userUid, setUserUid] = useState(null);
  const usersCollection = firestore().collection('users');
  const clearUserToken = useStore(state => state.clearUserToken);
  const userToken = useStore(state => state.userToken); // 토큰 상태 추가

  // useEffect(() => {
  //   const fetchUserUid = async () => {
  //     try {
  //       const user = auth().currentUser;
  //       if (user) {
  //         //set uuid
  //         const userUID = user.uid;
  //         setUserUid(userUID);
  //       }
  //     } catch (error) {
  //       console.error('Error fetching current user: ', error);
  //     }
  //     console.log('call user uid', userUid);
  //   };
  //   fetchUserUid();
  // }, [navigation]);
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
    console.log('call user uid', userUid);
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
    if (userUid) {
      // userUid가 설정된 후에 fetchUserData 호출

      fetchUserData();
    }
  }, [userUid]);

  const handleLogout = async () => {
    try {
      // Firebase에서 로그아웃
      await auth().signOut();

      await AsyncStorage.removeItem('userToken');

      navigation.navigate('LoginTab');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  console.log('User Token:', userToken);
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
                })
              }
              style={styles.myList}>
              <Image source={pencil} style={styles.icon} />
              <Text
                //hobbies

                style={styles.listStyle}>
                내가 쓴 글
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.myList}>
              <Image source={heart} style={styles.icon} />
              <Text
                //likes
                // onPress={() => navigation.navigate('Home')}
                style={styles.listStyle}>
                찜한 글
              </Text>
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
