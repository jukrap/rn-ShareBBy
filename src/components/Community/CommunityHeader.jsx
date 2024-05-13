import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

const CommunityHeader = ({
  leftText,
  rightText,
  onPressRightText,
  rightIcon,
  onPressRightIcon,
  leftIcon,
  onPressLeftIcon,
  title,
  currentPage,
  showBackButton = true,
  centerComponent,
}) => {
  const navigation = useNavigation();

  // 뒤로 가기 버튼 클릭 시 호출되는 함수
  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#FEFFFE'}}>
      <View style={styles.topbarView}>
        <View style={styles.leftButtonContainer}>
          {showBackButton && (
            <TouchableOpacity onPress={handleGoBack} style={styles.leftButton}>
              <Image source={backIcon} style={{width: 20, height: 20}} />
            </TouchableOpacity>
          )}
          {leftIcon && (
            <TouchableOpacity
              onPress={onPressLeftIcon}
              style={styles.leftIconButton}>
              <Image source={leftIcon} style={{width: 20, height: 20}} />
            </TouchableOpacity>
          )}
          {currentPage && (
            <Text style={styles.currentPageText}>{currentPage}</Text>
          )}
        </View>
        <View style={styles.titleContainer}>
          {centerComponent ? (
            centerComponent
          ) : (
            <Text style={styles.title}>{title}</Text>
          )}
        </View>
        <View style={styles.rightButtonContainer}>
          {rightIcon && (
            <TouchableOpacity
              onPress={onPressRightIcon}
              style={styles.rightIconButton}>
              <Image source={rightIcon} style={{width: 20, height: 20}} />
            </TouchableOpacity>
          )}
          {rightText && (
            <TouchableOpacity
              onPress={onPressRightText}
              style={styles.rightButton}>
              <Text style={styles.topText}>{rightText}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CommunityHeader;

const backIcon = require('../../assets/icons/backIcon.png');

const styles = StyleSheet.create({
  topbarView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 44,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#DBDBDB',
  },
  leftButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftButton: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginRight: 8,
  },
  leftIconButton: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginRight: 8,
  },
  currentPageText: {
    fontFamily: 'Pretendard',
    fontSize: 16,
    paddingLeft: 4,
    color: '#07AC7D',
  },
  titleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -1,
  },
  rightButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightButton: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  rightIconButton: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  title: {
    fontWeight: '800',
    fontSize: 17,
    fontFamily: 'Pretendard',
    color: '#07AC7D',
  },
  topText: {
    color: '#07AC7D',
    fontFamily: 'Pretendard',
    fontSize: 16,
    fontWeight: '600',
    paddingRight: 6,
  },
});
