import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
} from 'react-native';
import Postcode from '@actbase/react-daum-postcode';

const backIcon = require('../../assets/icons/back.png');

const SignUpAddressSelection = ({navigation}) => {
  const [showPostcode, setShowPostcode] = useState(true); // 우편번호 검색 창 보이기 여부를 true로 초기화

  // 우편번호 선택 콜백 함수
  const handleSelectPostcode = selectedAddress => {
    console.log('선택된 주소:', selectedAddress);
    setShowPostcode(true); // 선택된 주소를 받으면 우편번호 검색 창을 닫음
    navigation.navigate('SignUpAddress', {selectedAddress: selectedAddress});
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={styles.container}>
        <View style={{flexDirection: 'row'}}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image source={backIcon} />
          </TouchableOpacity>
          <Text style={styles.title}>주소 선택 화면</Text>
        </View>
        {/* 우편번호 검색 창 */}
        {showPostcode && (
          <Postcode
            style={{flex: 1, width: '100%', height: '100%'}}
            jsOptions={{animated: true}}
            onSelected={({roadAddress}) => handleSelectPostcode(roadAddress)} // 선택된 주소 콜백 함수
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,

    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default SignUpAddressSelection;
