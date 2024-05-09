import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Image,
  FlatList,
  Dimensions,
} from 'react-native';

import ImageDetail from '../../components/Chat/Modal/ImageDetail';

const ShowAllImages = ({navigation, route}) => {
  const {messages} = route.params;
  const {width, height} = Dimensions.get('window');

  const [imageUri, setImageUri] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  const toggleModal = imageUri => {
    setImageUri(imageUri);
    setIsVisible(true);
  };

  const closeModal = () => {
    setIsVisible(false);
  };

  const renderImages = ({item}) => {
    return (
      <TouchableOpacity
        onPress={() => toggleModal(item.image)}
        style={{marginHorizontal: 1.5}}>
        {item.image && (
          <Image
            source={{uri: item.image}}
            style={{width: width / 3 - 4, height: width / 3 - 4}}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <View
        style={{
          paddingTop: 8,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 16,
          marginBottom: 32,
        }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require('../../assets/icons/backIcon.png')}
            style={{width: 24, height: 24}}
          />
        </TouchableOpacity>
        <Text style={{fontSize: 20, fontWeight: '600'}}>앨범</Text>
        <View />
      </View>

      <View style={{flex: 1}}>
        <FlatList
          data={messages}
          renderItem={renderImages}
          keyExtractor={(item, index) => index.toString()}
          numColumns={3}
        />
      </View>
      <ImageDetail
        isVisible={isVisible}
        imageUri={imageUri}
        closeModal={closeModal}
      />
    </SafeAreaView>
  );
};

export default ShowAllImages;
