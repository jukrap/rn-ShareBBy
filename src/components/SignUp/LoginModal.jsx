// import React, {useState} from 'react';
// import {
//   Text,
//   View,
//   TextInput,
//   Alert,
//   Image,
//   TouchableOpacity,
//   StyleSheet,
//   KeyboardAvoidingView,
//   Platform,
//   Modal
// } from 'react-native';

// const LoginModla = () => {
//     return (
//         <Modal transparent animationType="slide">
//         <View style={styles.modalContainer}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalText}>아이디 또는 비밀번호를 확인해주세요.</Text>
//             <Text>입력하신 이메일로 가입된 계정을 찾을 수 없어요</Text>
//             <View style={styles.modalButtonContainer}>
//               <TouchableOpacity
//                 style={styles.modalButton1}
//                 >
//                 <Text style={styles.modalButtonText}>취소</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={styles.modalButton}
// >
//                 <Text style={styles.modalButtonText}>회원가입</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     )
// }

// modalContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   modalContent: {
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     padding: 20,
//     width: '80%',
//     alignItems: 'center',
//   },
//   modalText: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 16,
//   },
//   modalButtonContainer: {
//     flexDirection: 'row',
//     gap: 8,
//     marginTop: 16,
//   },
//   modalButton1: {
//     backgroundColor: '#A7A7A7',
//     paddingVertical: 10,
//     width: 130,
//     borderRadius: 5,
//     alignItems: 'center',
//   },
//   modalButton: {
//     backgroundColor: '#07AC7D',
//     paddingVertical: 10,
//     width: 130,
//     borderRadius: 5,
//     alignItems: 'center',
//   },
//   modalButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },