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

const {width, height} = Dimensions.get('window');
const ImageDetailModal = ({images, currentIndex, isVisible, onClose}) => {
  console.log('currentIndex: ', currentIndex);
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
                <Image
                  style={styles.postImage}
                  source={{uri: item}}
                  resizeMode="contain"
                  defaultSource={defaultPostImg}
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
  },
  wrapper: {},
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postImage: {
    width: width,
    height: height * 0.8,
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
    bottom: 80,
    borderRadius: 100,
    marginHorizontal: 8,
  },
  paginationStyleItemActives: {
    width: 12,
    height: 12,
    borderRadius: 100,
    marginHorizontal: 8,
    bottom: 82,
  },
});

export default ImageDetailModal;
