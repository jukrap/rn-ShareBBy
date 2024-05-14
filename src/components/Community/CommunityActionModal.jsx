import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';
import Modal from 'react-native-modal';

//onConfirm = Confirm에 해당하는 버튼 눌렀을 때 작동할 것
//onCancel = Cancel에 해당하는 버튼 눌렀을 때 작동할 것
//title = 모달 상단 타이틀
//modalText = 모달 내용(텍스트)
//iconSource = 타이틀 위에 올 아이콘 혹은 이미지
//confirmText = confirm 버튼의 텍스트 수정 (안 적을 경우, 예)
//cancelText = cancel 버튼의 텍스트 수정 (안 적을 경우, 아니요)
//showConfirmButton = true로 만들 경우 예, 아니오 식의 버튼 2개가 아닌 '확인' 버튼 1개로 하단의 버튼들이 변함
const CommunityActionModal = ({
  isVisible,
  onConfirm,
  onCancel,
  title,
  modalText,
  iconSource,
  confirmText,
  cancelText,
  showConfirmButton,
}) => {
  return (
    <Modal
      isVisible={isVisible}
      animationIn="bounceIn"
      animationOut="bounceOut"
      animationInTiming={300}
      animationOutTiming={300}
      backdropColor="#212529"
      backdropOpacity={0.5}
      onBackButtonPress={onCancel}
      onBackdropPress={onCancel}>
      <View style={styles.modalContent}>
        {iconSource && (
          <Image
            source={iconSource}
            style={styles.modalIcon}
            resizeMode="contain"
          />
        )}
        {title && <Text style={styles.modalTitle}>{title}</Text>}
        <Text style={styles.modalText}>{modalText}</Text>
        {!showConfirmButton ? (
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              activeOpacity={0.6}
              style={[styles.modalButton, styles.confirmButton]}
              onPress={onConfirm}>
              <Text style={styles.modalButtonTextConfirm}>
                {confirmText || '예'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.6}
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onCancel}>
              <Text style={styles.modalButtonTextCancel}>
                {cancelText || '아니요'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.confirmButtonContainer}>
            <TouchableOpacity
              activeOpacity={0.6}
              style={styles.singleConfirmButton}
              onPress={onConfirm}>
              <Text style={styles.singleConfirmButtonText}>확인</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

export default CommunityActionModal;

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: '#FEFFFE',
    borderRadius: 10,
    padding: 20,
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
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    color: '#212529',
    fontFamily: 'Pretendard',
    textAlign: 'center',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#07AC7D',
  },
  cancelButton: {
    backgroundColor: '#DBDBDB',
  },
  modalButtonTextConfirm: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Pretendard',
    color: '#FEFFFE',
  },
  modalButtonTextCancel: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Pretendard',
    color: '#212529',
  },
  confirmButtonContainer: {
    alignItems: 'flex-end',
    width: '100%',
    marginTop: 8,
  },
  singleConfirmButton: {
    paddingBottom: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#FEFFFE',
  },
  singleConfirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Pretendard',
    color: '#07AC7D',
  },
});
