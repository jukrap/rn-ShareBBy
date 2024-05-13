import React from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import {SwiperFlatList} from 'react-native-swiper-flatlist';
import Modal from 'react-native-modal';
import { FasterImageView } from '@candlefinance/faster-image';

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

        <SwiperFlatList
          index={currentIndex}
          showPagination
          paginationDefaultColor="#DBDBDB"
          paginationActiveColor="#07AC7D"
          paginationStyleItem={styles.paginationStyleItems}
          paginationStyleItemActive={styles.paginationStyleItemActives}
          data={images}
          style={styles.postSwiperFlatList}
          renderItem={({item, index}) => (
            <TouchableWithoutFeedback key={index}>
              <View style={styles.slide}>
              <FasterImageView
                  style={styles.postImage}
                  source={{
                    url: item,
                    priority: 'high',
                    cachePolicy: 'discWithCacheControl',
                    failureImageUrl: defaultPostImg,
                    resizeMode: 'contain',
                  }}
                />
              </View>
            </TouchableWithoutFeedback>
          )}
        />
      </View>
    </Modal>
  );
};

const greenCloseIcon = require('../../assets/icons/greenCloseIcon.png');
const defaultPostImg = require('../../assets/images/defaultPostImg.jpg');

const styles = StyleSheet.create({
  modal: {
    margin: 0,
  },
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    marginTop: 40,
  },
  wrapper: {},
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postImage: {
    width: width,
    height: height * 0.7,
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
  paginationStyleItems: {
    width: 8,
    height: 8,
    bottom: 48,
    borderRadius: 100,
    marginHorizontal: 8,
  },
  paginationStyleItemActives: {
    width: 12,
    height: 12,
    borderRadius: 100,
    marginHorizontal: 8,
    bottom: 50,
  },
});

export default ImageDetailModal;
