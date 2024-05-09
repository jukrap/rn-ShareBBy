import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Image,
  FlatList,
  Dimensions,
} from 'react-native';

const ShowAllImages = ({navigation, route}) => {
  const {messages} = route.params;
  const {width, height} = Dimensions.get('window');

  const renderImages = ({item}) => {
    console.log('item:', item);
    return (
      <TouchableOpacity>
        {item.image && (
          <Image
            source={{uri: item.image}}
            style={{width: width / 3 - 10, height: width / 3 - 10}}
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
        <Text style={{fontSize: 22, fontWeight: '600'}}>앨범</Text>
        <View />
      </View>

      <View style={{flex: 1, backgroundColor: 'gray'}}>
        <FlatList
          data={messages}
          renderItem={renderImages}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
    </SafeAreaView>
  );
};

export default ShowAllImages;
