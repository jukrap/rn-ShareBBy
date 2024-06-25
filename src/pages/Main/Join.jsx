import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  FlatList,
} from 'react-native';
import {
  NaverMapView,
  NaverMapMarkerOverlay,
} from '@mj-studio/react-native-naver-map';
import Geolocation from 'react-native-geolocation-service';
import dayjs from 'dayjs';

import { getNearHobbies } from '../../lib/hobby';
import userFetchAddress from '../../hooks/userFetchAddress';

const { width, height } = Dimensions.get('window');

const LATITUDE_DELTA = 0.05;
const LONGITUDE_DELTA = LATITUDE_DELTA * (width / height);

const layerGroups = {
  BUILDING: true,
  BICYCLE: false,
  CADASTRAL: false,
  MOUNTAIN: false,
  TRAFFIC: false,
  TRANSIT: false,
};

const Join = ({ navigation, route }) => {
  const mapView = useRef(null);
  const now = dayjs();
  const [initialRegion, setInitialRegion] = useState({
    latitude: 37.5670135,
    longitude: 126.978374,
    latitudeDelta: 0.0024,
    longitudeDelta: 0.0024,
  });
  const [hobbiesData, setHobbiesData] = useState([]);
  const [currentData, setCurrentData] = useState([]);

  // useEffect(() => {
  //   initSetData(hobbiesData);
  // }, []);

  const initSetData = async () => {
    const permission = await Geolocation.requestAuthorization('always');
    if (permission === 'granted') {
      Geolocation.getCurrentPosition(
        async pos => {
          const { latitude, longitude } = pos.coords;
          setInitialRegion({
            latitude,
            longitude,
            latitudeDelta: 0.0024,
            longitudeDelta: 0.0024,
          });

          const currentAddress = await userFetchAddress(latitude, longitude);
          const splitAddress = currentAddress.split(" ", 3).join(" ");
          const nearHobbiesData = await getNearHobbies(splitAddress);
          // setHobbiesData(nearHobbiesData);
          console.log('nearHobbiesData, splitAddress =======> ', nearHobbiesData.data, splitAddress);
          const deadlineData = nearHobbiesData.filter(
            v => 
              dayjs(v.data.deadline).diff(now, 'days') >= 0
          );
          setHobbiesData(deadlineData);
        },
        error => { },
        {
          enableHighAccuracy: false,
          timeout: 2000,
        },
      );
    }
  };

  const deadLineHobbiesData = data => {
    const deadlineData = data.filter(
      v => dayjs(v.data._data.deadline).diff(now, 'days') > 0,
    );
    setCurrentData(deadlineData);
  };

  const handleMarkerPress = markerElements => {
    navigation.navigate('Show', markerElements);
  };

  const percentFun = (curr, total) => {
    return Math.round((curr / total) * 100);
  };

  const moveCurrLocation = () => {
    mapView?.current?.setLocationTrackingMode('Follow');
  };

  const onTapMap = (event) => {
    // console.log('event ========> ', event );
  }

  const onCameraChanged = async event => {
    const { latitude, longitude } = event;
    const currentAddress = await userFetchAddress(latitude, longitude);
    const splitAddress = currentAddress.split(' ', 3).join(' ');

    const finalHobbiesData = await getNearHobbies(splitAddress);

    console.log('제스처로 한 주소 ======> ', splitAddress);

    const deadlineData = finalHobbiesData.filter(
      v => 
        dayjs(v.data._data.deadline).diff(now, 'days') >= 0
    );
    setHobbiesData(deadlineData);
  };

  const renderMarker = useCallback(marker => {
    // console.log('marker =====> ', marker);
    return (
      <NaverMapMarkerOverlay
        key={marker.id}
        latitude={marker.data._data.latitude}
        longitude={marker.data._data.longitude}
        onPress={() => handleMarkerPress(marker)}
      />
    );
  }, []);

  const renderItem = ({ item }) => {
    const diffDays = dayjs(item.data._data.deadline).diff(now, 'days');
    const diffHours = dayjs(item.data._data.deadline).diff(now, 'hours');
    const diffMins = dayjs(item.data._data.deadline).diff(now, 'minutes');

    const moveMarkerLocation = () => {
      const Region = {
        latitude: item._data.latitude,
        latitudeDelta: 0,
        longitude: item._data.longitude,
        longitudeDelta: 0,
      };
      const CameraMoveBaseParams = {
        duration: 700,
        easing: 'EaseOut',
        pivot: {
          x: 0.5,
          y: 0.5,
        },
      };
      mapView?.current?.animateRegionTo(Region, CameraMoveBaseParams);
    };

    return (
      <TouchableOpacity
        activeOpacity={0.6}
        style={styles.listView}
        onPress={moveMarkerLocation}>
        <View
          style={{
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: 'row',
            paddingTop: 8,
          }}>
          <Text style={styles.listTitle}>{item.data._data.title}</Text>
          {percentFun(
            item.data._data.personNumber,
            item.data._data.peopleCount,
          ) < 50 ? (
            <Text
              style={[
                styles.listRcruit,
                { color: '#07AC7D', fontWeight: 'bold' },
              ]}>
              모집중
            </Text>
          ) : percentFun(
            item.data._data.personNumber,
            item.data._data.peopleCount,
          ) == 100 ? (
            <Text
              style={[
                styles.listRcruit,
                { color: '#898989', fontWeight: 'bold' },
              ]}>
              모집마감
            </Text>
          ) : (
            <Text
              style={[
                styles.listRcruit,
                { color: '#E4694E', fontWeight: 'bold' },
              ]}>
              마감임박
            </Text>
          )}
        </View>
        <View
          style={{
            justifyContent: 'space-between',
            alignItems: 'stretch',
            flexDirection: 'row',
          }}>
          <Text style={styles.listLocation}>{item.data._data.address}</Text>
          <Text
            style={[styles.listRcruit, { color: '#4E8FE4', fontWeight: 'bold' }]}>
            {item.data._data.personNumber} \ {item.data._data.peopleCount} 명
          </Text>
        </View>
        <View>
          <Text>{item.data._data.tag}</Text>
        </View>
        <View
          style={{
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: 'row',
          }}>
          <Text>
            <Text style={{ fontWeight: 'bold' }}>{diffDays}</Text> 일{' '}
            <Text style={{ fontWeight: 'bold' }}>{diffHours % 24}</Text> 시간{' '}
            <Text style={{ fontWeight: 'bold' }}>{diffMins % 60}</Text> 분 전
          </Text>
          {percentFun(
            item.data._data.personNumber,
            item.data._data.peopleCount,
          ) == 100 ? (
            <TouchableOpacity
              style={[styles.showBtn, { backgroundColor: '#898989' }]}
              onPress={() => navigation.navigate('Show', route)}>
              <Text
                style={[
                  styles.showCommText,
                  { fontWeight: 'bold', fontSize: 14, color: '#FEFFFE' },
                ]}>
                모집마감
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.showBtn}
              onPress={() => navigation.navigate('Show', item)}>
              <Text
                style={[
                  styles.showCommText,
                  { fontWeight: 'bold', fontSize: 14, color: '#FEFFFE' },
                ]}>
                참여신청
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.searchView}>
        <TouchableOpacity
          style={{ marginLeft: 'auto', paddingTop: 10 }}
          onPress={moveCurrLocation}>
          <Image source={currGpsIcon} style={{ width: 40, height: 40 }} />
        </TouchableOpacity>
      </View>
      <View style={{ bottom: 30, position: 'absolute', zIndex: 2 }}>
        <FlatList
          data={hobbiesData}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          style={{ paddingLeft: 8 }}
          automaticallyAdjustContentInsets={false}
          decelerationRate="fast"
          pagingEnabled
          snapToInterval={width / 1.3 + 20}
          snapToAlignment="start"
        />
      </View>
      <NaverMapView
        ref={mapView}
        style={{ flex: 1 }}
        layerGroups={layerGroups}
        initialRegion={initialRegion}
        locale={'ko'}
        animationDuration={2}
        isShowIndoorLevelPicker={true}
        isShowLocationButton={false}
        onCameraChanged={onCameraChanged}
        onTapMap={onTapMap}
        isStopGesturesEnabled={true}
        isExtentBoundedInKorea
        maxZoom={15}
        minZoom={5}>
        {hobbiesData.map(v => renderMarker(v))}
      </NaverMapView>
    </SafeAreaView>
  );
};

const currGpsIcon = require('../../assets/newIcons/currGpsIcon.png');

const styles = StyleSheet.create({
  searchView: {
    width: width,
    paddingHorizontal: 16,
    marginTop: 20,
    position: 'absolute',
    zIndex: 2,
    top: 60,
    paddingBottom: 10,
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
    fontSize: 16,
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
    color: '#FFF',
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
    height: 24,
  },
  listView: {
    width: width / 1.3,
    height: width / 2.4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    marginHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#07AC7D',
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
    fontWeight: '600',
  },
  listRcruit: {
    fontFamily: 'Pretendard',
    fontSize: 12,
    fontWeight: 'bold',
  },
  listLocation: {
    color: '#07AC7D',
    width: 200,
    fontFamily: 'Pretendard',
    fontWeight: 'bold',
  },
  showBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#07AC7D',
  },
  showCommText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#FEFFFE',
  },
});

export default Join;
