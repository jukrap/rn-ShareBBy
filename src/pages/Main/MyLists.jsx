import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import React, {useEffect, useState} from 'react';
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

const PostItem = React.memo(({item}) => {
  return (
    <View>
      <Text>{item.user.nickname}</Text>
      <Image
        style={{width: 30, height: 30}}
        source={{uri: item.user.profileImage}}
      />
      <Text>{item.likeCount}</Text>
      <Text>{item.post_content}</Text>
      <Text>
        {item.post_created ? formatDate(item.post_created) : '날짜 정보 없음'}
      </Text>

      {item.post_files &&
        item.post_files.map((file, index) => (
          <Image key={index} source={file} />
        ))}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 60,
  },
  arrow: {width: 22, height: 22},
  headtext: {fontSize: 20, fontWeight: 'bold', marginLeft: 10},
});

export default MyLists;
//uzq1FIrkr95yNtSjItn9 - KMSMOZANJ5S9E836RCFoJUQg5pv1
//iRVj0TcYnixGcTahLkfd - S2ChJimGIVTh5pUnolYQNErL8iU2
//rOWgF2HJIrzHNepqBESa - KMSMOZANJ5S9E836RCFoJUQg5pv1
