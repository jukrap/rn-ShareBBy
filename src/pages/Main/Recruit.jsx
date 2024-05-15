import React, { useEffect, useRef, useState, useCallback } from "react";
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, Dimensions, Image, FlatList } from "react-native";
import { NaverMapView, NaverMapMarkerOverlay } from "@mj-studio/react-native-naver-map";
import Modal from "react-native-modal";
import Geolocation from "react-native-geolocation-service";

import { getHobbies } from "../../lib/hobby";

const { width, height } = Dimensions.get('window');

const LATITUDE_DELTA = 0.05;
const LONGITUDE_DELTA = LATITUDE_DELTA * (width / height);

const Recruit = ({ navigation, route }) => {
    const { id, nickname, profileImage} = route.params
    const mapView = useRef(null);

    const [initialRegion, setInitialRegion] = useState({
        latitude: 37.5670135,
        longitude: 126.9783740,
        latitudeDelta: 0.0024,
        longitudeDelta: 0.0024,
    });
    const [pickedLocation, setPickedLocation] = useState({
        pickAddress: '',
        pickLatitude: '',
        pickLongitude: '',
        id,
        nickname,
        profileImage,
    });
    const [location, setLocation] = useState();
    const [hobbiesData, setHobbiesData] = useState([]);

    const [isModalVisible, setIsModalVisible] = useState(false);

    const requestPermission = async () => {
        try {
            if (Platform.OS === "ios") {
                return await Geolocation.requestAuthorization("always");
            }
        } catch (e) {
            console.log(e);
        }
    }

    const moveCurrLocation = () => {
        mapView?.current?.setLocationTrackingMode("Follow")
    };

    const fetchAddress = async (latitude, longitude) => {
        const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyCKEnmMSbRzEbeqOwoO_zKm7qLhNhhhDKs&language=ko`)
        const json = await res.json();
        if (json.results && json.results.length > 0) {
            const pickLocation = json.results[0].formatted_address;
            const { lat, lng } = json.results[0].geometry.location;
            setPickedLocation(prevState => ({
                ...prevState,
                pickAddress: pickLocation,
                pickLatitude: lat,
                pickLongitude: lng,
            }))
            setIsModalVisible(true);

        } else {
            console.error('no results');
        }
    }

    const getHobbiesData = async () => {
        const res = await getHobbies();
        setHobbiesData(res)
    }

    const goToDetailScreen = () => {
        setIsModalVisible(false)
        navigation.navigate('Detail', pickedLocation)
    }

    const handleMapPress = (e) => {
        const { latitude, longitude } = e;
        fetchAddress(latitude, longitude);
    };

    const getMyLocation = async () => {
        requestPermission().then(result => {
            if (result === "granted") {
                Geolocation.getCurrentPosition(
                    pos => {
                        setLocation({
                            latitude: pos.coords.latitude,
                            longitude: pos.coords.longitude,
                            latitudeDelta: LATITUDE_DELTA,
                            longitudeDelta: LONGITUDE_DELTA,
                        })
                    },
                    error => {
                        console.log(error);
                    },
                    {
                        enableHighAccuracy: false,
                        timeout: 2000,
                    },
                );
            }
        }
    )};
        
    useEffect(() => {
        getMyLocation();
        getHobbiesData();
    }, []);

    useEffect(() => {
        requestPermission().then(result => {
            if (result === "granted") {
                Geolocation.getCurrentPosition(
                    pos => {
                        setLocation({
                            latitude: pos.coords.latitude,
                            longitude: pos.coords.longitude,
                            latitudeDelta: 0.009,
                            longitudeDelta: 0.002,
                        })
                    },
                    error => {
                        console.log(error);
                    },
                    {
                        enableHighAccuracy: false,
                        timeout: 2000,
                    },
                );
            }
        });
    }, []);

    const renderMarker = useCallback((marker) => {
        return (
            <NaverMapMarkerOverlay
                key={marker._data.id} 
                latitude={marker._data.latitude}
                longitude={marker._data.longitude}
                onPress={() => handleMapPress(marker)}
                />
        )
    },[]);


    return (
        <SafeAreaView style={{flex : 1}}>
            <View style={styles.searchView}>
                
                {/* 추후 리펙토링때 추가할 예정
                    <View style={styles.searchOpacity}>
                        <Image source={searchIcon} style={{ width: 24, height: 24 }} />
                        <TextInput placeholder='원하는 취미, 위치 검색'
                            placeholderTextColor='#898989'
                            style={{ flex: 1, fontSize: 12, fontFamily: 'Pretendard' }} />
                    </View> */}
                <TouchableOpacity
                    style={{ marginLeft: 'auto', paddingTop: 10 }}
                    onPress={moveCurrLocation}>
                    <Image source={currGpsIcon} style={{ width: 40, height: 40 }} />
                </TouchableOpacity>
            </View>   
            <NaverMapView
                ref={mapView}
                style={{ flex: 1 }}
                layerGroups={{
                    BUILDING: true,
                    BICYCLE: false,
                    CADASTRAL: false,
                    MOUNTAIN: false,
                    TRAFFIC: true,
                    TRANSIT: false,
                }}
                initialRegion={initialRegion}
                isShowIndoorLevelPicker={true}
                isShowLocationButton={false}
                isExtentBoundedInKorea
                locale={'ko'}
                onTapMap={(props) => {
                            console.log('🚀 ===============>  : ', props);
                            handleMapPress(props)
                            }
                        }
            >
                {hobbiesData.map((v) => renderMarker(v))}
            </NaverMapView>
            <Modal
                isVisible={isModalVisible}
                animationIn={"bounceIn"}
                animationOut={"bounceOut"}
                animationInTiming={300}
                animationOutTiming={300}
                transparent={true}
                backdropColor="#fff"
                backdropOpacity={0}
                onBackButtonPress={() => setIsModalVisible(!isModalVisible)}
                onBackdropPress={() => setIsModalVisible(!isModalVisible)}
            >
                <View style={styles.pressLocaView}>
                    <View style={{ padding: 16, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={[styles.pressText, { fontWeight: 'bold' }]}>{pickedLocation.pickAddress}</Text>
                        <Text style={styles.pressText}>선택하신 주소가 맞나요?</Text>
                    </View>
                    <View style={styles.pressOptionView}>
                        <TouchableOpacity
                            activeOpacity={0.6}
                            style={[styles.pressOptionBtn, { backgroundColor: '#07AC7D' }]}
                            onPress={() => goToDetailScreen()}>
                            <Text style={styles.pressOptionText}>예</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity={0.6}
                            style={[styles.pressOptionBtn, { backgroundColor: '#DBDBDB' }]}
                            onPress={() => setIsModalVisible(false)}>
                            <Text style={styles.pressOptionText}>아니요</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    searchView: {
        width: width,
        paddingHorizontal: 16,
        marginTop: 20,
        position: 'absolute',
        zIndex: 2,
        top : 60,
        paddingBottom : 10
    },
    searchOpacity: {
        height: 40,
        justifyContent: 'flex-start',
        alignItems: 'center',
        flexDirection: 'row',
        paddingHorizontal: 24,
        paddingVertical: 10,
        gap: 15,
        borderRadius: 10,
        backgroundColor: '#fff',
        shadowColor: '#A7A7A7',
        shadowOffset: {
            width: 1,
            height: 2,
        },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 5,
    },
    pressLocaView: {
        marginHorizontal: 30,
        borderRadius: 10,
        backgroundColor: '#fff',
        overflow: 'hidden',
    },
    pressText: {
        marginBottom: 6,
        fontSize: 16
    },
    pressOptionView: {
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
    },
    pressOptionBtn: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    pressOptionText: {
        fontSize: 16,
        color: '#FFF'
    },
    nomalText: {
        color: '#000',
        fontFamily: 'Pretendard',
        fontSize: 12,
    },
    howText: {
        color: '#fff',
        fontFamily: 'Pretendard',
        fontSize: 10,
    },
    icon: {
        width: 24,
        height: 24
    },
    listView : {
        width : width/1.3, 
        height : width/2.4, 
        paddingHorizontal: 16, 
        paddingVertical: 12, 
        gap: 10, 
        marginHorizontal : 10, 
        borderRadius : 8, 
        borderWidth : 1, 
        borderColor : '#07AC7D', 
        backgroundColor: '#fff',
        shadowColor: '#A7A7A7',
        shadowOffset: {
            width: 4,
            height: 1,
        },
        shadowOpacity: 0.8,
        shadowRadius: 4,
    },
    listTitle: {
        color: '#000',
        fontFamily: 'Pretendard',
        fontSize: 16,
        fontWeight: 600,
    },
    listRcruit: {
        fontFamily: 'Pretendard',
        fontSize: 12,
        fontWeight: 700,
    },
    listLocation: {
        color: '#07AC7D',
        width : 200,
        fontFamily: 'Pretendard',
        fontWeight: 400,
    },
    showBtn : {
        paddingHorizontal : 12, 
        paddingVertical : 8, 
        borderRadius : 8, 
        backgroundColor : '#07AC7D',
    }

})

const searchIcon = require('../../assets/icons/searchIcon.png');
const currGpsIcon = require('../../assets/icons/currGpsIcon.png');

export default Recruit;
