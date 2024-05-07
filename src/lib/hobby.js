import firestore from '@react-native-firebase/firestore';

export const hobbiesCollection = firestore().collection('hobbies');


export function recruitHobby({
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
    return hobbiesCollection.add({
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
    })
        .then((docRef) => {
            // console.log("Document written with ID: ", docRef);
        })
        .catch((error) => {
            console.error("Error adding document: ", error);
        });
}

export async function getHobbies() {
    const doc = await hobbiesCollection.get();
    return doc._docs;
}
