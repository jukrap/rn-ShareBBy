import React from 'react';
import {Text, View} from 'react-native';

const ChatListTime = ({type, month, day, time}) => {
  return (
    <View style={{justifyContent: 'flex-end', paddingBottom: 4}}>
      {type === 'timeOnly' && (
        <Text style={{fontSize: 10, color: '#AEA6B9'}}>{time}</Text>
      )}
      {type === 'yesterday' && (
        <Text style={{fontSize: 10, color: '#AEA6B9'}}>어제</Text>
      )}
      {type === 'monthAndDay' && (
        <Text style={{fontSize: 10, color: '#AEA6B9'}}>
          {`${month}월 ${day}일`}
        </Text>
      )}
    </View>
  );
};

export default ChatListTime;
