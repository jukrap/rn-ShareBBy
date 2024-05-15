import {useState} from 'react';
import {
  Text,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import ImagePicker from 'react-native-image-crop-picker';
import storage from '@react-native-firebase/storage';
const leftArrow = require('../../assets/newIcons/backIcon.png');
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
    }).then(image => {
      // console.log('사진 업로드', images.sourceURL);
      // const imageUrl = image.path
      setEditImage({
        IsEdit: true,
        ImageUrl: image.sourceURL,
      });
    });
  };
  const UploadImage = async uri => {
    const reference = storage().ref(
      `gs://sharebbyteam.appspot.com/${route.params.uuid}.png`,
    );
    await reference.putFile(
      Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
    );
    try {
      const userDocRef = await usersCollection.doc(route.params.uuid);

      await userDocRef.update({
        profileImage: `https://firebasestorage.googleapis.com/v0/b/sharebbyteam.appspot.com/o/gs%3A%2Fsharebbyteam.appspot.com%2F${route.params.uuid}.png?alt=media&token=6e683a2e-273d-4bda-aedc-f135833642c8`,
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={1}
      style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image style={styles.arrow} source={leftArrow} />
        </TouchableOpacity>
        <Text style={styles.headtext}>프로필 수정</Text>
      </View>

      <View style={styles.userContainer}>
        <TouchableOpacity
          style={styles.ImageWrapper}
          onPress={() => getPhotos()}>
          <Image
            style={styles.image}
            source={{uri: editImage.ImageUrl || route.params.profileImage}}
          />
        </TouchableOpacity>
        <View style={styles.editProfileWrapper}>
          <Text style={styles.itemText}>이름</Text>
          <TextInput
            onChangeText={setNickname}
            style={styles.nameBox}
            value={nickname}
          />

          <Text style={styles.itemText}>주소</Text>
          <View style={styles.addressBox}>
            <Text style={styles.addressText}>{route.params.address}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        onPress={async () => {
          await UpdateNickname();
          if (editImage.IsEdit) {
            await UploadImage(editImage.ImageUrl);
          }
          await goHome();
        }}
        style={styles.submitBox}>
        <Text style={styles.sumbitText}>완료</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fefffe',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 60,
  },
  arrow: {width: 22, height: 22},
  headtext: {fontSize: 20, fontWeight: 'bold', marginLeft: 10},

  userContainer: {
    flex: 1,
  },
  ImageWrapper: {
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 50,
  },
  editProfileWrapper: {
    marginLeft: 25,
    marginRight: 25,
    marginBottom: 25,
    marginTop: 10,
  },
  myProfile: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  itemText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#3f3f3f',
  },
  nameBox: {
    height: 45,
    marginTop: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#07AC7D',
    padding: 10,
    fontSize: 17,
  },

  addressBox: {
    height: 45,
    marginTop: 12,
    marginBottom: 12,
    borderWidth: 1,
    backgroundColor: '#DBDBDB',
    borderRadius: 10,
    borderColor: '#07AC7D',
    padding: 10,
  },
  addressText: {
    fontSize: 17,
  },
  submitBox: {
    backgroundColor: '#07AC7D',
    alignItems: 'center',
    justifyContent: 'center',
    height: 45,
    marginBottom: 12,
    borderRadius: 10,
    marginHorizontal: 25,
    marginTop: 10,
  },
  sumbitText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default EditProfile;
