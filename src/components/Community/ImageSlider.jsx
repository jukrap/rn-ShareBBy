import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {FasterImageView} from '@candlefinance/faster-image';
import ImageDetailModal from './ImageDetailModal';

const {width, height} = Dimensions.get('window');

const ImageSlider = ({images, autoSlide = false, autoSlideInterval = 3000}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const flatListRef = useRef(null);
  const slideTimerRef = useRef(null);

  useEffect(() => {
    if (autoSlide && images.length > 1) {
      startSlideTimer();
    }

    return () => {
      clearSlideTimer();
    };
  }, [autoSlide, autoSlideInterval, images]);

  useEffect(() => {
    flatListRef.current.scrollToIndex({index: currentIndex, animated: true});

    if (autoSlide && images.length > 1) {
      resetSlideTimer();
    }
  }, [currentIndex]);

  const startSlideTimer = () => {
    slideTimerRef.current = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % images.length);
    }, autoSlideInterval);
  };

  const resetSlideTimer = () => {
    clearSlideTimer();
    startSlideTimer();
  };

  const clearSlideTimer = () => {
    if (slideTimerRef.current) {
      clearInterval(slideTimerRef.current);
    }
  };

  const handleImagePress = index => {
    setCurrentIndex(index);
    setIsImageModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsImageModalVisible(false);
  };

  const handlePaginationPress = index => {
    setCurrentIndex(index);
  };

  const renderImageItem = ({item, index}) => (
    <TouchableOpacity activeOpacity={1} onPress={() => handleImagePress(index)}>
      <FasterImageView
        style={styles.image}
        source={{
          url: item,
          priority: 'high',
          cachePolicy: 'discWithCacheControl',
          failureImageUrl: defaultPostImg,
          resizeMode: 'cover',
        }}
      />
    </TouchableOpacity>
  );

  const renderPaginationItem = (_, index) => (
    <TouchableOpacity
      key={index}
      style={[
        styles.paginationItem,
        index === currentIndex && styles.paginationItemActive,
      ]}
      onPress={() => handlePaginationPress(index)}
    />
  );

  return (
    <View
      style={[
        styles.container,
        images.length > 1 && styles.multiImageContainer,
      ]}>
      <View style={styles.imageContainer}>
        <FlatList
          ref={flatListRef}
          data={images}
          renderItem={renderImageItem}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          pagingEnabled
          snapToInterval={width}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={event => {
            const index = Math.round(event.nativeEvent.contentOffset.x / width);
            setCurrentIndex(index);
          }}
          getItemLayout={(data, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
        />
      </View>
      {images.length > 1 && (
        <View style={styles.paginationContainer}>
          {images.map((_, index) => renderPaginationItem(_, index))}
        </View>
      )}
      <ImageDetailModal
        images={images}
        currentIndex={currentIndex}
        isVisible={isImageModalVisible}
        onClose={handleCloseModal}
      />
    </View>
  );
};

export default ImageSlider;

const defaultPostImg = require('../../assets/images/defaultPostImg.jpg');

const styles = StyleSheet.create({
  container: {
    height: height * 0.3,
    marginBottom: 16,
  },
  multiImageContainer: {
    marginBottom: 24,
  },
  imageContainer: {
    height: height * 0.3,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width,
    height: height * 0.3,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: -16,
    left: 0,
    right: 0,
  },
  paginationItem: {
    width: 4,
    height: 4,
    borderRadius: 50,
    backgroundColor: '#DBDBDB',
    marginHorizontal: 3,
  },
  paginationItemActive: {
    width: 6,
    height: 6,
    backgroundColor: '#07AC7D',
  },
});
