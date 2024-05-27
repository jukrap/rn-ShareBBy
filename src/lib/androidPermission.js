import {PermissionsAndroid} from 'react-native';

export const requestCameraPermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: '카메라 권한 요청',
        message: '게시물 업로드를 위해 카메라 접근 권한이 필요합니다.',
        buttonNeutral: '나중에 묻기',
        buttonNegative: '거부',
        buttonPositive: '허용',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('카메라 접근 권한이 부여됨');
      return true;
    } else {
      console.log('카메라 접근 권한이 거부됨');
      return false;
    }
  } catch (err) {
    console.warn(err);
    return false;
  }
};

export const requestExternalWritePermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: '저장소 쓰기 권한 요청',
        message: '게시물 업로드를 위해 저장소 쓰기 권한이 필요합니다.',
        buttonNeutral: '나중에 묻기',
        buttonNegative: '거부',
        buttonPositive: '허용',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('외부 쓰기 권한이 부여됨');
      return true;
    } else {
      console.log('외부 쓰기 권한이 거부됨');
      return false;
    }
  } catch (err) {
    console.warn(err);
    return false;
  }
};
