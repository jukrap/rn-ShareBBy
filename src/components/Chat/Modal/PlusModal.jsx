import React from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native';
import Modal from 'react-native-modal';

import {CameraIcon, ImageIcon} from '../../../assets/assets';

const PlusModal = ({isVisible, toggleModal, getPhotos, getPhotosByCamera}) => {
  return (
    <Modal
      isVisible={isVisible}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.5}
      onBackdropPress={toggleModal}
      style={{
        justifyContent: 'flex-end',
        alignItems: 'center',
        margin: 0,
      }}>
      <View
        style={{
          flex: 0.17,
          width: '100%',
          paddingTop: 12,
          backgroundColor: '#fff',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 12,
        }}>
        <View
          style={{
            flexDirection: 'row',
            width: '100%',
            justifyContent: 'space-around',
            paddingHorizontal: 24,
            flex: 3,
          }}>
          <TouchableOpacity
            style={{alignItems: 'center', justifyContent: 'center', gap: 8}}
            onPress={getPhotos}>
            <Image style={{width: 28, height: 28}} source={ImageIcon} />
            <Text>사진</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{alignItems: 'center', justifyContent: 'center', gap: 8}}
            onPress={getPhotosByCamera}>
            <Image style={{width: 28, height: 28}} source={CameraIcon} />
            <Text>카메라</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={{flex: 1.5}} onPress={toggleModal}>
          <Text>취소</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default PlusModal;
