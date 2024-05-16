import React, {useState, useContext, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ScrollView,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';

import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {useNavigation} from '@react-navigation/native';
import CommunityHeader from '../../components/Community/CommunityHeader';
import BottomSheetModal from '../../components/Community/BottomSheetModal';
import CommunityActionToast from '../../components/Community/CommunityActionToast';
import CommunityActionModal from '../../components/Community/CommunityActionModal';
import {
  WarningIcon,
  CautionIcon,
  CameraIcon,
  ImageIcon,
} from '../../assets/assets';

const CommunityEditPost = ({route}) => {
  const navigation = useNavigation();
  const [selectedImages, setSelectedImages] = useState({
    existingImages: [], // 기존 이미지 URL 배열
    newImages: [], // 새로 선택한 이미지 배열
  });
  const [isUploading, setIsUploading] = useState(false); // 업로드 상태
  const [uploadProgress, setUploadProgress] = useState(0); // 업로드 진행률
  const [postContent, setPostContent] = useState(null); // 게시글 내용
  const [postContentLength, setPostContentLength] = useState(0); // 게시글 내용 길이
  const maxPostContentLength = 500; // 최대 게시글 내용 길이
  const [isImagePickerModalVisible, setIsImagePickerModalVisible] =
    useState(false); // 이미지 선택 모달의 가시성을 담당
  const [currentUser, setCurrentUser] = useState(null);
  const [postId, setPostId] = useState(null); // 수정할 게시글의 ID

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState({
    title: '',
    modalText: '',
    iconSource: null,
    showConfirmButton: false,
    onConfirm: null,
    onCancel: null,
  });
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState({
    message: '',
    leftIcon: '',
    closeButton: true,
    progressBar: true,
  });

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // 수정할 게시글의 ID를 route params에서 가져옴
    const {postId} = route.params;
    setPostId(postId);
    console.log('Fetching post with ID:', postId); // 로그 찍자...

    // Firestore에서 해당 게시글의 데이터를 가져와서 state에 저장
    const fetchPost = async () => {
      try {
        const postDoc = await firestore().collection('posts').doc(postId).get();
        console.log('Post document:', postDoc);
        if (postDoc.exists) {
          const postData = postDoc.data();
          console.log('Post data:', postData);
          setPostContent(postData.post_content);
          setSelectedImages({
            existingImages: postData.post_files,
            newImages: [],
          });
        }
      } catch (error) {
        console.log('게시글 데이터를 가져오는 중 오류 발생:', error);
      }
    };

    fetchPost();
  }, [route.params]);

  // 게시글 수정 핸들러
  const handlePostUpdate = useCallback(async () => {
    if (postContent && postContent.trim() !== '') {
      try {
        // 새로 추가된 이미지 업로드
        const newImageUrls = await Promise.all(
          selectedImages.newImages.map(image => uploadImage(image)),
        );

        // Firestore에서 게시글 업데이트
        await firestore()
          .collection('posts')
          .doc(postId)
          .update({
            post_content: postContent,
            post_files: [...selectedImages.existingImages, ...newImageUrls],
          });

          console.log('게시글 수정 완료!');
          setToastMessage({
            message: '성공적으로 게시글이 수정되었습니다!',
            leftIcon: 'successIcon',
            closeButton: true,
            progressBar: true,
          });
          setToastVisible(true);
    
          navigation.navigate(route.params?.prevScreen || 'CommunityBoard', {
            updatedPost: {
              id: postId,
              post_content: postContent,
              post_files: [...selectedImages.existingImages, ...newImageUrls],
            },
            sendToastMessage: '성공적으로 게시글이 수정됐습니다!',
          });
        } catch (error) {
        console.log('게시글을 수정하는 중 오류 발생:', error);
      }
    } else {
      setToastMessage({
        message: '게시글 내용을 입력해주세요.',
        leftIcon: 'CautionIcon',
        closeButton: true,
        progressBar: true,
      });
      setToastVisible(true);
    }
  }, [postContent, selectedImages, postId, navigation]);

  // 이미지 업로드 함수
  const uploadImage = async image => {
    const uploadUri = image;
    let filename = uploadUri.substring(uploadUri.lastIndexOf('/') + 1);

    const extension = filename.split('.').pop();
    const name = filename.split('.').slice(0, -1).join('.');
    filename = name + Date.now() + '.' + extension;

    setIsUploading(true);
    setUploadProgress(0);

    const storageRef = storage().ref(`post_files/${filename}`);
    const task = storageRef.putFile(uploadUri);

    task.on('state_changed', taskSnapshot => {
      console.log(
        `${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`,
      );

      setUploadProgress(
        Math.round(taskSnapshot.bytesTransferred / taskSnapshot.totalBytes) *
          100,
      );
    });

    try {
      await task;

      const downloadURL = await storageRef.getDownloadURL();

      setIsUploading(false);

      return downloadURL;
    } catch (error) {
      console.log(error);
      setIsUploading(false);
      setModalMessage({
        title: '이미지 업로드 실패',
        modalText: '이미지 업로드 중 오류가 발생했습니다.',
        iconSource: WarningIcon,
        showConfirmButton: true,
        onConfirm: () => {
          setModalVisible(false);
        },
      });
      setModalVisible(true);
      return null;
    }
  };

  // 게시글 내용 변경 핸들러
  const handlePostContentChange = text => {
    if (text.length <= maxPostContentLength) {
      setPostContent(text);
      setPostContentLength(text.length);
    }
  };

  //이미지 삭제 함수
  const removeImage = image => {
    setSelectedImages(prevState => ({
      existingImages: prevState.existingImages.filter(img => img !== image),
      newImages: prevState.newImages.filter(img => img !== image),
    }));
  };

  // 이미지 선택기 열기
  const openImagePicker = () => {
    setIsImagePickerModalVisible(true);
  };

  // 카메라로 사진 촬영
  const takePhotoFromCamera = () => {
    if (
      selectedImages.existingImages.length + selectedImages.newImages.length >=
      7
    ) {
      setModalMessage({
        title: '이미지 업로드 제한',
        modalText: '최대 7장까지 이미지를 업로드할 수 있습니다.',
        iconSource: CautionIcon,
        showConfirmButton: true,
        onConfirm: () => {
          setModalVisible(false);
        },
      });
      setModalVisible(true);
      return;
    }
    ImagePicker.openCamera({
      width: 900,
      height: 900,
      cropping: true,
    })
      .then(image => {
        console.log(image);
        const imageUri = Platform.OS === 'ios' ? image.sourceURL : image.path;
        setSelectedImages(prevState => ({
          ...prevState,
          newImages: [...prevState.newImages, imageUri],
        }));
        setIsImagePickerModalVisible(false);
      })
      .catch(error => {
        console.log(error);
      });
  };

  // 갤러리에서 사진 선택
  const choosePhotoFromLibrary = () => {
    if (
      selectedImages.existingImages.length + selectedImages.newImages.length >=
      7
    ) {
      setModalMessage({
        title: '이미지 업로드 제한',
        modalText: '최대 7장까지 이미지를 업로드할 수 있습니다.',
        iconSource: CautionIcon,
        showConfirmButton: true,
        onConfirm: () => {
          setModalVisible(false);
        },
      });
      setModalVisible(true);
      return;
    }
    ImagePicker.openPicker({
      width: 900,
      height: 900,
      cropping: true,
    })
      .then(image => {
        console.log(image);
        const imageUri = Platform.OS === 'ios' ? image.sourceURL : image.path;
        setSelectedImages(prevState => ({
          ...prevState,
          newImages: [...prevState.newImages, imageUri],
        }));
        setIsImagePickerModalVisible(false);
      })
      .catch(error => {
        console.log(error);
      });
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#FEFFFE'}}>
      <CommunityHeader
        onPressRightText={handlePostUpdate}
        rightText={'등록'}
        title={'기존 게시글'}
      />
      <View style={styles.container}>
        <View style={styles.contentWrapper}>
          <View style={styles.postInputContainer}>
            <Text style={styles.postInputLabel}>내용</Text>
            <TextInput
              placeholder="여기에 작성"
              multiline
              numberOfLines={4}
              value={postContent}
              onChangeText={handlePostContentChange}
              maxLength={maxPostContentLength}
              autoCorrect={false}
              style={styles.postInputField}
            />
            {isUploading ? (
              <View style={styles.uploadStatusWrapper}>
                <Text>{uploadProgress} % 업로드 진행</Text>
                <ActivityIndicator size="large" color="#0000ff" />
              </View>
            ) : (
              <View />
            )}
          </View>
          <Text style={styles.postLengthText}>
            {postContentLength}/{maxPostContentLength}
          </Text>
          <View style={styles.imageUploadContainer}>
            <View style={styles.imageUploadButtonRow}>
              <TouchableOpacity
                style={styles.imageUploadButton}
                onPress={openImagePicker}>
                <Image source={CameraIcon} style={{width: 24, height: 24}} />
                <Text style={styles.imageUploadButtonText}>
                  {selectedImages.existingImages.length +
                    selectedImages.newImages.length}
                </Text>
              </TouchableOpacity>
              <ScrollView horizontal>
                {[...selectedImages.existingImages, ...selectedImages.newImages]
                  .slice(0, 3)
                  .map((image, index) => (
                    <View key={index} style={styles.imageThumbnailContainer}>
                      <Image
                        source={{uri: image}}
                        style={styles.imageThumbnail}
                      />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => removeImage(image)}>
                        <Text style={styles.removeImageButtonText}>X</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
              </ScrollView>
            </View>
            <ScrollView>
              <View style={styles.imageGrid}>
                {[...selectedImages.existingImages, ...selectedImages.newImages]
                  .slice(3)
                  .map((image, index) => (
                    <View key={index} style={styles.imageThumbnailContainer}>
                      <Image
                        source={{uri: image}}
                        style={styles.imageThumbnail}
                      />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => removeImage(image)}>
                        <Text style={styles.removeImageButtonText}>X</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
              </View>
            </ScrollView>
          </View>
        </View>
        <BottomSheetModal
          isVisible={isImagePickerModalVisible}
          onClose={() => setIsImagePickerModalVisible(false)}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={takePhotoFromCamera}>
              <Image source={CameraIcon} style={{width: 24, height: 24}} />
              <Text style={styles.modalButtonText}>카메라로 촬영</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={choosePhotoFromLibrary}>
              <Image source={ImageIcon} style={{width: 24, height: 24}} />
              <Text style={styles.modalButtonText}>갤러리에서 선택</Text>
            </TouchableOpacity>
          </View>
        </BottomSheetModal>
      </View>
      <CommunityActionToast
        visible={toastVisible}
        message={toastMessage.message}
        duration={7000}
        onClose={() => setToastVisible(false)}
        leftIcon={toastMessage.leftIcon}
        closeButton={toastMessage.closeButton}
        progressBar={toastMessage.progressBar}
      />
      <CommunityActionModal
        isVisible={modalVisible}
        onConfirm={modalMessage.onConfirm}
        onCancel={modalMessage.onCancel}
        title={modalMessage.title}
        modalText={modalMessage.modalText}
        iconSource={modalMessage.iconSource}
        showConfirmButton={modalMessage.showConfirmButton}
      />
    </SafeAreaView>
  );
};

export default CommunityEditPost;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEFFFE',
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 48,
  },
  postInputContainer: {
    position: 'relative',
    width: '90%',
    borderStyle: 'solid',
    borderColor: '#07ac7d',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 8,
  },
  postInputLabel: {
    position: 'absolute',
    top: -10,
    left: 16,
    backgroundColor: '#FEFFFE',
    fontFamily: 'Pretendard',
    paddingHorizontal: 8,
    fontSize: 14,
    fontFamily: 'Pretendard',
    fontWeight: 'bold',
    color: '#07ac7d',
  },
  postInputField: {
    fontSize: 16,
    fontFamily: 'Pretendard',
    textAlignVertical: 'top',
    width: '100%',
    height: 250,
  },
  postLengthText: {
    alignSelf: 'flex-end',
    marginRight: 20,
    fontSize: 14,
    fontFamily: 'Pretendard',
    color: '#898989',
  },
  imageUploadContainer: {
    flex: 1,
    marginTop: 24,
  },
  imageUploadButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  imageUploadButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#07ac7d',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 6,
  },
  imageUploadButtonText: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: 'Pretendard',
    color: '#07ac7d',
  },
  imageThumbnailContainer: {
    position: 'relative',
    margin: 6,
  },
  imageThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 50,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageButtonText: {
    color: '#FEFFFE',
    fontSize: 12,
    fontWeight: 'bold',
  },
  imagePickerModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  imagePickerModalContent: {
    backgroundColor: '#FEFFFE',
    padding: 16,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  imagePickerModalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FEFFFE',
  },
  imagePickerModalButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Pretendard',
    color: '#898989',
  },
  imagePickerModalCloseButton: {
    backgroundColor: '#FEFFFE',
    padding: 16,
    alignItems: 'center',
  },
  imagePickerModalCloseButtonText: {
    fontSize: 16,
    fontFamily: 'Pretendard',
    color: '#212529',
  },
  uploadStatusWrapper: {
    alignItems: 'center',
    marginTop: 16,
  },
  modalContent: {
    padding: 16,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FEFFFE',
  },
  modalButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Pretendard',
    color: '#898989',
  },
  modalCloseButton: {
    backgroundColor: '#FEFFFE',
    padding: 16,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontFamily: 'Pretendard',
    color: '#212529',
  },
});
