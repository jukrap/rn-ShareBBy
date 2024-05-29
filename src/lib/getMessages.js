import firestore from '@react-native-firebase/firestore';

export const getMessages = (chatRoomId, callback) => {
  return firestore()
    .collection('chatRooms')
    .doc(chatRoomId)
    .collection('messages')
    .orderBy('timestamp', 'desc')
    .onSnapshot(querySnapshot => {
      const messages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(messages);
    });
};
