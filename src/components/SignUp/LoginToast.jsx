import React, {useCallback, useEffect, useRef} from 'react';
import {StyleSheet, View, Animated, Text} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const LoginToast = ({text, visible, handleCancel, duration}) => {
  const toastValue = useRef(new Animated.Value(0)).current;
  const {bottom} = useSafeAreaInsets();

  const toastAnimated = useCallback(() => {
    // handleCancel();
    toastValue.setValue(0);
    Animated.spring(toastValue, {
      toValue: 1,
      useNativeDriver: true,
      delay: 100,
    }).start(({finished}) => {
      if (finished) {
        handleCancel();
        Animated.timing(toastValue, {
          toValue: 0,
          useNativeDriver: true,
          duration: 150,
          delay: duration || 1000,
        }).start();
      }
    });
  }, [duration]);

  useEffect(() => {
    if (visible) toastAnimated();
  }, [toastAnimated, visible]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.toast,
        {
          opacity: toastValue,
          transform: [
            {
              translateY: toastValue.interpolate({
                inputRange: [0, 1],
                outputRange: [-(bottom + 75), -(bottom + 80)],
              }),
            },
            {
              scale: toastValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1],
              }),
            },
          ],
        },
      ]}>
      <View style={styles.toastContents}>
        <Text style={styles.toastText}>{text}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    top: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toastContents: {
    justifyContent: 'center',
    height: 39,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#07AC7D',
  },
  toastText: {
    color: '#fff',
  },
});

export default LoginToast;
