import React from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Modal from 'react-native-modal';
import ImageDetailSlider from './ImageDetailSlider';

const {width, height} = Dimensions.get('window');

const ImageDetailModal = ({images, currentIndex, isVisible, onClose}) => {
  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection={['down']}
      style={styles.modal}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Image source={greenCloseIcon} style={styles.closeIcon} />
        </TouchableOpacity>
        <ImageDetailSlider images={images} initialIndex={currentIndex} />
      </View>
    </Modal>
  );
};

const greenCloseIcon = require('../../assets/newIcons/greenCloseIcon.png');

const styles = StyleSheet.create({
  modal: {
    margin: 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#212529',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: 56,
  },
  closeButton: {
    position: 'absolute',
    top: 32,
    left: 32,
    zIndex: 1,
  },
  closeIcon: {
    width: 24,
    height: 24,
  },
});

export default ImageDetailModal;
