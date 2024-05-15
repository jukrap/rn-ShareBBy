import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';
import Modal from 'react-native-modal';
import {
  SortIcon,
  OnCheck,
} from '../../assets/assets';

const SortModal = ({isVisible, onClose, selectedOption, options, onSelect}) => {
  return (
    <Modal
      isVisible={isVisible}
      animationIn="bounceIn"
      animationOut="bounceOut"
      animationInTiming={300}
      animationOutTiming={300}
      backdropColor="#212529"
      backdropOpacity={0.5}
      onBackButtonPress={onClose}
      onBackdropPress={onClose}>
      <View style={styles.modalContent}>
        <Image
          source={SortIcon}
          style={styles.modalIcon}
          resizeMode="contain"
        />
        <Text style={styles.modalTitle}>정렬 옵션</Text>
        {options.map(option => (
          <TouchableOpacity
            key={option}
            style={styles.modalOption}
            onPress={() => onSelect(option)}>
            <Text
              style={[
                styles.modalOptionText,
                selectedOption === option && styles.selectedOptionText,
              ]}>
              {option}
            </Text>
            {selectedOption === option && (
              <Image source={OnCheck} style={styles.checkIcon} />
            )}
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          activeOpacity={0.6}
          style={styles.confirmButton}
          onPress={onClose}>
          <Text style={styles.confirmButtonText}>확인</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default SortModal;

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: '#FEFFFE',
    borderRadius: 10,
    padding: 20,
    margin: 64,
    alignItems: 'center',
  },
  modalIcon: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 20,
    color: '#07AC7D',
    fontFamily: 'Pretendard',
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    width: '100%',
  },
  modalOptionText: {
    fontSize: 18,
    fontFamily: 'Pretendard',
  },
  selectedOptionText: {
    fontWeight: 'bold',
    color: '#07AC7D',
  },
  checkIcon: {
    width: 24,
    height: 24,
  },
  confirmButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#07AC7D',
    marginTop: 20,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Pretendard',
    color: '#FEFFFE',
  },
});
