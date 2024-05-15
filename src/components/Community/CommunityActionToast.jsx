import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';

const CommunityActionToast = ({
  visible,
  message,
  duration = 5000,
  onClose,
  leftIcon,
  closeButton,
  progressBar,
}) => {
  const [isVisible, setIsVisible] = useState(visible);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setIsVisible(visible);
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      if (progressBar) {
        progressAnim.setValue(0);
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: duration,
          useNativeDriver: false,
        }).start();
      }
      const timer = setTimeout(() => {
        closeToast();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, progressBar]);

  const closeToast = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsVisible(false);
      onClose();
    });
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const getIconSource = iconName => {
    switch (iconName) {
      case 'warningIcon':
        return require('../../assets/newIcons/warningIcon.png');
      case 'cautionIcon':
        return require('../../assets/newIcons/cautionIcon.png');
      case 'successIcon':
        return require('../../assets/newIcons/successIcon.png');
      case 'otherIcon':
        return require('../../assets/newIcons/otherIcon.png');
      default:
        return null;
    }
  };

  if (!isVisible) return null;

  return (
    <Animated.View style={[styles.container, {opacity: fadeAnim}]}>
      {leftIcon && (
        <Image source={getIconSource(leftIcon)} style={styles.leftIcon} />
      )}
      <Text style={styles.message}>{message}</Text>
      {closeButton && (
        <TouchableOpacity onPress={closeToast} style={styles.closeButton}>
          <Image source={greenCloseIcon} style={styles.closeIcon} />
        </TouchableOpacity>
      )}
      {progressBar && (
        <View style={styles.progressBarContainer}>
          <Animated.View style={[styles.progressBar, {width: progressWidth}]} />
        </View>
      )}
    </Animated.View>
  );
};

export default CommunityActionToast;

const greenCloseIcon = require('../../assets/icons/greenCloseIcon.png');

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#212529',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    zIndex: 9999,
    overflow: 'hidden',
    marginBottom: 8,
  },
  leftIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  message: {
    color: '#FEFFFE',
    fontSize: 16,
    flex: 1,
    paddingBottom: 4,
  },
  closeButton: {
    marginLeft: 8,
  },
  closeIcon: {
    width: 24,
    height: 24,
  },
  progressBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#9CDECB',
  },
});
