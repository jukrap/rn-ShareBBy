import React from 'react';
import {View, FlatList, Image, Text} from 'react-native';

const ChatMemberList = ({chatMembers}) => {
  return (
    <FlatList
      data={chatMembers}
      renderItem={({item}) => (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            marginBottom: 16,
          }}>
          <Image
            source={{uri: item.profileImage}}
            style={{width: 30, height: 30, borderRadius: 8}}
          />
          <Text>{item.nickname}</Text>
        </View>
      )}
      keyExtractor={(item, index) => index.toString()}
      showsVerticalScrollIndicator={false}
    />
  );
};

export default ChatMemberList;
