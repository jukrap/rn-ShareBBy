import React from 'react';
import {SafeAreaView, View, Text, Image, TouchableOpacity} from 'react-native';
import {WebView} from 'react-native-webview';
import {BackIcon2} from '../../../assets/assets';

const MarketingAgree = ({navigation}) => {
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
          <Text style={{color: '#fff'}}>서비스 이용약관</Text>
        </View>
      </View>

      <WebView
        source={{
          uri: 'https://spectacled-daughter-4a3.notion.site/bf2561e0dfc740e8917bedd8bbd35d26?pvs=4',
        }}
        startInLoadingState={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scalesPageToFit={true}
      />
    </SafeAreaView>
  );
};

export default MarketingAgree;
