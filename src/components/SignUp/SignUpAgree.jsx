import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

import CheckBox from './CheckBox';

const SignUpAgree = ({onNextStep}) => {
  const {width, height} = Dimensions.get('window');
  const [isNextEnabled, setIsNextEnabled] = useState(false);
  const [checkboxState, setCheckboxState] = useState({});

  // CheckBox 컴포넌트에서 필수 항목 체크 여부를 확인하여 버튼의 활성/비활성 상태를 결정
  const handleCheckBoxChange = isChecked => {
    const isRequiredChecked =
      isChecked.isChecked2 && isChecked.isChecked3 && isChecked.isChecked4;
    setIsNextEnabled(isRequiredChecked);
    setCheckboxState(isChecked); // 체크박스 상태 저장
  };

  const handleNextStep = () => {
    console.log('checkboxState:', checkboxState); // 체크박스 상태를 콘솔에 출력
    onNextStep({checkboxState}); // 체크박스 상태를 다음 단계로 전달
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.secondContainer}>
        <View>
          <View>
            <View style={styles.textContainer}>
              <Text style={styles.text}>ShareBBy 서비스 이용약관에</Text>
              <Text style={styles.secondText}>동의해주세요.</Text>
            </View>
          </View>

          <View style={styles.checkboxContainer}>
            <CheckBox onChange={handleCheckBoxChange} />
          </View>
        </View>

        <View>
          <TouchableOpacity
            style={[
              styles.button,
              {backgroundColor: isNextEnabled ? '#07AC7D' : '#A7A7A7'}, // isNextEnabled 값에 따라 배경색 변경
            ]}
            onPress={handleNextStep} // 체크박스 상태를 다음 단계로 전달
            disabled={!isNextEnabled}>
            <Text style={styles.buttonText}>
              다음으로
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  secondContainer: {
    justifyContent: 'space-between', flex: 1
  },
  textContainer: {
    marginTop: 40,
    marginLeft: 16,
    marginBottom: 56,
  },
  text: {
    color: '#07AC7D',
    fontWeight: 'bold',
    fontSize: 24,
  },
  secondText: {
    color: '#07AC7D',
    fontWeight: 'bold',
    fontSize: 24,
  },
  checkboxContainer: {
    flexDirection: 'row', alignItems: 'center'
  },
  button: {
    borderRadius: 10,
    backgroundColor: '#07AC7D',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 16,
    marginBottom: 36,
    height: 50,
  },
  buttonText: {
    color: '#fff', fontSize: 16, fontWeight: 'bold'
  }
});

export default SignUpAgree;
