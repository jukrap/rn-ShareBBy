import React, {useState, useContext, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
  Image,
  TouchableOpacity,
  Modal,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import {useNavigation, useRoute} from '@react-navigation/native';

import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

import PostHeader from '../../components/Community/PostHeader';

const CommunityAddPost = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const [selectedImages, setSelectedImages] = useState([]); // 선택된 이미지 배열
  const [isUploading, setIsUploading] = useState(false); // 업로드 상태
  const [uploadProgress, setUploadProgress] = useState(0); // 업로드 진행률
  const [postContent, setPostContent] = useState(null); // 게시글 내용
  const [postContentLength, setPostContentLength] = useState(0); // 게시글 내용 길이
  const maxPostContentLength = 500; // 최대 게시글 내용 길이
  const [isImagePickerModalVisible, setIsImagePickerModalVisible] =
    useState(false); // 이미지 선택 모달의 가시성을 담당
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (route.params?.action === 'submitPost') {
      if (postContent && postContent.trim() !== '') {
        submitPost(navigation);
      } else {
        Alert.alert('게시글 내용을 입력해주세요.');
        navigation.setParams({action: ''});
      }
    }
  }, [route.params, postContent, submitPost, navigation]);

  useEffect(() => {
    console.log('selectedImages updated:', selectedImages);
  }, [selectedImages]);

  // 게시글 제출 핸들러
  const handlePostSubmit = useCallback(() => {
    if (postContent && postContent.trim() !== '') {
      submitPost();
    } else {
      Alert.alert('게시글 내용을 입력해주세요.');
    }
  }, [postContent, submitPost]);

  // 게시글 제출 함수
  const submitPost = async () => {
    if (!postContent || postContent.trim() === '') {
      Alert.alert('게시글 내용을 입력해주세요.');
      return;
    }

    if (!currentUser) {
      console.log('사용자가 로그인되어 있지 않습니다.');
      return;
    }
    setIsUploading(true);

    try {
      // 선택된 이미지들 업로드 및 URL 배열 반환
      const imageUrls = await Promise.all(
        selectedImages.map(image => uploadImage(image)),
      );

      console.log('selectedImages: ', selectedImages);
      console.log('이미지 URLs: ', imageUrls);
      console.log('게시글 내용: ', postContent);

      // Firestore에 게시글 추가
      await firestore()
        .collection('posts')
        .add({
          userId: currentUser.uid,
          post_content: postContent,
          post_files: imageUrls,
          post_created: firestore.Timestamp.fromDate(new Date()),
          post_actflag: true,
        });

      console.log('게시글 업로드 완료!');
      Alert.alert('게시글 업로드!', '성공적으로 게시글이 업로드됐습니다!');
      setPostContent(null);
      setSelectedImages([]);
      navigation.goBack();
    } catch (error) {
      console.log(
        'Firestore에 게시물을 추가하는 중에 문제가 발생했습니다.',
        error,
      );
    }

    setIsUploading(false);
  };

  // 게시글 내용 변경 핸들러
  const handlePostContentChange = text => {
    if (text.length <= maxPostContentLength) {
      setPostContent(text);
      setPostContentLength(text.length);
    }
  };

  const removeImage = image => {
    setSelectedImages(selectedImages.filter(img => img !== image));
  };

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
      Alert.alert(
        '이미지 업로드 실패',
        '이미지 업로드 중 오류가 발생했습니다.',
      );
      return null;
    }
  };

  // 이미지 선택기 열기
  const openImagePicker = () => {
    setIsImagePickerModalVisible(true);
  };

  // 카메라로 사진 촬영
  const takePhotoFromCamera = () => {
    ImagePicker.openCamera({
      width: 1200,
      height: 780,
      cropping: true,
    })
      .then(image => {
        console.log(image);
        const imageUri = Platform.OS === 'ios' ? image.sourceURL : image.path;
        setSelectedImages([...selectedImages, imageUri]);
        setIsImagePickerModalVisible(false);
      })
      .catch(error => {
        console.log(error);
      });
  };

  // 갤러리에서 사진 선택
  const choosePhotoFromLibrary = () => {
    ImagePicker.openPicker({
      width: 1200,
      height: 780,
      cropping: true,
    })
      .then(image => {
        console.log('first input image : ' + image.path);
        const imageUri = Platform.OS === 'ios' ? image.sourceURL : image.path;
        console.log('imageUri1 = ', imageUri);
        setSelectedImages(prevSelectedImages => [...prevSelectedImages, imageUri]);
        //ㅅㅂ 이거 뭐야
        //이 구조로 setSelectedImages에 imageUri이 안들어갈 수 있나?
        //심지어 imageUri에는 파일이 있는데도?
        console.log('imageUri2 = ', imageUri);
        console.log('selectedImages = ', selectedImages);
        setIsImagePickerModalVisible(false);
      })
      .catch(error => {
        console.log(error);
      });
  };

  return (
    <View style={styles.container}>
      <PostHeader onSubmit={handlePostSubmit} />
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
          <TouchableOpacity
            style={styles.imageUploadButton}
            onPress={openImagePicker}>
            <Image source={cameraIcon} style={{width: 24, height: 24}} />
            <Text style={styles.imageUploadButtonText}>
              {selectedImages.length}
            </Text>
          </TouchableOpacity>
          {selectedImages.map((image, index) => (
            <View key={index} style={styles.imageThumbnailContainer}>
              <Image source={{uri: image}} style={styles.imageThumbnail} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => removeImage(image)}>
                <Text style={styles.removeImageButtonText}>X</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
      <Modal
        visible={isImagePickerModalVisible}
        animationType="slide"
        transparent={true}>
        <View style={styles.imagePickerModalContainer}>
          <View style={styles.imagePickerModalContent}>
            <TouchableOpacity
              style={styles.imagePickerModalButton}
              onPress={takePhotoFromCamera}>
              <Image source={cameraIcon} style={{width: 24, height: 24}} />
              <Text style={styles.imagePickerModalButtonText}>
                카메라로 촬영
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.imagePickerModalButton}
              onPress={choosePhotoFromLibrary}>
              <Image source={pictureIcon} style={{width: 24, height: 24}} />
              <Text style={styles.imagePickerModalButtonText}>
                갤러리에서 선택
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.imagePickerModalCloseButton}
            onPress={() => setIsImagePickerModalVisible(false)}>
            <Text style={styles.imagePickerModalCloseButtonText}>닫기</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default CommunityAddPost;

const cameraIcon = require('../../assets/icons/cameraIcon.png');
const pictureIcon = require('../../assets/icons/pictureIcon.png');

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
    fontWeight: 'bold',
    color: '#07ac7d',
  },
  postInputField: {
    fontSize: 16,
    textAlignVertical: 'top',
    width: '100%',
    height: 250,
  },
  postLengthText: {
    alignSelf: 'flex-end',
    marginRight: 20,
    fontSize: 14,
    color: '#898989',
  },
  imageUploadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
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
    marginRight: 16,
  },
  imageUploadButtonText: {
    marginTop: 8,
    fontSize: 14,
    color: '#07ac7d',
  },
  imageThumbnailContainer: {
    position: 'relative',
    marginRight: 8,
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
    color: '#898989',
  },
  imagePickerModalCloseButton: {
    backgroundColor: '#FEFFFE',
    padding: 16,
    alignItems: 'center',
  },
  imagePickerModalCloseButtonText: {
    fontSize: 16,
    color: '#212529',
  },
  uploadStatusWrapper: {
    alignItems: 'center',
    marginTop: 16,
  },
});
