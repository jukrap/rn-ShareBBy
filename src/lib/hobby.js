import firestore, { query, collection, getDocs, orderBy, startAt, endAt } from '@react-native-firebase/firestore';

export const hobbiesCollection = firestore().collection('hobbies');

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
    const res = await hobbiesCollection.add({
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
        personNumber: 1
    })
    return res._documentPath._parts[1];
}

export async function getHobbies() {
    const doc = await hobbiesCollection.get();
    return doc.docs;
}

export async function getNearHobbies(userAddress) {
    const querySnapshot = await getDocs(query(hobbiesCollection, orderBy('address'), startAt(userAddress), endAt(userAddress+'\uf8ff')));
    return querySnapshot.docs.map((data) => ({
        id: data._ref._documentPath._parts[1],
        data: data
    }));
} 