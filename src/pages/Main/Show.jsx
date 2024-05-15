import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView, View, Text, Animated, StyleSheet, ScrollView, Dimensions, Image, FlatList, TouchableOpacity } from "react-native";
import firestore from '@react-native-firebase/firestore';
import { NaverMapView, NaverMapMarkerOverlay } from "@mj-studio/react-native-naver-map";
import dayjs from 'dayjs';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { getUser } from "../../lib/user";

import TopTab from "../../components/Main/TobTab";
import BottomButtons from "../../components/Main/BottomButtons";
import Toast from "../../components/Main/Toast";

const { width, height } = Dimensions.get('window');

const Show = ({ navigation, route }) => {
    const showValue = useRef(new Animated.Value(0)).current;
    const { address, detail_address, content, deadline, latitude, longitude, nickname, peopleCount, tag, title, writeTime, user_id } = route.params.data._data;
    const id = route.params.id
    const [userToken, setUserToken] = useState();
    const [userInfo, setUserInfo] = useState([]);
    const [joinUsers, setJoinUsers] = useState([]);
    const [initialRegion, setInitialRegion] = useState({
        latitude: latitude,
        longitude: longitude,
        latitudeDelta: 0,
        longitudeDelta: 0,
    });
    const [isToast, setIsToast] = useState('');
    const showAnimated = (value) => Animated.timing(showValue, { toValue: value, useNativeDriver: true, duration: 300 });

    useEffect(() => {
        showAnimated(1).start()
        getUserToken()
        getJoinUserList(id)
    }, []);

    const getUserToken = async () => {
        try {
            const userToken = await AsyncStorage.getItem('userToken');
            const userId = await getUser(userToken);
            if (userToken !== null) {
                setUserToken(userToken)
                setUserInfo(userId)
            } else {
                console.log('User Token이 없습니다.');
            }
            } catch (error) {
            console.error('AsyncStorage에서 데이터를 가져오는 중 오류 발생:', error);
        }
    };

    const getJoinUserList = async (hobbiesId) => {
        try {
            const chatRoomsInfo = await firestore().collection('chatRooms').where("hobbiesId", "==", hobbiesId).get();
            const chatRoomDoc = chatRoomsInfo.docs[0];
            const joinMembers = chatRoomDoc.data().members;

            const {members} = chatRoomDoc.data();
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
                    setJoinUsers(memberDetails)
        } catch (e) {
        }
    }

    const inputUserId = async (userId, hobbiesId) => {
            const chatRoomsInfo = await firestore().collection('chatRooms').where("hobbiesId", "==", hobbiesId).get();
            const chatRoomDoc = chatRoomsInfo.docs[0];
            const joinMembers = chatRoomDoc.data().members;
            const docId = chatRoomDoc.id;
            try {
                if(!joinMembers.includes(userId)){
                    await firestore().collection('chatRooms').doc(docId).update({
                        members: firestore.FieldValue.arrayUnion(userId)
                    })
                    await firestore().collection('hobbies').doc(hobbiesId).update({
                        personNumber: firestore.FieldValue.increment(1)
                    })
                    setTimeout(() => {
                        navigation.navigate('BottomTab', {
                            screen : '채팅',
                            params : userInfo,
                        });
                    }, 2000)
                }
            } catch (error) {
                console.error('chatRooms 정보를 가져오는데 실패했습니다:', error);
            }            
    }

    const onPressToken = () => {
        const checkMyId = userToken === user_id
        if (checkMyId) {
            console.log('같아서 참여하기 누르면 본인 참가 했으니 중복참가 안된다고 함');
            setIsToast(true);
        } else {
            inputUserId(userToken, id)
            
            console.log('채팅방 페이지로 이동');
        }
    }

    const renderItem = ({item}) => {
        return (
            <View style={{width : 60, paddingTop : 10, marginRight : 18}}>
                <Image src={item.profileImage} style={{width : 60, height : 60, borderRadius : 50}} />
                <Text numberOfLines={1} ellipsizeMode="tail">{item.nickname}</Text>
            </View>
        )          
    }

    return (
        <SafeAreaView style={{flex : 1, backgroundColor : '#fff'}}>
            <TopTab navigation={navigation} title={title} />
            <NaverMapView
                style={{width : width, height : width/1.6 }}
                layerGroups={{
                    BUILDING: true,
                    BICYCLE: false,
                    CADASTRAL: false,
                    MOUNTAIN: false,
                    TRAFFIC: false,
                    TRANSIT: false,
                }}
                initialRegion={initialRegion}
                isShowLocationButton={false}
                isShowZoomControls={false}
                isRotateGesturesEnabled={false}
                isScrollGesturesEnabled={false}
                isTiltGesturesEnabled={false}
                isStopGesturesEnabled={false}
                isZoomGesturesEnabled={false}
                locale={'ko'}
                maxZoom={16}
                minZoom={16}
            >
                <NaverMapMarkerOverlay
                    latitude={latitude}
                    longitude={longitude}
                    width={35}
                    height={45}
                />
            </NaverMapView>
            <View style={{ flex : 1, gap : 10,}}>
                <View style={{ paddingHorizontal : 16, paddingTop : 10, gap : 8}}>
                    <Text style={{fontSize : 20, fontWeight : '700'}}>{title}</Text>
                    <Text style={{fontSize : 16}}>{tag}</Text>
                </View>
                <View style={{ paddingHorizontal : 16, paddingTop : 10, gap : 8}}>
                    <View style={{justifyContent : 'flex-start', alignItems : 'center', flexDirection : 'row', gap : 16}}>
                        <Text style={{fontWeight : '700', color : '#07AC7D'}}>장소</Text>
                        <Text numberOfLines={1} ellipsizeMode="tail" style={{width : width-100}}>{address} {detail_address}</Text>
                    </View>
                    <View style={{justifyContent : 'flex-start', alignItems : 'center', flexDirection : 'row', gap : 16}}>
                        <Text style={{fontWeight : '700', color : '#07AC7D'}}>시간</Text>
                        <Text>{dayjs(deadline).format('YYYY년 MM월 DD일 (ddd) HH:mm')} 까지</Text>
                    </View>
                    <View style={{justifyContent : 'flex-start', alignItems : 'center', flexDirection : 'row', gap : 16}}>
                        <Text style={{fontWeight : '700', color : '#07AC7D'}}>인원</Text>
                        <Text>{peopleCount} 명</Text>
                    </View>
                </View>
                <View style={{width : width, height : 1, backgroundColor : '#f4f4f4'}} />
                    <View style={{ flex : 1}}>
                    <ScrollView>
                        <View style={{ paddingHorizontal : 16, paddingVertical : 20, gap : 8}}>
                            <Text style={{fontSize : 16, fontWeight : '600'}}>상세내용</Text>
                            <Text>{content}</Text>
                        </View>
                        <View style={{ paddingHorizontal : 16 }}>
                            <Text style={{fontSize : 16, fontWeight : '600'}}>참여인원</Text>
                            <FlatList
                                data={joinUsers}
                                renderItem={renderItem}
                                keyExtractor={item => item.user_id}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                />
                        </View>
                    </ScrollView>
                    </View>
            </View>
            <BottomButtons showValue={showValue} joinUsers={joinUsers} peopleCount={peopleCount} onPressToken={onPressToken} />
            <Toast  text="본인이 만든 취미에요!"
                    visible={isToast}
                    handleCancel={() => {
                        setIsToast(false);
                    }}
            />
            
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    bottom: {
        position: 'absolute',
        height : 100,
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        borderStyle: 'solid',
        borderColor: '#c3c3c3',
        borderWidth: 0.5,
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
})

export default Show;

