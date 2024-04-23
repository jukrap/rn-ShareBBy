import firestore from '@react-native-firebase/firestore';

export const userCollection = firestore().collection('users');

export function createUser({id, nickName, phoneNumber, email}) {
  return userCollection.doc(id).set({
    id,
    nickName,
    email,
    phoneNumber,
  });
}

export async function getUser(id) {
  const doc = await userCollection.doc(id).get();
  return doc.data();
}
