import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {useEffect, useState} from 'react';
const leftArrow = require('../../assets/newIcons/backIcon.png');
const formatDate = date => {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true,
    timeZone: 'Asia/Seoul',
  }).format(date);
};
const MyRecruits = ({navigation, route}) => {
  const uuid = route.params.uuid;
  const hobbyCollection = firestore().collection('hobbies');
  const [hobbies, setHobbies] = useState([]);
  const fetchHobbyData = async () => {
    try {
      const snapshot = await hobbyCollection.where('user_id', '==', uuid).get();
      const tmp_recruit = snapshot.docs.map(doc => {
        const data = doc.data();
        if (data.deadline && data.deadline.toDate) {
          data.deadline = data.deadline.toDate(); // Date 객체로 변환
        }
        if (data.writeTime && data.writeTime.toDate) {
          data.writeTime = data.writeTime.toDate(); // Date 객체로 변환
        }

        return {id: doc.id, ...data};
      });
      setHobbies(tmp_recruit);
      // console.log(posts);
    } catch (error) {
      console.error('Error fetching posts:', error.message);
    }
  };
  useEffect(() => {
    fetchHobbyData();
  }, []);
  return (
    <ScrollView>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image style={styles.arrow} source={leftArrow} />
        </TouchableOpacity>
        <Text style={styles.headtext}>내 모집 공고</Text>
      </View>
      <View style={styles.container}>
        {hobbies.map((it, idx) => {
          return (
            <View key={idx} style={styles.post}>
              <View style={styles.userName}>
                <Image
                  style={{width: 30, height: 30}}
                  source={{uri: route.params.profileImage}}
                />
                <Text>{route.params.nickname}</Text>
                <Text>
                  작성시간 :
                  {it.writeTime ? formatDate(it.writeTime) : '날짜 정보 없음'}
                </Text>
              </View>
              <Text>주소 : {it.address}</Text>
              <Text>상세 주소 : {it.detail_address}</Text>
              <Text>내용 : {it.content}</Text>
              <Text>제목 : {it.title}</Text>
              <Text>태그 : {it.tag}</Text>
              <Text>
                데드라인 :
                {it.deadline ? formatDate(it.deadline) : '날짜 정보 없음'}
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 60,
  },
  arrow: {width: 22, height: 22},
  headtext: {fontSize: 20, fontWeight: 'bold', marginLeft: 10},
  container: {
    margin: 20,
  },
  post: {},
  userName: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default MyRecruits;
