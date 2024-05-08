import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

const PostDetailHeader = ({}) => {
  const navigation = useNavigation();

  // 뒤로 가기 버튼 클릭 시 호출되는 함수
  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.topbarView}>
      <View style={styles.commonRate}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Image source={backColorIcon} style={{width: 28, height: 28}} />
          <Text style={styles.backButtonText}>상세보기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const backColorIcon = require('../../assets/icons/backColorIcon.png');

export default PostDetailHeader;

const styles = StyleSheet.create({
  commonRate: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  topbarView: {
    height: 44,
    paddingHorizontal: 24,
    paddingVertical: 5,
    backgroundColor: '#FEFFFE',
    borderBottomWidth: 1,
    borderBottomColor: '#DBDBDB',
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
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fefffe',
  },
  backButtonText: {
    color: '#07AC7D',
    fontFamily: 'Pretendard',
    fontSize: 18,
    fontWeight: 400,
  },
});
