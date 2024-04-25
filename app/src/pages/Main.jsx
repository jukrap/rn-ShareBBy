import React, { useState, useEffect } from 'react';
import { Text, View } from 'react-native';
import firestore from '@react-native-firebase/firestore';

const Main = ({ route }) => {
  

  return (
    <View>
      
     <Text>dsds</Text>
    </View>
  );
};

export default Main;



// import React, { useState, useEffect } from 'react';
// import { Text, View } from 'react-native';
// import firestore from '@react-native-firebase/firestore';

// const Main = ({ route }) => {
//   const { userId } = route.params; // Login 컴포넌트에서 전달된 사용자 ID

//   const [userData, setUserData] = useState(null);

//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         const userDoc = await firestore().collection('users').doc(userId).get(); // 전달받은 사용자 ID로 Firestore에서 데이터를 가져옴
//         if (userDoc.exists) {
//           const userData = userDoc.data();
//           setUserData(userData);
//         } else {
//           console.log('사용자 데이터가 없습니다.');
//         }
//       } catch (error) {
//         console.error('사용자 데이터를 불러오는 중 오류 발생:', error);
//       }
//     };

//     fetchUserData();
//   }, [userId]); // userId가 변경될 때마다 Firestore에서 사용자 데이터를 다시 가져옴

//   return (
//     <View>
//       {userData && (
//         <View>
//           <Text>Email: {userData.email}</Text>
//           <Text>ID: {userData.id}</Text>
//           <Text>NickName: {userData.nickName}</Text>
//           <Text>PhoneNumber: {userData.phoneNumber}</Text>
//         </View>
//       )}
//     </View>
//   );
// };

// export default Main;
