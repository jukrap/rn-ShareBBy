import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export const sendMessage = async (
  chatRoomId,
  inputMessage,
  setInputMessage,
) => {
  try {
    if (!inputMessage.trim()) {
      return;
    }

    const currentUser = auth().currentUser;

    let senderName = 'Unknown';
    let senderProfileImg = '';
    if (currentUser) {
      const userSnapshot = await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .get();
      if (userSnapshot.exists) {
        senderName = userSnapshot.data().nickname;
        senderProfileImg = userSnapshot.data().profileImage;
      }
    }

    const newMessage = {
      text: inputMessage,
      sender: senderName,
      senderId: currentUser.uid,
      timestamp: firestore.FieldValue.serverTimestamp(),
      senderProfileImg: senderProfileImg,
    };

    await firestore()
      .collection('chatRooms')
      .doc(chatRoomId)
      .collection('messages')
      .add(newMessage);

    setInputMessage('');
  } catch (error) {
    console.error('Error sending message: ', error);
  }
};
