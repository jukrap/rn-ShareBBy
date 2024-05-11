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
const MyPosts = ({navigation, route}) => {
  const uuid = route.params.uuid;
  const postsCollection = firestore().collection('posts');
  const [posts, setPosts] = useState([]);
  const fetchPostData = async () => {
    try {
      const snapshot = await postsCollection.where('userId', '==', uuid).get();
      const tmp_posts = snapshot.docs.map(doc => {
        const data = doc.data();
        if (data.post_created && data.post_created.toDate) {
          data.post_created = data.post_created.toDate(); // Date 객체로 변환
        }
        return {id: doc.id, ...data};
      });
      setPosts(tmp_posts);
      // console.log(posts);
    } catch (error) {
      console.error('Error fetching posts:', error.message);
    }
  };
  useEffect(() => {
    fetchPostData();
  }, []);
  return (
    <ScrollView>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image style={styles.arrow} source={leftArrow} />
        </TouchableOpacity>
        <Text style={styles.headtext}>내가 쓴 글</Text>
      </View>
      <View style={styles.container}>
        {posts.map((it, idx) => {
          return (
            <View key={idx} style={styles.post}>
              <View style={styles.userName}>
                <Image
                  style={{width: 30, height: 30}}
                  source={{uri: route.params.profileImage}}
                />
                <Text>{route.params.nickname}</Text>
              </View>
              <Text>{it.likeCount}</Text>
              <Text>{it.post_content}</Text>
              <Text>
                {it.post_created
                  ? formatDate(it.post_created)
                  : '날짜 정보 없음'}
              </Text>

              {it.post_files.map(file => {
                <Image source={file} />;
              })}
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

export default MyPosts;
