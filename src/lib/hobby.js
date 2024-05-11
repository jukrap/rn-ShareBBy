import firestore from '@react-native-firebase/firestore';

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
    // Add a new document with a generated id.
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

export async function getHobbiesDetail() {
    const docList = await hobbiesCollection.get();
    const hobbyIdList = docList.docs.map((data) => ({
        id: data._ref._documentPath._parts[1],
        data: data
    }));
    console.log(hobbyIdList);
    return hobbyIdList;
}