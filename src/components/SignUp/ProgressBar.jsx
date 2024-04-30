import React from 'react';
import {View, StyleSheet} from 'react-native';

const ProgressBar = ({percentage}) => {
  return (
    <View style={styles.container}>
      <View style={[styles.progressBar, {width: `${percentage}%`}]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', // 가로 방향으로 배치
    height: 10, // 높이 10
    backgroundColor: 'lightgray', // 배경색 회색
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 32,
  },
  progressBar: {
    height: '100%', // 높이를 100%로 설정하여 전체 높이를 차지
    backgroundColor: '#07AC7D', // 진행 바의 색상
    borderRadius: 5, // 모서리를 둥글게 만듦
  },
});

export default ProgressBar;
