import React from 'react';
import {SafeAreaView, View, Text, Image, TouchableOpacity} from 'react-native';
import {WebView} from 'react-native-webview';
import {BackIcon2} from '../../../assets/assets';

const ServiceAgree = ({navigation}) => {
  return (
    <SafeAreaView style={{flex: 1, backgroundColor:'#fefffe'}}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          height: 30,
          backgroundColor: '#333',
        }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{flex: 0.5}}>
          <Image source={BackIcon2} />
        </TouchableOpacity>
        <View>
          <Text style={{color: '#fff'}}>이용약관 동의</Text>
        </View>
      </View>

      <WebView
        source={{
          uri: 'https://spectacled-daughter-4a3.notion.site/d8b20acc00a5460f9a84108dc0cb44bb?pvs=4',
        }}
        startInLoadingState={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scalesPageToFit={true}
      />
    </SafeAreaView>
  );
};

export default ServiceAgree;
