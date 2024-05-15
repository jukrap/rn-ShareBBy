import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Image,
  Text,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {
  OnCheckBox,
  OffCheckBox,
  OnCheckIcon,
  OffCheckIcon,
} from '../../assets/assets';
// const OnCheckBox = require('../../assets/newIcons/onCheckBox.png');
// const OffCheckBox = require('../../assets/newIcons/offCheckBox.png');
// const onCheckIcon = require('../../assets/newIcons/onCheck.png');
// const offCheckIcon = require('../../assets/newIcons/offCheck.png');

const CheckBox = ({onChange}) => {
  const navigation = useNavigation();
  const [checkboxes, setCheckboxes] = useState({
    isChecked1: false,
    isChecked2: false,
    isChecked3: false,
    isChecked4: false,
    isChecked5: false,
  });

  // 체크 상태를 토글하는 함수
  const toggleCheckBox = checkboxName => {
    setCheckboxes({
      ...checkboxes,
      [checkboxName]: !checkboxes[checkboxName],
    });
  };

  useEffect(() => {
    onChange && onChange(checkboxes); // 상위 컴포넌트에 체크박스 상태 전달
  }, [checkboxes, onChange]);

  // 모두 동의하기 체크박스의 상태를 변경하는 함수
  const toggleAllCheckboxes = () => {
    const allChecked = Object.values(checkboxes).every(checked => checked);
    const updatedCheckboxes = {};
    for (const key in checkboxes) {
      updatedCheckboxes[key] = !allChecked;
    }
    setCheckboxes(updatedCheckboxes);
  };

  return (
    <View style={{flex: 1}}>
      <TouchableWithoutFeedback onPress={toggleAllCheckboxes}>
        <View style={styles.container}>
          {Object.values(checkboxes).every(checked => checked) ? (
            <Image source={OnCheckBox} />
          ) : (
            <Image source={OffCheckBox} />
          )}
          <Text style={styles.text}>모두 동의(선택 정보 포함)</Text>
        </View>
      </TouchableWithoutFeedback>

      <View style={styles.bar} />

      <TouchableWithoutFeedback onPress={() => toggleCheckBox('isChecked2')}>
        <View style={styles.container}>
          {checkboxes.isChecked2 ? (
            <Image source={OnCheckIcon} />
          ) : (
            <Image source={OffCheckIcon} />
          )}
          <Text style={styles.text2}>[필수] 만 14세 이상</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('TeenagerAgree')}
            style={{flex: 1, alignItems: 'flex-end'}}>
            <Text style={{color: '#a7a7a7'}}>청소년 보호정책</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
      <TouchableWithoutFeedback onPress={() => toggleCheckBox('isChecked3')}>
        <View style={styles.container}>
          {checkboxes.isChecked3 ? (
            <Image source={OnCheckIcon} />
          ) : (
            <Image source={OffCheckIcon} />
          )}
          <Text style={styles.text2}>[필수] 이용약관 동의</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('ServiceAgree')}
            style={{flex: 1, alignItems: 'flex-end'}}>
            <Text style={{color: '#a7a7a7'}}>보기</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
      <TouchableWithoutFeedback onPress={() => toggleCheckBox('isChecked4')}>
        <View style={styles.container}>
          {checkboxes.isChecked4 ? (
            <Image source={OnCheckIcon} />
          ) : (
            <Image source={OffCheckIcon} />
          )}
          <Text style={styles.text2}>[필수] 개인정보 처리 방침 동의</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('InformationAgree')}
            style={{flex: 1, alignItems: 'flex-end'}}>
            <Text style={{color: '#a7a7a7'}}>보기</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
      <TouchableWithoutFeedback onPress={() => toggleCheckBox('isChecked5')}>
        <View style={styles.container}>
          {checkboxes.isChecked5 ? (
            <Image source={OnCheckIcon} />
          ) : (
            <Image source={OffCheckIcon} />
          )}
          <Text style={styles.text2}>
            [선택] 광고성 정보 수신 및 마케팅 활용 동의
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('MarketingAgree')}
            style={{flex: 1, alignItems: 'flex-end'}}>
            <Text style={{color: '#a7a7a7'}}>보기</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 24,
    gap: 16,
  },
  text: {
    fontSize: 16,
    color: '#212529',
    fontWeight: 'bold',
  },
  bar: {
    borderWidth: 1,
    marginHorizontal: 16,
    borderColor: '#212529',
    marginBottom: 24,
  },
  text2: {
    fontSize: 16,
    color: '#a7a7a7',
    fontWeight: 'bold',
  },
});

export default CheckBox;
