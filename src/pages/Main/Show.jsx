import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Image, FlatList } from "react-native";
import { NaverMapView, NaverMapMarkerOverlay } from "@mj-studio/react-native-naver-map";

const { width, height } = Dimensions.get('window');

const Show = ({ navigation, route }) => {
    console.log('show ===============> ', route.params._data);

    const { address, content, deadline, latitude, longitude, nickname, peopleCount, tag, title, writeTime } = route.params._data;
    
    const [initialRegion, setInitialRegion] = useState({
        latitude: latitude,
        longitude: longitude,
        latitudeDelta: 0,
        longitudeDelta: 0,
    });

    return (
        <SafeAreaView style={{flex : 1}}>
            <NaverMapView
                style={{width : width, height : width }}
                layerGroups={{
                    BUILDING: true,
                    BICYCLE: false,
                    CADASTRAL: false,
                    MOUNTAIN: false,
                    TRAFFIC: false,
                    TRANSIT: false,
                }}
                initialRegion={initialRegion}
                // isIndoorEnabled={indoor}
                // symbolScale={symbolScale}
                // lightness={lightness}
                // isNightModeEnabled={nightMode}
                // isShowCompass={compass}
                // isShowIndoorLevelPicker={indoorLevelPicker}
                // isShowScaleBar={scaleBar}
                // isShowZoomControls={zoomControls}
                // isShowLocationButton={myLocation}
                // isExtentBoundedInKorea
                logoAlign={'TopRight'}
                locale={'ko'}
            >
                <NaverMapMarkerOverlay
                    latitude={latitude}
                    longitude={longitude}
                    width={35}
                    height={45}
                />
            </NaverMapView>
        </SafeAreaView>
    )
}

export default Show;


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