import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Modal} from 'react-native';

const LoginModal = ({
  visible,
  closeModal,
  message,
  message2,
  onConfirm,
  LeftButton,
  RightButton,
  animationType,
}) => {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType={animationType}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>{message}</Text>
          <Text>{message2}</Text>
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity style={styles.modalButton1} onPress={closeModal}>
              <Text style={styles.modalButtonText}>{LeftButton}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={onConfirm}>
              <Text style={styles.modalButtonText}>{RightButton}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    position: 'absolute',
    flex: 1,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  modalButton1: {
    backgroundColor: '#A7A7A7',
    paddingVertical: 10,
    width: 130,
    borderRadius: 5,
    alignItems: 'center',
  },
  modalButton: {
    backgroundColor: '#07AC7D',
    paddingVertical: 10,
    width: 130,
    borderRadius: 5,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default LoginModal;
