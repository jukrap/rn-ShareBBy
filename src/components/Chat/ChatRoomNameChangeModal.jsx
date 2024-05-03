// ChatRoomNameChangeModal.js

import React, {useState} from 'react';
import {View, Text, TextInput, TouchableOpacity} from 'react-native';
import Modal from 'react-native-modal';

const ChatRoomNameChangeModal = ({
  isVisible,
  toggleChatRoomNameChangeModal,
  updateChatRoomName,
}) => {
  const [newName, setNewName] = useState('');

  const handleUpdateName = () => {
    updateChatRoomName(newName);
    setNewName('');
  };

  return (
    <Modal isVisible={isVisible} backdropOpacity={0.5}>
      <View
        style={{
          width: 350,
          height: 150,
          borderRadius: 12,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#fff',
          gap: 16,
        }}>
        <View>
          <TextInput
            value={newName}
            onChangeText={setNewName}
            spellCheck={false}
            autoCorrect={false}
            autoCapitalize="none"
            style={{
              width: 300,
              height: 50,
              borderWidth: 2,
              borderRadius: 8,
              borderColor: '#07AC7D',
              paddingHorizontal: 8,
              paddingVertical: 8,
            }}
            placeholder="채팅방 이름을 변경하세요."
          />
        </View>
        <View style={{flexDirection: 'row', gap: 8}}>
          <TouchableOpacity onPress={handleUpdateName}>
            <Text style={{fontWeight: '700'}}>확인</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleChatRoomNameChangeModal}>
            <Text style={{fontWeight: '700'}}>취소</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ChatRoomNameChangeModal;
