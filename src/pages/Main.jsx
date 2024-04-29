import React, { useState, useEffect } from 'react';
import { SafeAreaView, Text, View } from 'react-native';

const Main = ({ route }) => {
  const { nickname } = route.params; // 카카오 로그인 시 전달된 닉네임


  return (
    <SafeAreaView>
      <View>
        <Text>Kakao Nickname: {nickname}</Text>
      </View>
    </SafeAreaView>
  );
};

export default Main;
