import React, { useState, useEffect, useRef } from "react";
import { SafeAreaView, Platform, View, Text, Image, Dimensions, TouchableOpacity, TextInput, Pressable, StyleSheet, FlatList, Animated } from "react-native";
import Modal from "react-native-modal";
import Geolocation from "react-native-geolocation-service";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

const { width, height } = Dimensions.get('window');

const Recruit = ({ navigation, route }) => {
    console.log(route.params);
    // const addedAddress = route.params;
    const [initialLocation, setinitialLocation] = useState({
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
    });
    const [pickedLocation, setPickedLocation] = useState({
        pickAddress: '',
        pickLatitude: '',
        pickLongitude: '',
    });
    const [location, setLocation] = useState();
    const [addMarkerAddress, setAddMarkerAddress] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const mapView = useRef(null);

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
                        enableHighAccuracy: true,
                        timeout: 3600,
                        maximumAge: 3600,
                    },
                );
            }
        });
    }, []);

    // useEffect(() => {
    //     if (addedAddress) {
    //         setAddMarkerAddress(addedAddress);
    //     }
    // }, [addedAddress]);

    const requestPermission = async () => {
        try {
            if (Platform.OS === "ios") {
                return await Geolocation.requestAuthorization("always");
            }
        } catch (e) {
            console.log(e);
        }
    }

    const fetchAddress = async (latitude, longitude) => {
        const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyCKEnmMSbRzEbeqOwoO_zKm7qLhNhhhDKs&language=ko`)
        const json = await res.json();
        if (json.results && json.results.length > 0) {
            const pickLocation = json.results[0].formatted_address;
            const { lat, lng } = json.results[0].geometry.location;
            setPickedLocation({
                pickAddress: pickLocation,
                pickLatitude: lat,
                pickLongitude: lng,
            });
            setIsModalVisible(true);

        } else {
            console.error('no results');
        }
    }

    const handleMapPress = (e) => {
        const { latitude, longitude } = e.coordinate;
        fetchAddress(latitude, longitude);
    };

    const handleMarkerPress = (markerElements) => {
        navigation.navigate('Show', markerElements);
    };

    const moveCurrLocation = () => {
        Geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                mapView.current.animateToRegion({
                    latitude,
                    longitude,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                });
            },
            (error) => console.log(error),
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
        );
    }
    const getUserInfo = async () => {
        
    }

    const goToDetailScreen = () => {
        setIsModalVisible(false)
        navigation.navigate('Detail', pickedLocation)
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor:'#FFF' }}>
            <View style={{ flex: 1, backgroundColor:'#FFF' }}>
                <View style={styles.searchView}>
                    <View style={styles.searchOpacity}>
                        <Image source={searchIcon} style={{ width: 24, height: 24 }} />
                        <TextInput
                            placeholder='원하는 취미, 위치 검색'
                            placeholderTextColor='#898989'
                            style={{ flex: 1, fontSize: 12, fontFamily: 'Pretendard' }} />
                    </View>
                    <TouchableOpacity 
                        style={{ marginLeft: 'auto', paddingTop: 10 }}
                        onPress={moveCurrLocation}>
                        <Image source={currGpsIcon} style={{ width: 40, height: 40 }} />
                    </TouchableOpacity>
                </View>
                <MapView
                    style={{ flex: 1 }}
                    ref={mapView}
                    provider={PROVIDER_GOOGLE}
                    initialRegion={initialLocation}
                    region={location}
                    showsUserLocation={true}
                    showsBuildings={false}
                    showsIndoors={false}
                    showsTraffic={false}
                    onPress={({ nativeEvent }) => {
                        if (nativeEvent.action !== 'marker-press') {
                            handleMapPress(nativeEvent)
                            console.log('지도 누름');
                        }
                    }}
                >
                    {/* {addMarkerAddress?.map((markerElements, i) => {
                        console.log('markerElements : ', markerElements);
                        return (
                            <Marker
                                key={i}
                                pinColor="#00c7ae"
                                coordinate={{ latitude: Number(markerElements.latitude), longitude: Number(markerElements.longitude) }}
                                onPress={() => handleMarkerPress(markerElements)}>
                                <Image source={locationIcon} style={{ width: 30, height: 30 }} />
                            </Marker>
                        )
                    })} */}
                </MapView>
            </View>
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
    );
};

const searchIcon = require('../../assets/icons/searchIcon.png');
const locationIcon = require('../../assets/icons/locationIcon.png');
const currGpsIcon = require('../../assets/icons/currGpsIcon.png');


const styles = StyleSheet.create({
    searchView: {
        width: width,
        paddingHorizontal: 16,
        marginTop: 20,
        position: 'absolute',
        zIndex: 2
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

export default Recruit;