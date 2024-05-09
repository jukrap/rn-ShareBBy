import {StyleSheet, View, Text} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {useEffect, useState} from 'react';
const MyPosts = ({navigation, route}) => {
  const uuid = route.params.uuid;
  const postsCollection = firestore().collection('posts');
  const [posts, setPosts] = useState([]);
  const fetchPostData = async () => {
    const snapshot = await postsCollection.where('userId', '==', uuid).get();
    let tmp_posts = [];

    snapshot.forEach(doc => {
      let data = doc.data();
      let post_created = data.post_created
        ? new Date(data.post_created.seconds * 1000)
        : null; // Date 객체로 변환
      tmp_posts.push({id: doc.id, post_created, ...data});
    });
    setPosts(tmp_posts);
    console.log(tmp_posts);
  };
  useEffect(() => {
    fetchPostData();
  }, []);
  return <View></View>;
};

const styles = StyleSheet.create({});

export default MyPosts;
