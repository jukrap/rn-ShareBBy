import firestore, {
  query,
  collection,
  getDocs,
  orderBy,
  startAt,
  endAt,
} from '@react-native-firebase/firestore';

export const hobbiesCollection = firestore().collection('hobbies');

// 주소를 정규화하는 함수 (소문자 변환 및 트림)
function normalizeAddress(address) {
  return address.trim().toLowerCase();
}

export async function recruitHobby({
  user_id,
  nickname,
  latitude,
  longitude,
  address,
  detail_address,
  tag,
  deadline,
  peopleCount,
  title,
  content,
  writeTime,
}) {
  const normalizedAddress = normalizeAddress(address);
  const res = await hobbiesCollection.add({
    user_id,
    nickname,
    latitude,
    longitude,
    address: normalizedAddress,
    detail_address,
    tag,
    deadline,
    peopleCount,
    title,
    content,
    writeTime,
    personNumber: 1,
  });
  return res._documentPath._parts[1];
}

export async function getHobbies() {
  const doc = await hobbiesCollection.get();
  return doc.docs;
}

export async function getNearHobbies(userAddress) {
  const normalizedAddress = normalizeAddress(userAddress);
  const querySnapshot = await getDocs(
    query(
      hobbiesCollection,
      orderBy('address'),
      startAt(normalizedAddress),
      endAt(normalizedAddress + '\uf8ff'),
    ),
  );

  return querySnapshot.docs.map(data => ({
    id: data._ref._documentPath._parts[1],
    data: data,
  }));
}
