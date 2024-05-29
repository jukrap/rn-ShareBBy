import firestore from '@react-native-firebase/firestore';

export const getChatRoomMembers = async chatRoomId => {
  try {
    const chatRoomRef = firestore().collection('chatRooms').doc(chatRoomId);
    const chatRoomSnapshot = await chatRoomRef.get();
    if (chatRoomSnapshot.exists) {
      const {members} = chatRoomSnapshot.data();
      const memberDetails = [];
      for (const memberId of members) {
        const userSnapshot = await firestore()
          .collection('users')
          .doc(memberId)
          .get();
        if (userSnapshot.exists) {
          const userData = userSnapshot.data();
          memberDetails.push(userData);
        }
      }
      return memberDetails;
    } else {
      console.log('Chat room does not exist.');
      return [];
    }
  } catch (error) {
    console.error('Error fetching chat room members:', error);
    throw error;
  }
};
