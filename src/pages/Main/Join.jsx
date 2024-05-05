import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Image, FlatList } from "react-native";
import { NaverMapView, NaverMapMarkerOverlay } from "@mj-studio/react-native-naver-map";

const Join = ({ navigation, route }) => {
    const jejuRegion = {
        latitude: 33.20530773,
        longitude: 126.14656715029,
        latitudeDelta: 0.38,
        longitudeDelta: 0.8,
      };

    return (
        <SafeAreaView style={{flex : 1}}>
            <NaverMapView
                style={{ flex: 1 }}
                layerGroups={{
                    BUILDING: true,
                    BICYCLE: false,
                    CADASTRAL: false,
                    MOUNTAIN: false,
                    TRAFFIC: false,
                    TRANSIT: false,
                }}
                initialRegion={jejuRegion}
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
                onInitialized={() => console.log('initialized!')}
                onOptionChanged={() => console.log('Option Changed!')}
                // onCameraChanged={(args) => console.log(`Camera Changed: ${formatJson(args)}`)}
                // onTapMap={(args) => console.log(`Map Tapped: ${formatJson(args)}`)}
            >
                <NaverMapMarkerOverlay
                    latitude={33.3565607356}
                    longitude={126.48599018}
                    onTap={() => console.log(1)}
                    // anchor={{ x: 0.5, y: 1 }}
                    caption={{
                    key: '1',
                    text: 'hello',
                    }}
                    subCaption={{
                    key: '1234',
                    text: '123',
                    }}
                    width={20}
                    height={20}
                />
            </NaverMapView>
        </SafeAreaView>
    )
}

export default Join;




// import React, { useState, useEffect, useRef, useCallback } from "react";
// import { SafeAreaView, Platform, View, Text, Image, Dimensions, TouchableOpacity, TextInput, Pressable, StyleSheet, FlatList, Animated } from "react-native";
// import Geolocation from "react-native-geolocation-service";
// import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

// import { getHobbies } from "../../lib/hobby";

// const { width, height } = Dimensions.get('window');
// const LATITUDE_DELTA = 0.05;
// const LONGITUDE_DELTA = LATITUDE_DELTA * (width / height);

// const requestPermission = async () => {
//     try {
//         if (Platform.OS === "ios") {
//             return await Geolocation.requestAuthorization("always");
//         }
//     } catch (e) {
//         console.log(e);
//     }
// }

// const Join = ({ navigation }) => {
//     const mapView = useRef(null);

//     const [pickedLocation, setPickedLocation] = useState({
//         pickAddress: '',
//         pickLatitude: '',
//         pickLongitude: '',
//     });
//     const [location, setLocation] = useState();
//     const [hobbiesData, setHobbiesData] = useState([]);
//     const currTime = new Date().getTime();

//     useEffect(() => {
//         getMyLocation();
//         getHobbiesData();
//     }, []);

//     const getMyLocation = async () => {
//         requestPermission().then(result => {
//             if (result === "granted") {
//                 Geolocation.getCurrentPosition(
//                     pos => {
//                         setLocation({
//                             latitude: pos.coords.latitude,
//                             longitude: pos.coords.longitude,
//                             latitudeDelta: LATITUDE_DELTA,
//                             longitudeDelta: LONGITUDE_DELTA,
//                         })
//                     },
//                     error => {
//                         console.log(error);
//                     },
//                     {
//                         enableHighAccuracy: false,
//                         timeout: 2000,
//                     },
//                 );
//             }
//         });
//     }


//     const fetchAddress = async (latitude, longitude) => {
//         const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyCKEnmMSbRzEbeqOwoO_zKm7qLhNhhhDKs&language=ko`)
//         const json = await res.json();
//         if (json.results && json.results.length > 0) {
//             const pickLocation = json.results[0].formatted_address;
//             const { lat, lng } = json.results[0].geometry.location;
//             setPickedLocation({
//                 pickAddress: pickLocation,
//                 pickLatitude: lat,
//                 pickLongitude: lng,
//             });
//             setIsModalVisible(true);

//         } else {
//             console.error('no results');
//         }
//     }

//     const getHobbiesData = async () => {
//         const res = await getHobbies();
//         setHobbiesData(res)
//         // console.log('🔥🔥🔥 아좌좟~ 🔥🔥🔥 ====> ', res); 
//     }

//     const handleMapPress = (e) => {
//         const { latitude, longitude } = e.coordinate;
//         fetchAddress(latitude, longitude);
//     };

//     const handleMarkerPress = (markerElements) => {
//         navigation.navigate('Show', markerElements);
//     };

//     const percentFun = (curr, total) => {
//         return Math.round((curr / total) * 100)
//     }

//     const moveCurrLocation = () => {
//         Geolocation.getCurrentPosition(
//             (position) => {
//                 const { latitude, longitude } = position.coords;
//                 mapView.current.animateToRegion({
//                     latitude,
//                     longitude,
//                     latitudeDelta: 0.005,
//                     longitudeDelta: 0.005,
//                 });
//             },
//             (error) => console.log(error),
//             { enableHighAccuracy: false, timeout: 2000 }
//         );
//     }


//     const renderItem = ({ item }) => {
//         const deadTime = new Date(currTime - item._data.deadline);
//         // console.log(deadTime)
//         // const DAY = deadTime.getDate();
//         // const HOUR = deadTime.getHours();
//         // const MIN = deadTime.getMinutes();

//         return (
//             <View style={styles.listView}>
//                 <View style={{ justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row', paddingTop: 8 }}>
//                     <Text style={styles.listTitle}>{item._data.title}</Text>
//                     {
//                         percentFun(item.currP, item.totalP) < 50 ?
//                             (
//                                 <Text style={[styles.listRcruit, { color: '#07AC7D' }]}>모집중</Text>
//                             ) : percentFun(item.currP, item.totalP) == 100 ?
//                                 (
//                                     <Text style={[styles.listRcruit, { color: '#898989' }]}>모집마감</Text>
//                                 ) : (
//                                     <Text style={[styles.listRcruit, { color: '#E4694E' }]}>마감임박</Text>
//                                 )
//                     }
//                 </View>
//                 <View style={{ justifyContent: 'space-between', alignItems: 'stretch', flexDirection: 'row' }}>
//                     <Text style={styles.listLocation}>{item._data.address}</Text>
//                     <Text style={[styles.listRcruit, { color: '#4E8FE4' }]}>{item.currP} \ {item._data.peopleCount} 명</Text>
//                 </View>
//                 <View>
//                     <Text>{item._data.tag}</Text>
//                 </View>
//                 <View style={{ justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}>
//                     {/* <Text style={{}}>{DAY}일 {HOUR}시간 {MIN}전</Text> */}
//                     {
//                         percentFun(item.currP, item.totalP) == 100 ? (
//                             <TouchableOpacity
//                                 style={[styles.showBtn, { backgroundColor: '#898989' }]}
//                                 onPress={() => navigation.navigate('Show', route)}>
//                                 <Text style={[styles.showCommText, { fontWeight: 600, fontSize: 14, color: '#FEFFFE' }]}>모집마감</Text>
//                             </TouchableOpacity>
//                         ) : (
//                             <TouchableOpacity
//                                 style={styles.showBtn}
//                                 onPress={() => navigation.navigate('Show', route)}>
//                                 <Text style={[styles.showCommText, { fontWeight: 600, fontSize: 14, color: '#FEFFFE' }]}>참여신청</Text>
//                             </TouchableOpacity>
//                         )
//                     }
//                 </View>
//             </View>
//         )
//     }

//     const renderMarker = useCallback((marker) => {
//         return (
//             <Marker
//                 key={marker._data.id}
//                 title="왜 안됨?"
//                 description="왜 에러남?"
//                 image={locationIcon}
//                 tracksViewChanges={true}
//                 zIndex={1}
//                 pinColor="#00c7ae"
//                 coordinate={{ latitude: marker._data.latitude, longitude: marker._data.longitude }}
//                 onPress={() => handleMarkerPress(marker)}
//                 />
            
//         )
//     }, []);


//     return (
//         <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }}>
//             <View style={{ flex: 1, backgroundColor: '#FFF' }}>
//                 <View style={styles.searchView}>
//                     <View style={styles.searchOpacity}>
//                         <Image source={searchIcon} style={{ width: 24, height: 24 }} />
//                         <TextInput
//                             placeholder='원하는 취미, 위치 검색'
//                             placeholderTextColor='#898989'
//                             style={{ flex: 1, fontSize: 12, fontFamily: 'Pretendard' }} />
//                     </View>
//                     <TouchableOpacity
//                         style={{ marginLeft: 'auto', paddingTop: 10 }}
//                         onPress={moveCurrLocation}>
//                         <Image source={currGpsIcon} style={{ width: 40, height: 40 }} />
//                     </TouchableOpacity>
//                 </View>
//                 <View style={{ position: 'absolute', zIndex: 2, bottom: 30 }}>
//                     <FlatList
//                         data={hobbiesData}
//                         renderItem={renderItem}
//                         keyExtractor={item => item.id}
//                         horizontal={true}
//                         showsHorizontalScrollIndicator={false}
//                         style={{ paddingLeft: 8 }}
//                         automaticallyAdjustContentInsets={false}
//                         decelerationRate="fast"
//                         pagingEnabled
//                         snapToInterval={width / 1.3 + 20}
//                         snapToAlignment="start"
//                     />
//                 </View>
//                 {location && <MapView
//                     style={{ flex: 1 }}
//                     ref={mapView}
//                     provider={PROVIDER_GOOGLE}
//                     initialRegion={location}
//                     showsUserLocation={true}
//                     showsBuildings={false}
//                     showsIndoors={false}
//                     showsTraffic={false}
//                     onPress={({ nativeEvent }) => {
//                         if (nativeEvent.action !== 'marker-press') {
//                             handleMapPress(nativeEvent)
//                             console.log('지도 누름');
//                         }
//                     }}
//                 >
//                     {/* {hobbiesData.map((v) => renderMarker(v))} */}
//                     <Marker coordinate={
//                         {
//                             latitude : 35.114928,
//                             longitude : 129.041621
//                         }
//                     } />
//                 </MapView>
//                 }
//             </View>
//         </SafeAreaView>
//     );
// };

// const searchIcon = require('../../assets/icons/searchIcon.png');
// const locationIcon = require('../../assets/icons/locationIcon.png');
// const currGpsIcon = require('../../assets/icons/currGpsIcon.png');

// const dummyList = [
//     {
//         id: 0,
//         title: '탁구 같이 치실 분 모집합니다~',
//         location: '부산진구 중앙대로 672 삼정타워 10층',
//         totalP: 5,
//         currP: 3,
//     }, {
//         id: 1,
//         title: '탁구 같이 치실 분 모집합니다~',
//         location: '부산진구 중앙대로 672 삼정타워 10층',
//         totalP: 5,
//         currP: 3,
//     }, {
//         id: 2,
//         title: '탁구 같이 치실 분 모집합니다~',
//         location: '부산진구 중앙대로 672 삼정타워 10층',
//         totalP: 5,
//         currP: 3,
//     }, {
//         id: 3,
//         title: '탁구 같이 치실 분 모집합니다~',
//         location: '부산진구 중앙대로 672 삼정타워 10층',
//         totalP: 5,
//         currP: 5,
//     }, {
//         id: 4,
//         title: '탁구 같이 치실 분 모집합니다~',
//         location: '부산진구 중앙대로 672 삼정타워 10층',
//         totalP: 5,
//         currP: 4,
//     }, {
//         id: 5,
//         title: '탁구 같이 치실 분 모집합니다~',
//         location: '부산진구 중앙대로 672 삼정타워 10층',
//         totalP: 5,
//         currP: 2,
//     }, {
//         id: 6,
//         title: '탁구 같이 치실 분 모집합니다~',
//         location: '부산진구 중앙대로 672 삼정타워 10층',
//         totalP: 5,
//         currP: 1,
//     }, {
//         id: 7,
//         title: '탁구 같이 치실 분 모집합니다~',
//         location: '부산진구 중앙대로 672 삼정타워 10층',
//         totalP: 5,
//         currP: 0,
//     },
// ]

// const styles = StyleSheet.create({
//     searchView: {
//         width: width,
//         paddingHorizontal: 16,
//         marginTop: 20,
//         position: 'absolute',
//         zIndex: 2
//     },
//     searchOpacity: {
//         height: 40,
//         justifyContent: 'flex-start',
//         alignItems: 'center',
//         flexDirection: 'row',
//         paddingHorizontal: 12,
//         paddingVertical: 10,
//         gap: 15,
//         borderRadius: 10,
//         backgroundColor: '#fff',
//         shadowColor: '#A7A7A7',
//         shadowOffset: {
//             width: 1,
//             height: 2,
//         },
//         shadowOpacity: 0.5,
//         shadowRadius: 4,
//         elevation: 5,
//     },
//     pressLocaView: {
//         marginHorizontal: 30,
//         borderRadius: 10,
//         backgroundColor: '#fff',
//         overflow: 'hidden',
//     },
//     pressText: {
//         marginBottom: 6,
//         fontSize: 16
//     },
//     pressOptionView: {
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         flexDirection: 'row',
//     },
//     pressOptionBtn: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//         padding: 16,
//     },
//     pressOptionText: {
//         fontSize: 16,
//         color: '#FFF'
//     },
//     nomalText: {
//         color: '#000',
//         fontFamily: 'Pretendard',
//         fontSize: 12,
//     },
//     howText: {
//         color: '#fff',
//         fontFamily: 'Pretendard',
//         fontSize: 10,
//     },
//     icon: {
//         width: 24,
//         height: 24
//     },
//     listView: {
//         width: width / 1.3,
//         height: width / 2.4,
//         paddingHorizontal: 16,
//         paddingVertical: 12,
//         gap: 6,
//         marginHorizontal: 10,
//         borderRadius: 8,
//         borderWidth: 1,
//         borderColor: '#07AC7D',
//         backgroundColor: '#fff',
//         shadowColor: '#A7A7A7',
//         shadowOffset: {
//             width: 4,
//             height: 1,
//         },
//         shadowOpacity: 0.8,
//         shadowRadius: 4,
//     },
//     listTitle: {
//         color: '#000',
//         fontFamily: 'Pretendard',
//         fontSize: 16,
//         fontWeight: 600,
//     },
//     listRcruit: {
//         fontFamily: 'Pretendard',
//         fontSize: 12,
//         fontWeight: 700,
//     },
//     listLocation: {
//         color: '#07AC7D',
//         width: 200,
//         fontFamily: 'Pretendard',
//         fontWeight: 400,
//     },
//     showBtn: {
//         paddingHorizontal: 12,
//         paddingVertical: 8,
//         borderRadius: 8,
//         backgroundColor: '#07AC7D'
//     }

// })

// export default Join;