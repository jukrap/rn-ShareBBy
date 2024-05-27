import React from 'react';
import {View, Image, Dimensions} from 'react-native';
import Modal from 'react-native-modal';

const ImageDetail = ({isVisible, imageUri, closeModal}) => {
  const {width, height} = Dimensions.get('window');

  return (
    <Modal
      isVisible={isVisible}
      backdropOpacity={0.7}
      onBackdropPress={closeModal}>
      <View style={{justifyContent: 'center', alignItems: 'center'}}>
        <Image style={{width: width, height: width}} source={{uri: imageUri}} />
      </View>
    </Modal>
  );
};

export default ImageDetail;
