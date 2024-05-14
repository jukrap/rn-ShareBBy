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
const heart = require('../../assets/newIcons/heart-icon.png');
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
      // console.log('posts', posts);
    } catch (error) {
      console.error('Error fetching posts:', error.message);
    }
  };
  useEffect(() => {
    fetchPostData();
  }, []);
  return (
    <View>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image style={styles.arrow} source={leftArrow} />
        </TouchableOpacity>
        <Text style={styles.headtext}>내가 쓴 글</Text>
      </View>
      <ScrollView style={styles.container}>
        {posts.map((it, idx) => {
          return (
            <View key={idx} style={styles.post}>
              <View style={styles.profileWrapper}>
                <Image
                  style={styles.image}
                  source={{uri: route.params.profileImage}}
                />
                <View style={styles.userName}>
                  <Text style={styles.name}>{route.params.nickname}</Text>
                  <Text style={styles.date}>
                    {it.post_created
                      ? formatDate(it.post_created)
                      : '날짜 정보 없음'}
                  </Text>
                </View>
              </View>

              <Text
                // numberOfLines={3}
                style={styles.content}>
                {it.post_content}
              </Text>
              <View style={styles.imageWrapper}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {it.post_files.map(fileUri => {
                    return (
                      <Image
                        key={fileUri.id} // 'fileUri.id'가 실제로 존재하는지 확인 필요
                        source={{uri: fileUri}}
                        style={styles.contentImage}
                      />
                    );
                  })}
                </ScrollView>
              </View>
              <View style={styles.like}>
                <Image source={heart} style={styles.heart} />
                <Text style={styles.likeCount}>{it.likeCount}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
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
  post: {
    borderColor: 'grey',
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    marginTop: 12,
    marginBottom: 12,
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 50,
  },
  name: {
    fontSize: 16,
    marginLeft: 10,
    marginBottom: 2,
    color: '#212529',
  },
  date: {
    fontSize: 12,
    marginLeft: 10,
    fontWeight: 'bold',
    color: '#9A9A9A',
  },
  profileWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    justifyContent: 'flex-end',
  },
  content: {
    marginTop: 15,
    marginBottom: 15,
    ellipsizeMode: 'tail',
    color: '#212529',
  },
  imageWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentImage: {
    marginRight: 10,
    width: 200,
    height: 200,
  },
  like: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  heart: {width: 22, height: 22},
  likeCount: {
    marginLeft: 5,
    fontSize: 15,
  },
});

export default MyPosts;
