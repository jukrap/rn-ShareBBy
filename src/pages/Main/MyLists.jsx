import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import React, {useEffect, useState} from 'react';
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

const PostItem = React.memo(({item}) => {
  return (
    <View style={styles.containerView}>
      <View style={styles.container}>
        <View style={styles.post}>
          <View style={styles.profileWrapper}>
            <Image
              style={styles.image}
              source={{uri: item.user.profileImage}}
            />
            <View style={styles.userName}>
              <Text style={styles.name}>{item.user.nickname}</Text>
              <Text style={styles.date}>
                {item.post_created
                  ? formatDate(item.post_created)
                  : '날짜 정보 없음'}
              </Text>
            </View>
          </View>

          <Text style={styles.content}>{item.post_content}</Text>
          <View style={styles.imageWrapper}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {item.post_files &&
                item.post_files.map((file, index) => (
                  <Image
                    key={index}
                    style={styles.contentImage}
                    source={{uri: file}}
                  />
                ))}
            </ScrollView>
          </View>
          <View style={styles.like}>
            <Image source={heart} style={styles.heart} />
            <Text style={styles.likeCount}>{item.likeCount}</Text>
          </View>
        </View>
      </View>
    </View>
  );
});

const MyLists = ({navigation, route}) => {
  const uuid = route.params.uuid;
  const postsCollection = firestore().collection('posts');
  const likesCollection = firestore().collection('likes');
  const usersCollection = firestore().collection('users');
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    const likesSnapshot = await likesCollection
      .where('userId', '==', uuid)
      .get();
    const postsPromises = likesSnapshot.docs.map(doc => {
      return postsCollection.doc(doc.data().postId).get();
    });

    const postsSnapshots = await Promise.all(postsPromises);
    const userIds = [
      ...new Set(postsSnapshots.map(snap => snap.data().userId)),
    ];

    const userPromises = userIds.map(id => usersCollection.doc(id).get());
    const usersSnapshots = await Promise.all(userPromises);

    const users = usersSnapshots.reduce((acc, snap) => {
      const userData = snap.data();
      acc[snap.id] = {
        nickname: userData.nickname,
        profileImage: userData.profileImage,
      };
      return acc;
    }, {});

    const tmpPosts = postsSnapshots.map((snapshot, index) => {
      const post = {...snapshot.data(), id: snapshot.id};
      post.user = users[post.userId];
      if (post.post_created && post.post_created.toDate) {
        post.post_created = post.post_created.toDate(); // Date 객체로 변환
      }
      return post;
    });

    setPosts(tmpPosts);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <FlatList
      data={posts}
      renderItem={({item}) => <PostItem item={item} />}
      keyExtractor={item => item.id}
      ListHeaderComponent={() => (
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image style={styles.arrow} source={leftArrow} />
          </TouchableOpacity>
          <Text style={styles.headtext}>내가 찜한 글</Text>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  containerView: {flex: 1},
  container: {
    marginLeft: 20,
    marginRight: 20,
  },
  profileWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  post: {
    borderColor: 'grey',
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    marginTop: 12,
    marginBottom: 12,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 60,
    marginBottom: 20,
  },
  arrow: {width: 22, height: 22},
  headtext: {fontSize: 20, fontWeight: 'bold', marginLeft: 10},
  profileWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 50,
  },
  userName: {
    justifyContent: 'flex-end',
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
  content: {
    marginTop: 15,
    marginBottom: 15,
    ellipsizeMode: 'tail',
    color: '#212529',
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

export default MyLists;
