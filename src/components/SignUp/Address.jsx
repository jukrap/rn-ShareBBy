import React from 'react';
import { SafeAreaView } from 'react-native';
import { WebView } from 'react-native-webview';

const Address = () => {
  return (
    <SafeAreaView style={{flex:1}}>
    <WebView
    
      source={{ uri: 'https://www.notion.so/prgrms/e8440fd5127e4dfbb18bc25bdbdb9957?v=dfbfcdd87c4f46bdb063d646103465c7&p=2f78beb46c8247c687e280fc4abbea71&pm=s' }}
      startInLoadingState={true}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      scalesPageToFit={true}
      
    />
    </SafeAreaView>
  );
};

export default Address;
