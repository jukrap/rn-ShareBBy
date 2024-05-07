import React from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';

const PostHeader = ({onSubmit}) => {
  const navigation = useNavigation();

  // 뒤로 가기 버튼 클릭 시 호출되는 함수
  const handleGoBack = () => {
    navigation.goBack();
  };

  // 등록 버튼 클릭 시 호출되는 함수
  const handleSubmit = () => {
    onSubmit();
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Image source={backColorIcon} style={{width: 24, height: 24}} />
        </TouchableOpacity>
      </View>
      <View style={styles.rightSection}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>등록</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const backColorIcon = require('../../assets/icons/backColorIcon.png');

export default PostHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fefffe',
    height: 60,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#d9d9d9',
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  backButton: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fefffe',
  },
  submitButton: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fefffe',
  },
  submitButtonText: {
    color: '#07AC7D',
    fontSize: 18,
  },
});
