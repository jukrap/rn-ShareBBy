import firestore from '@react-native-firebase/firestore';

export const userCollection = firestore().collection('users');

export function createUser({
  id,
  password,
  nickname,
  address,
  email,
  checkboxState,
}) {
  return userCollection.doc(id).set({
    id,
    nickname,
    password,
    email,
    address,
    checkboxState,
  });
}

export async function getUser(id) {
  const doc = await userCollection.doc(id).get();
  return doc.data();
}
