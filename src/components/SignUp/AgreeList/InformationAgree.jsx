import React from 'react';
import { SafeAreaView, View, Text, Image, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';

const backIcon = require('../../../assets/icons/back.png');

const InformationAgree = ({navigation}) => {
  return (
    <SafeAreaView style={{flex:1}}>
        <View style={{flexDirection:'row', alignItems:'center', height:30, backgroundColor:'#333'}}>
            <TouchableOpacity onPress={()=> navigation.goBack()} style={{flex:0.5}}>
            <Image source={backIcon}/>
            </TouchableOpacity>
            <View>
            <Text style={{color:'#fff'}}>개인정보 처리 방침 동의</Text>
            </View>
            </View>

    <WebView
      source={{ uri: 'https://spectacled-daughter-4a3.notion.site/6b3673282890484aa91fdaa46a8f2a60?pvs=4' }}
      startInLoadingState={true}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      scalesPageToFit={true}
    />
    </SafeAreaView>
  );
};

export default InformationAgree;
