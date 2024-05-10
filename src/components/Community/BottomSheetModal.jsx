import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Modal from 'react-native-modal';

const BottomSheetModal = ({isVisible, onClose, children}) => {
  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      style={styles.modalContainer}
      animationIn="slideInUp"
      animationOut="slideOutDown">
      <View style={styles.modalViewContainer}>
        <View style={styles.modalContent}>{children}</View>
        <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
          <Text style={styles.modalCloseButtonText}>닫기</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalViewContainer: {
    backgroundColor: 'white',
    paddingTop: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalContent: {
    paddingLeft: 8
  },
  modalCloseButton: {
    backgroundColor: '#FEFFFE',
    padding: 16,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 16,
    color: '#212529',
  },
});

export default BottomSheetModal;
