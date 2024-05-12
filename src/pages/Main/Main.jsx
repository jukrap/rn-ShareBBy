import React, {useEffect, useState, useRef, useMemo} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Image,
  FlatList,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

import { getHobbiesDetail } from '../../lib/hobby';
import userStore from '../../lib/userStore' 

const {width, height} = Dimensions.get('window');

// OptimizedImageItem 컴포넌트를 메모이제이션해서 성능 향상
const OptimizedImageItem = React.memo(({item}) => {
  const source = useMemo(() => item.bgImg, [item.bgImg]);
  return (
    <Image source={source} style={{width: width, height: height / 4}} />
  );
});

const Main = ({navigation}) => {
  const [optionClick, setOptionClick] = useState('');
  const [currUserData, setCurrUserData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageUrl, setImageUrl] = useState(null);
  const [eventBanner, setEventBanner] = useState([]);
  const bannerRef = useRef('');
  const userData = userStore(state => state.userData); 

  // 사용자 데이터를 가져오는 useEffect
  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth().currentUser;
        if (user) {
          const userCollection = firestore().collection('users');
          const currUser = await userCollection.doc(user.uid).get();
          const userData = currUser.data();
          setCurrUserData(userData);
          setImageUrl(userData.profileImage);
        } else {
          console.log('사용자를 찾을 수 없음');
        }
      } catch (error) {
        console.error('데이터를 가져오는 중 오류 발생:', error);
      }
    };

    fetchData();
  }, []);

  // 이벤트 배너 이미지를 가져오는 useEffect , 파이어스토어 테이블 만들기
  useEffect(() => {
    const fetchEventBannerImages = async () => {
      try {
        const listRef = storage().ref('로그인');
        const imageRefs = await listRef.listAll();
        const updatedEventBanner = await Promise.all(
          imageRefs.items.map(async itemRef => {
            const url = await itemRef.getDownloadURL();
            return {bgImg: {uri: url}};
          }),
        );

        setEventBanner(updatedEventBanner);
      } catch (error) {
        console.error('이벤트 배너를 가져오는 중 오류 발생:', error);
      }
    };

    fetchEventBannerImages();
  }, []);

  // 이벤트 배너를 자동으로 스크롤하는 useEffect, 이너벌 대신 애니메이션에서 duration
  useEffect(() => {
    const scrollInterval = setInterval(() => {
      if (eventBanner.length > 1 && bannerRef.current) {
        let nextIndex;
        if (currentIndex === eventBanner.length - 1) {
          nextIndex = 1;
          bannerRef.current.scrollToIndex({
            index: nextIndex,
            animated: false,
          });
        } else {
          nextIndex = currentIndex + 1;
          bannerRef.current.scrollToIndex({
            index: nextIndex,
            animated: true,
          });
        }
        setCurrentIndex(nextIndex);
      }
    }, 3000);

    return () => {
      clearInterval(scrollInterval);
    };
  }, [currentIndex, eventBanner.length]);

  // 옵션 클릭 이벤트 핸들러
  const handleOptionClick = id => {
    setOptionClick(id);
  };

  // 옵션 아이템 렌더링 함수
  const optionItem = ({item}) => {
    return (
      <TouchableOpacity
        style={{
          justifyContent: 'center',
          paddingLeft: 35,
          paddingRight: 10,
          paddingVertical: 20,
        }}
        onPress={() => handleOptionClick(item.id)}>
        <Text
          style={{
            fontWeight: '600',
            color: optionClick === item.id ? '#07AC7D' : '#A7A7A7',
          }}>
          {item.option}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
      <View style={styles.topbarView}>
        <Text style={{fontSize: 24, fontWeight: '700', color: '#07AC7D'}}>
          ShareBBy
        </Text>
      </View>
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          borderBottomWidth: 1,
          borderBottomColor: '#DBDBDB',
        }}>
        <FlatList
          data={topOption}
          renderItem={optionItem}
          keyExtractor={item => item.id.toString()}
          horizontal
        />
      </View>
      <ScrollView style={{height: '50%'}}>
        <View>
          <FlatList
            data={eventBanner}
            ref={bannerRef}
            renderItem={({item}) => <OptimizedImageItem item={item} />}
            keyExtractor={(_, index) => index.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            automaticallyAdjustContentInsets={false}
            decelerationRate="fast"
            pagingEnabled
            snapToInterval={width}
            snapToAlignment="start"
          />
        </View>
        <View style={styles.divisionView} />
        <View style={{marginBottom: 20, paddingHorizontal: 16, gap: 6}}>
          <View style={styles.hobbyNameView}>
            <TouchableOpacity
              style={{flexDirection: 'row', alignItems: 'center', gap: 8}}
              onPress={() => navigation.navigate('Profile')}>
              <Image
                source={{uri: imageUrl}}
                style={{
                  borderWidth: 1,
                  borderColor: '#a7a7a7',
                  borderRadius: 10,
                  width: 20,
                  height: 20,
                  bottom: 1,
                }}
              />
              <Text
                style={[styles.nomalText, {fontSize: 16, color: '#07AC7D'}]}>
                {currUserData.nickname}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.nomalText, {fontWeight: '500'}]}>
              님, 취미활동 하러 가보실까요?
            </Text>
          </View>
          <View style={{justifyContent: 'space-between', flexDirection: 'row'}}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.hobbyBox, {backgroundColor: '#703CA0'}]}
              onPress={() => navigation.navigate('Recruit', currUserData)}>
              <Image
                source={goRecruit}
                style={{width: 100, height: 100, marginTop: 'auto'}}
              />
              <Text style={styles.hobbyText}>모집하기</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.hobbyBox, {backgroundColor: '#E8C257'}]}
              onPress={() => navigation.navigate('Join')}>
              <Image
                source={goJoin}
                style={{width: 100, height: 100, marginTop: 'auto'}}
              />
              <Text style={styles.hobbyText}>참여하기</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.divisionView} />

        <View style={styles.joinBox}>
          <Text style={[styles.nomalText, {fontSize: 16, fontWeight: '600'}]}>
            이달의 참여왕은? 🔥
          </Text>
          <Text
            style={[
              styles.nomalText,
              {fontSize: 14, fontWeight: '600', color: '#7B7B7B'},
            ]}>
            현재 가장 많이 취미활동에 참여한 유저는 누구일까요?
          </Text>
          <View style={{gap: 10, marginTop: 10}}>
            <View style={styles.gradeUpView}>
              <View style={[styles.gradeUp, {top: 20}]}>
                <Image
                  source={dummyProfileIcon}
                  style={{width: 55, height: 55}}
                />
                <View style={styles.gradeNum}>
                  <Text style={{color: '#fff', fontWeight: 'bold'}}>2</Text>
                </View>
                <Text style={{fontSize: 16, fontWeight: '600'}}>{userData ? JSON.stringify(userData.nname) : '데이터 없음'}</Text>
              </View>
              <View style={styles.gradeUp}>
                <Image source={dummyProfileIcon} />
                <View style={styles.gradeNum}>
                  <Text style={{color: '#fff', fontWeight: 'bold'}}>1</Text>
                </View>
                <Text style={{fontSize: 16, fontWeight: '600'}}>김한솔</Text>
              </View>
              <View style={[styles.gradeUp, {top: 20}]}>
                <Image
                  source={dummyProfileIcon}
                  style={{width: 55, height: 55}}
                />
                <View style={styles.gradeNum}>
                  <Text style={{color: '#fff', fontWeight: 'bold'}}>3</Text>
                </View>
                <Text style={{fontSize: 16, fontWeight: '600'}}>김선구</Text>
              </View>
            </View>
            <View
              style={{
                marginTop: 20,
                borderTopWidth: 1,
                borderTopColor: '#DBDBDB',
              }}>
              <View style={styles.gradeLow}>
                <Text>4등</Text>
                <Image
                  source={dummyProfileIcon}
                  style={{width: 36, height: 36}}
                />
                <Text>김준엽</Text>
              </View>
              <View style={styles.gradeLow}>
                <Text>5등</Text>
                <Image
                  source={dummyProfileIcon}
                  style={{width: 36, height: 36}}
                />
                <Text>박주철</Text>
              </View>
              <View style={styles.gradeLow}>
                <Text>6등</Text>
                <Image
                  source={dummyProfileIcon}
                  style={{width: 36, height: 36}}
                />
                <Text>이나겸</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const goJoin = require('../../assets/images/goJoin.png');
const goRecruit = require('../../assets/images/goRecruit.png');
const dummyProfileIcon = require('../../assets/icons/dummyProfileIcon.png');

const topOption = [
  {
    id: 0,
    option: '홈',
  },
  {
    id: 1,
    option: '취미활동',
  },
  {
    id: 2,
    option: '순위',
  },
  {
    id: 3,
    option: '체험단',
  },
  {
    id: 4,
    option: '친구초대',
  },
];
const styles = StyleSheet.create({
  topbarView: {
    height: 44,
    paddingHorizontal: 24,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#DBDBDB',
    backgroundColor: '#fff',
  },
  searchView: {
    width: width,
    paddingHorizontal: 16,
    marginTop: 20,
    position: 'absolute',
    zIndex: 2,
  },
  searchOpacity: {
    height: 40,
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#A7A7A7',
    shadowOffset: {
      width: 1,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  hobbyNameView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 15,
    gap: 8,
  },
  hobbyBox: {
    width: 176,
    height: 176,
    overflow: 'hidden',
    borderRadius: 15,
  },
  hobbyText: {
    left: 45,
    top: 70,
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    position: 'absolute',
    zIndex: 2,
  },
  joinBox: {
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingTop: 15,
    gap: 6,
  },
  gradeUpView: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  gradeUp: {
    gap: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeLow: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#DBDBDB',
  },
  gradeNum: {
    width: 24,
    height: 24,
    bottom: 20,
    position: 'absolute',
    zIndex: 2,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4AABFF',
  },
  divisionView: {
    width: width,
    borderWidth: 1,
    borderColor: '#DBDBDB',
  },
  pressLocaView: {
    marginHorizontal: 30,
    borderRadius: 10,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  pressText: {
    marginBottom: 6,
    fontSize: 16,
  },
  pressOptionView: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  pressOptionBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  pressOptionText: {
    fontSize: 16,
    color: '#FFF',
  },
  nomalText: {
    color: '#000',
    fontFamily: 'Pretendard',
    fontSize: 14,
    fontWeight: 'bold',
  },
  howText: {
    color: '#fff',
    fontFamily: 'Pretendard',
    fontSize: 16,
  },
  icon: {
    width: 24,
    height: 24,
  },
  listView: {
    width: width / 1.3,
    height: width / 2.4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    marginHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#07AC7D',
    backgroundColor: '#fff',
    shadowColor: '#A7A7A7',
    shadowOffset: {
      width: 4,
      height: 1,
    },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  listTitle: {
    color: '#000',
    fontFamily: 'Pretendard',
    fontSize: 16,
    fontWeight: 600,
  },
  listRcruit: {
    fontFamily: 'Pretendard',
    fontSize: 12,
    fontWeight: 700,
  },
  listLocation: {
    color: '#07AC7D',
    width: 200,
    fontFamily: 'Pretendard',
    fontWeight: 400,
  },
  showBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#07AC7D',
  },
});

export default Main;
