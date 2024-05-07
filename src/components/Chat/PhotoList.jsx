// PhotoList.js

import React, {useState, useEffect} from 'react';
import {View, Image, FlatList} from 'react-native';
import storage from '@react-native-firebase/storage';

const PhotoList = ({chatRoomId}) => {
  const [photoUrls, setPhotoUrls] = useState([]);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const listResult = await storage()
          .ref(`chatRoomImages/${chatRoomId}`)
          .listAll();

        const urls = [];

        await Promise.all(
          listResult.items.map(async item => {
            const url = await item.getDownloadURL();
            urls.push(url);
          }),
        );

        setPhotoUrls(urls);
      } catch (error) {
        console.error('Error fetching photos:', error);
      }
    };

    fetchPhotos();
  }, []);

  return (
    <View>
      <FlatList
        horizontal
        data={photoUrls}
        renderItem={({item}) => (
          <View style={{marginHorizontal: 4}}>
            <Image
              style={{width: 64, height: 64, borderRadius: 8}}
              source={{uri: item}}
            />
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};

export default PhotoList;
