import {useState} from 'react';
import {
  Text,
  View,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  TouchableHighlight,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import ImagePicker from 'react-native-image-crop-picker';
import storage from '@react-native-firebase/storage';
const leftArrow = require('../../assets/icons/back.png');
const EditProfile = ({navigation, route}) => {
  const [nickname, setNickname] = useState(route.params.nickname);
  const [editImage, setEditImage] = useState({
    IsEdit: false,
    ImageUrl: '',
  });
  const usersCollection = firestore().collection('users');

  const getPhotos = async () => {
    ImagePicker.openPicker({
      width: 300,
      height: 400,
      multiple: false,
    }).then(images => {
      // console.log('사진 업로드', images.sourceURL);
      setEditImage({
        IsEdit: true,
        ImageUrl: images.sourceURL,
      });
    });
  };
  const UploadImage = async uri => {
    const reference = storage().ref(
      `gs://sharebby-4d82f.appspot.com/${route.params.uuid}.png`,
    );
    await reference.putFile(
      Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
    );
    try {
      const userDocRef = await usersCollection.doc(route.params.uuid);

      await userDocRef.update({
        profileImage: `https://firebasestorage.googleapis.com/v0/b/sharebby-4d82f.appspot.com/o/gs%3A%2Fsharebby-4d82f.appspot.com%2F${route.params.uuid}.png?alt=media&token=92ecd5cd-c85c-4d52-ada9-948f13d362d7`,
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  const UpdateNickname = async () => {
    try {
      const userDocRef = await usersCollection.doc(route.params.uuid);

      await userDocRef.update({nickname: nickname});
    } catch (error) {
      console.log(error.message);
    }
  };

  const goHome = async () => {
    await navigation.reset({
      index: 0,
      routes: [{name: 'BottomTab', params: {screen: 'Profile'}}],
    });
  };
  return (
    <ScrollView style={styles.safeAreaViewStyle}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image style={styles.arrow} source={leftArrow} />
        </TouchableOpacity>
        <Text style={styles.headtext}>프로필 수정</Text>
      </View>

      <TouchableOpacity style={styles.ImageWrapper} onPress={() => getPhotos()}>
        <Image style={styles.image} source={{uri: route.params.profileImage}} />
      </TouchableOpacity>
      <View style={styles.editProfileWrapper}>
        <Text style={styles.myProfile}>내 정보</Text>
        <Text style={styles.name}>이름</Text>
        <TextInput
          onChangeText={setNickname}
          style={styles.nameBox}
          value={nickname}
        />

        <Text style={styles.address}>주소</Text>
        <View style={styles.addressBox}>
          <Text>{route.params.address}</Text>
        </View>

        <TouchableOpacity
          onPress={() => {
            UpdateNickname();
            if (editImage.IsEdit) {
              UploadImage(editImage.ImageUrl);
            }
            goHome();
          }}
          style={styles.submitBox}>
          <Text style={styles.sumbitText}>완료</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  safeAreaViewStyle: {
    flex: 1,
    backgroundColor: '#fefefe',
  },
  header: {
    marginTop: 60,
    flexDirection: 'row',
  },
  arrow: {width: 50, height: 50},
  headtext: {fontSize: 20, fontWeight: 'bold', marginTop: 13},
  ImageWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 50,
  },
  editProfileWrapper: {
    margin: 25,
  },
  myProfile: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#3f3f3f',
  },
  nameBox: {
    height: 40,
    marginTop: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#07AC7D',
    padding: 10,
  },
  address: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#3f3f3f',
  },
  addressBox: {
    height: 40,
    marginTop: 12,
    marginBottom: 12,
    borderWidth: 1,
    backgroundColor: '#DBDBDB',
    borderRadius: 10,
    borderColor: '#07AC7D',
    padding: 10,
  },
  submitBox: {
    backgroundColor: '#07AC7D',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    marginTop: 12,
    marginBottom: 12,
    borderRadius: 10,
  },
  sumbitText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
export default EditProfile;
