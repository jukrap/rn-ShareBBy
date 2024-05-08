import React, {useState} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';

const {width, height} = Dimensions.get('window');

const Tobbar = ({navigation, route, leftFunc, rightFunc, onPressRight}) => {
  const {
    address,
    detailAddress,
    showTag,
    deadLine,
    latitude,
    longitude,
    peopleCount,
  } = route;
  // const allInfo = route;

  return (
    <SafeAreaView style={{backgroundColor: '#FEFFFE'}}>
      <View style={styles.topbarView}>
        <View style={styles.commonRate}>
          <TouchableOpacity
            onPress={() => {
              navigation.goBack();
            }}
            style={[styles.commonRate, {gap: 10}]}>
            {leftFunc ? (
              <Text style={styles.topText}>{leftFunc}</Text>
            ) : (
              <Image source={backIcon} style={{width: 28, height: 28}} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onPressRight}
            style={[styles.commonRate, {gap: 10}]}>
            <Text style={styles.topText}>{rightFunc}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const backIcon = require('../../assets/icons/backIcon.png');

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
    borderBottomWidth: 1,
    borderBottomColor: '#DBDBDB',
  },
  topText: {
    color: '#07AC7D',
    fontFamily: 'Pretendard',
    fontSize: 18,
    fontWeight: 400,
  },
});

export default Tobbar;
