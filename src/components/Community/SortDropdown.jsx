import React, {useRef, useState} from 'react';
import {Animated, TouchableOpacity, Text, View, StyleSheet} from 'react-native';

const SortDropdown = ({selectedOption, options, onSelect}) => {
  const [isVisible, setIsVisible] = useState(false);
  const dropdownHeight = useRef(new Animated.Value(0)).current;

  const toggleDropdown = () => {
    const toValue = isVisible ? 0 : 150;
    Animated.timing(dropdownHeight, {
      toValue,
      duration: 200,
      useNativeDriver: false,
    }).start();
    setIsVisible(!isVisible);
  };

  const handleOptionSelect = option => {
    onSelect(option);
    toggleDropdown();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={toggleDropdown}>
        <Text style={styles.buttonText}>{selectedOption}</Text>
        <Text style={styles.buttonIcon}>{isVisible ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      <Animated.View style={[styles.dropdown, { height: dropdownHeight }]}>
        {options.map(option => (
          <TouchableOpacity
            key={option}
            style={styles.option}
            onPress={() => handleOptionSelect(option)}>
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginTop: 16,
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 4,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Pretendard',
  },
  buttonIcon: {
    marginLeft: 8,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'Pretendard',
  },
});

export default SortDropdown;
