import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';

import CheckBox from './CheckBox';

const SignUpAgree = ({onNextStep, navigation}) => {
  const [isNextEnabled, setIsNextEnabled] = useState(false);
  const [checkboxState, setCheckboxState] = useState({});

  const handleCheckBoxChange = isChecked => {
    const isRequiredChecked =
      isChecked.isChecked2 && isChecked.isChecked3 && isChecked.isChecked4;
    setIsNextEnabled(isRequiredChecked);
    setCheckboxState(isChecked);
  };

  const handleNextStep = () => {
    onNextStep({checkboxState});
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
            <CheckBox navigation={navigation} onChange={handleCheckBoxChange} />
          </View>
        </View>

        <View>
          <TouchableOpacity
            style={[
              styles.button,
              {backgroundColor: isNextEnabled ? '#07AC7D' : '#A7A7A7'},
            ]}
            onPress={handleNextStep}
            disabled={!isNextEnabled}>
            <Text style={styles.buttonText}>다음으로</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  secondContainer: {
    justifyContent: 'space-between',
    flex: 1,
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    borderRadius: 10,
    backgroundColor: '#07AC7D',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 16,
    marginBottom: 36,
    height: 55,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SignUpAgree;
