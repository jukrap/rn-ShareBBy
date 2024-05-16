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
import {BackIcon} from '../../assets/assets';

function calculateTimeDifference(targetDate) {
  const now = new Date(); // 현재 시간
  const endDate = new Date(targetDate); // 목표 시간

  // 남은 시간을 밀리초 단위로 계산
  const timeDifference = endDate.getTime() - now.getTime();

  if (timeDifference <= 0) {
    // console.log('목표 시간이 이미 지났습니다.');
    return;
  }

  // 밀리초를 각 단위로 변환
  const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );
  const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
  // const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

  // 결과 출력
  return `모집 종료 : ${days}일 ${hours}시간 ${minutes}분`;
  // console.log(`남은 시간: ${days}일 ${hours}시간 ${minutes}분 ${seconds}초`);
}
const MyRecruits = ({navigation, route}) => {
  const uuid = route.params.uuid;
  const hobbyCollection = firestore().collection('hobbies');
  const [hobbies, setHobbies] = useState([]);
  const fetchHobbyData = async () => {
    try {
      const snapshot = await hobbyCollection.where('user_id', '==', uuid).get();
      const tmp_recruit = snapshot.docs.map(doc => {
        const data = doc.data();
        if (data.deadline) {
          data.deadline = calculateTimeDifference(data.deadline);
        }
        if (data.writeTime && data.writeTime.toDate) {
          data.writeTime = data.writeTime.toDate(); // Date 객체로 변환
        }
        if (data.personNumber === data.peopleCount) {
          data.nickname = '모집완료';
        } else {
          data.nickname = '모집중';
        }
        return {id: doc.id, ...data};
      });
      tmp_recruit.sort((a, b) => {
        const dateA = a.writeTime;
        const dateB = b.writeTime;
        return dateB - dateA; // 내림차순 정렬
      });
      setHobbies(tmp_recruit);
    } catch (error) {
      console.error('Error fetching posts:', error.message);
    }
  };
  useEffect(() => {
    fetchHobbyData();
  }, []);
  return (
    <View style={styles.containerView}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image style={styles.arrow} source={BackIcon} />
        </TouchableOpacity>
        <Text style={styles.headtext}>내 모집 공고</Text>
      </View>
      <ScrollView style={styles.container}>
        {hobbies.map((it, idx) => {
          return (
            <View key={idx} style={styles.post}>
              <Text style={styles.title}>{it.title}</Text>
              <View style={styles.recruiteContainer}>
                <View style={styles.contentWrapper}>
                  <Text style={styles.content}>{it.content}</Text>
                  <Text style={styles.address}>
                    {it.address} {it.detail_address}
                  </Text>
                </View>
                <View style={styles.recruiteWrapper}>
                  {it.nickname === '모집중' ? (
                    <Text style={styles.recruiteStatus}>모집중</Text>
                  ) : (
                    <Text style={styles.recruiteComplete}>모집완료</Text>
                  )}

                  <Text style={styles.personCount}>
                    {it.personNumber}/{it.peopleCount}
                  </Text>
                </View>
              </View>
              <Text style={styles.tag}>{it.tag}</Text>

              <Text style={styles.deadline}>
                {it.deadline ? it.deadline : '시간이 종료되었습니다'}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  containerView: {flex: 1},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 60,
  },
  arrow: {width: 22, height: 22},
  headtext: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  container: {
    margin: 20,
  },
  post: {
    borderColor: 'grey',
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    marginTop: 12,
    marginBottom: 12,
  },

  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 10,
  },
  recruiteContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contentWrapper: {
    flex: 0.95,
  },

  tag: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#212529',
    paddingTop: 5,
  },
  deadline: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#898989',
    paddingTop: 5,
    paddingBottom: 10,
  },
  content: {
    fontSize: 16,
    color: '#212529',
    paddingTop: 10,
    paddingBottom: 7,
  },
  address: {
    fontSize: 15,
    color: '#212529',
    paddingTop: 10,
    paddingBottom: 10,
  },
  recruiteWrapper: {
    marginLeft: 15,
    alignItems: 'center',
  },
  recruiteStatus: {
    fontSize: 16,
    color: '#07AC7D',
    paddingTop: 10,
    paddingBottom: 7,
  },
  recruiteComplete: {
    fontSize: 16,
    color: '#4E8FE4',
    paddingTop: 10,
    paddingBottom: 7,
  },
  personCount: {
    fontSize: 15,
    color: '#212529',
    paddingTop: 10,
    paddingBottom: 10,
  },
});

export default MyRecruits;
