import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView, View, Text, Animated, StyleSheet, ScrollView, Dimensions, Image, FlatList, TouchableOpacity } from "react-native";
import { NaverMapView, NaverMapMarkerOverlay } from "@mj-studio/react-native-naver-map";
import dayjs from 'dayjs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUser } from "../../lib/user";

import TopTab from "../../components/Main/TobTab";
import BottomButtons from "../../components/Main/BottomButtons";
import Toast from "../../components/Main/Toast";

const { width, height } = Dimensions.get('window');

const Show = ({ navigation, route }) => {
    console.log('show ===============> ', route.params._data);
    const showValue = useRef(new Animated.Value(0)).current;
    const { address, detail_address, content, deadline, latitude, longitude, nickname, peopleCount, tag, title, writeTime, user_id } = route.params._data;
    
    const [userToken, setUserToken] = useState()
    const [userInfo, setUserInfo] = useState([]);
    const [initialRegion, setInitialRegion] = useState({
        latitude: latitude,
        longitude: longitude,
        latitudeDelta: 0,
        longitudeDelta: 0,
    });
    const [isToast, setIsToast] = useState('');
    const toastValue = useRef(new Animated.Value(0)).current;
    const showAnimated = (value) => Animated.timing(showValue, { toValue: value, useNativeDriver: true, duration: 300 });

    useEffect(() => {
        showAnimated(1).start()
        getUserToken()
    }, []);

    const getUserToken = async () => {
        try {
          // 'userToken' 키를 사용하여 데이터 가져오기
          const userToken = await AsyncStorage.getItem('userToken');
          const userInfo = await getUser(userToken);
          if (userToken !== null) {
            // 데이터가 있을 경우 처리
            // console.log('User Token:', userToken);
            // console.log('UserInfo:', userInfo);
            setUserToken(userToken);
            setUserInfo(userInfo)
          } else {
            console.log('User Token이 없습니다.');
          }
        } catch (error) {
          // 오류 처리
          console.error('AsyncStorage에서 데이터를 가져오는 중 오류 발생:', error);
        }
        console.log('userInfo 값 ====>', userInfo);
      };

    const onPressToken = () => {
        const checkMyId = userToken === user_id
        if (checkMyId) {
            console.log('같아서 참여하기 누르면 본인 참가 했으니 중복참가 안된다고 함');
            setIsToast(true);
        } else {
            navigation.navigate('BottomTab', {
                screen : '채팅',
                params : userToken
            });
            console.log('채팅방 페이지로 이동');

        }

    }

    

// 참가하기를 눌렀을 때, 유저 아이디를 넘기기
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
                        <View style={{justifyContent : 'center', paddingTop : 24,}}>
                        <Image src={userInfo.profileImage} style={{width : 60, height : 60, borderRadius : 50}} />
                        <Text>{nickname}</Text>
                        </View>
                    </View>
                    </ScrollView>
                    </View>
            </View>
            <BottomButtons showValue={showValue} peopleCount={peopleCount} onPressToken={onPressToken} />
            <Toast  text="본인이 만든 취미에요!"
                    visible={isToast}
                    handleCancel={() => {
                        setIsToast(false);
                    }}
            />
        </SafeAreaView>
    )
}

export default Show;

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
// import React, { useEffect } from "react";
// import { SafeAreaView, View, Text, Image, TouchableOpacity, Dimensions, StyleSheet, ScrollView } from "react-native";
// import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

// const { width, height } = Dimensions.get('window');

// const Show = ({ route, navigation }) => {
//     const { address, detailAddress, deadLine, latitude, longitude, peopleCount, showContent, showTag, showTitle } = route.params;
    
    
//     // useEffect(() => {

//     // }, []);
    
    
//     return (
//         <SafeAreaView style={{ flex: 1, backgroundColor: '#FEFFFE' }}>
//             <MapView
//                 style={{ width: width, height: width / 1.3 }}
//                 provider={PROVIDER_GOOGLE}
//                 initialRegion={{
//                     latitude: latitude,
//                     longitude: longitude,
//                     latitudeDelta: 0.0021,
//                     longitudeDelta: 0.0021
//                 }}
//             >
//                 <TouchableOpacity 
//                     onPress={() => navigation.navigate('Detail')}
//                     style={style.backSpaceView}>
//                     <Image source={backIcon} style={{ width: 30, height: 30 }} />
//                 </TouchableOpacity>
//                 <Marker coordinate={{ latitude: latitude, longitude: longitude }}>
//                     <View style={{ width: 50, height: 50, justifyContent: 'center', alignItems: 'center' }}>
//                         <Image source={locationIcon} style={{ width: 40, height: 40 }} />
//                     </View>
//                 </Marker>
//             </MapView>
//             <View style={style.showTotalView}>
//                 <View style={style.showPartView}>
//                     <Image source={addressIcon} style={style.showIcon} />
//                     <View>
//                         <Text style={style.showCommText}>{address}</Text>
//                         <Text style={style.showCommText}>{detailAddress}</Text>
//                     </View>

//                 </View>
//                 <View style={{ justifyContent: 'flex-start', alignItems: 'center', flexDirection: 'row', paddingHorizontal: 8, gap: 8 }}>
//                     <Image source={recruitIcon} style={style.showIcon} />
//                     <Text style={style.showCommText}>{peopleCount} 명 중 8 명 모집 완료</Text>
//                 </View>
//                 <View style={{ justifyContent: 'flex-start', alignItems: 'center', flexDirection: 'row', paddingHorizontal: 8, gap: 8 }}>
//                     <Image source={timeIcon} style={style.showIcon} />
//                     <Text style={style.showCommText}>{deadLine}</Text>
//                 </View>
//                 <View style={{ height: 1, backgroundColor: '#DBDBDB' }} />
//             </View>
//             <View style={{ paddingHorizontal: 16, gap: 8 }}>
//                 <ScrollView 
//                     bounces={true}
//                     style={{ height: height, paddingHorizontal: 8 }}>
//                     <View style={{ gap: 4 }}>
//                         <Text style={[style.showCommText, { fontWeight: 700, fontSize: 16 }]}>{showTitle}</Text>
//                         <Text style={[style.showCommText, { fontWeight: 400, fontSize: 10, color: '#A7A7A7' }]}>작성한 시간</Text>
//                     </View>
//                     <View style={{ paddingTop: 16 }}>
//                         <Text style={style.showCommText}>{showContent}</Text>
//                     </View>
//                 </ScrollView>
//             </View>
//             <View style={{ width: width, height: 64, justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row', marginTop: 'auto', paddingHorizontal: 16, borderTopWidth: 1, borderTopColor: '#DBDBDB', backgroundColor : '#FEFFFE' }}>
//                 <TouchableOpacity style={{ justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}>
//                     <Image source={dummyProfileIcon} style={{ width: 30, height: 30 }} />
//                     <View style={{ paddingLeft: 8, gap: 4 }}>
//                         <Text style={[style.showCommText, { fontWeight: 500 }]}>슈퍼메가 울트라 참치</Text>
//                         <Text style={[style.showCommText, { fontWeight: 400, fontSize: 10, color: '#A7A7A7' }]}>모집마감까지 남은 시간</Text>
//                     </View>
//                 </TouchableOpacity>
//                 <TouchableOpacity style={style.showBtn}>
//                     <Text style={[style.showCommText, { fontWeight: 600, fontSize: 14, color: '#FEFFFE' }]}>참여신청</Text>
//                 </TouchableOpacity>
//             </View>
//         </SafeAreaView>
//     )
// }

// const style = StyleSheet.create({
//     backSpaceView: {
//         height: 20,
//         width: width,
//         position: 'absolute',
//         zIndex: 2,
//         marginRight: 'auto',
//         paddingTop: 10
//     },
//     showTotalView: {
//         paddingVertical: 16,
//         paddingHorizontal: 16,
//         gap: 8
//     },
//     showPartView: {
//         justifyContent: 'flex-start',
//         alignItems: 'center',
//         flexDirection: 'row',
//         paddingHorizontal: 8,
//         gap: 8
//     },
//     showCommText: {
//         fontSize: 14,
//         fontWeight: 500,
//         fontFamily: 'Pretendard',
//         color: '#212529'
//     },
//     showIcon: {
//         width: 20,
//         height: 20,
//     },
//     showBtn : {
//         paddingHorizontal : 12, 
//         paddingVertical : 8, 
//         borderRadius : 8, 
//         backgroundColor : '#07AC7D'
//     }
// })

// const locationIcon = require('../../assets/icons/locationIcon.png');
// const backWhiteIcon = require('../../assets/icons/backWhiteIcon.png');
// const backIcon = require('../../assets/icons/backIcon.png');
// const addressIcon = require('../../assets/icons/addressIcon.png');
// const recruitIcon = require('../../assets/icons/recruitIcon.png');
// const timeIcon = require('../../assets/icons/timeIcon.png');
// const dummyProfileIcon = require('../../assets/icons/dummyProfileIcon.png');



// export default Show;