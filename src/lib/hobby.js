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
            console.log("Document written with ID: ", docRef);
        })
        .catch((error) => {
            console.error("Error adding document: ", error);
        });
}

export async function getHobbies() {
    const doc = await hobbiesCollection.get();
    return doc._docs;
}

// ------------------------------------------------ 할 거 ------------------------------------------------
// 매우 중요 ----> 🔥 파이어베이스 연동해서 마커 찍기
// 
// 1. 디테일 페이지
// 1.1. 날짜 선택할 때, 현재 날짜의 시간보다 이전의 시간을 선택 못하게 하기
// 1.2. 등록 눌렀을 때, 현재 시간 갖고와서 show 페이지에 몇분 전 뜨게 하기 
// 
// 2. 참여하기 페이지
// 2.1. 참여하기 버튼 눌렀을 때, 카드에 있는 user_id === 현재 uid, 본인이 만든 건 참여 안된다고 하기 
// 2.2. 다른 참여자가 참여하기 버튼을 눌렀을 때, 카운트 해서 -1 하는거 만들기
// 2.3. 현재 시간과, 모집마감시간빼서 카운트 해주는거
// 2.4. 최소 3km 이내에 있는 것만 불러오기
// 2.4. 방법 -> 현재 내가 갖고있는 좌표값, 카드에 있는 좌표값 각각 제곱 빼서 루트씌우기 훗ㅋ 
// 2.5. 모집기간 끝나면 없애기
// ------------------------------------------------ 끝 --------------------------------------------------