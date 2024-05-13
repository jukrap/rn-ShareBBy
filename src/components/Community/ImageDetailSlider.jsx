import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  FlatList,
  TouchableWithoutFeedback,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {FasterImageView} from '@candlefinance/faster-image';

const {width, height} = Dimensions.get('window');

const ImageDetailSlider = ({images, initialIndex = 0}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const flatListRef = useRef(null);

  useEffect(() => {
    flatListRef.current.scrollToIndex({index: currentIndex, animated: true});
  }, [currentIndex]);

  const handleMomentumScrollEnd = event => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const handlePaginationPress = index => {
    setCurrentIndex(index);
    flatListRef.current.scrollToIndex({index, animated: true});
  };

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

  const renderImageItem = ({item, index}) => (
    <TouchableWithoutFeedback key={index}>
      <View style={styles.slide}>
        <FasterImageView
          style={styles.image}
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
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={images}
        renderItem={renderImageItem}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        getItemLayout={(data, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />
      <View style={styles.paginationContainer}>
        {images.map((_, index) => renderPaginationItem(_, index))}
      </View>
    </View>
  );
};

const defaultPostImg = require('../../assets/images/defaultPostImg.jpg');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width,
    height: height * 0.7,
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paginationItem: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DBDBDB',
    marginHorizontal: 8,
  },
  paginationItemActive: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#07AC7D',
  },
});

export default ImageDetailSlider;
