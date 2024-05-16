import React, {useRef, useState} from 'react';
import {SafeAreaView, View, Text, Dimensions} from 'react-native';

const {width, height} = Dimensions.get('window');

const Board = ({navigation, route}) => {
  return (
    <SafeAreaView style={{flex: 1}}>
      <View>
        <Text></Text>
      </View>
    </SafeAreaView>
  );
};

export default Board;
