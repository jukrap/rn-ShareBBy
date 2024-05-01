import React, { useRef, useState } from "react";
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Image, FlatList } from "react-native";

const { width, height } = Dimensions.get('window');

const Main = ({ navigation, route }) => {
    const [optionClick, setOptionClick] = useState(null);
    // const { userId, nickname } = route.params;

    const handleOptionClick = (id) => {
        setOptionClick(id);
    }

    // eventBar index
    // const viewabilityConfig = useRef({
    //     itemVisiblePercentThreshold : 50
    // });

    // const onViewableItemsChanged = useRef(({ viewableItems, changed}) => {
    //     console.log(viewableItems);
    //     if(viewableItems.length > 0){
    //         console.log(viewableItems[0].index);
    //     }
    // }).current;

    const renderItem = ({ item }) => {
        return (
            <View>
                <Image source={item.bgImg} opacity={0.6} style={{ width: width }} />
                <Text style={{ width: 260, left: 50, top: 120, position: 'absolute', zIndex: 2, fontSize: 28, fontWeight: 600, color: '#fff' }}>{item.content}</Text>
            </View>
        )
    }

    const optionItem = ({ item }) => {
        return (
            <TouchableOpacity
                style={{ justifyContent: 'center', paddingLeft: 30, paddingRight: 10, paddingVertical: 20 }}
                onPress={() => handleOptionClick(item.id)}>
                <Text style={{ fontWeight: '600', color: optionClick === item.id ? '#07AC7D' : '#A7A7A7' }}>{item.option}</Text>
            </TouchableOpacity>
        )
    }
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.topbarView}>
                <Text style={{ fontSize: 24, fontWeight: 700, color: '#07AC7D' }}>ShareBBy</Text>
            </View>
            <View style={{ alignItems: 'center', flexDirection: 'row', gap: 10, borderBottomWidth: 1, borderBottomColor: '#DBDBDB' }}>
                <FlatList
                    data={topOption}
                    renderItem={optionItem}
                    keyExtractor={item => item.id.toString()}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false} />
            </View>
            <ScrollView style={{ height: '50%' }}>
                <View>
                {/* <View style={{ width: 80, height: 30, alignItems: 'center', justifyContent: 'center', position: 'absolute', zIndex: 2, right: 20, bottom: 20, borderRadius: 20, backgroundColor: 'rgba(1, 0, 0, 0.5)' }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>1 / {topOption.length}</Text>
                </View> */}
                    <FlatList
                        data={eventBanner}
                        renderItem={renderItem}
                        keyExtractor={item => 
                            item.id.toString()
                            }
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        automaticallyAdjustContentInsets={false}
                        decelerationRate="fast"
                        pagingEnabled
                        snapToInterval={width}
                        snapToAlignment="start"
                        // onViewableItemsChanged={onViewableItemsChanged}
                        // viewabilityConfig={viewabilityConfig.current}
                    />
                    
                </View>
                <View style={styles.divisionView} />
                <View style={{ marginBottom: 20, paddingHorizontal: 16, gap: 6 }}>
                    <View style={styles.hobbyNameView}>
                        <Image source={dummyProfileIcon} style={{ width: 20, height: 20 }} />
                        <Text style={[styles.nomalText, { fontSize: 16, color: '#07AC7D' }]}>김준엽<Text style={[styles.nomalText, { fontWeight: '500' }]}> 님, 취미활동 하러 가보실까요?</Text></Text>
                    </View>
                    <View style={{ justifyContent: 'space-between', flexDirection: 'row' }}>
                        <TouchableOpacity activeOpacity={0.8}
                            style={[styles.hobbyBox, {backgroundColor : '#703CA0'}]}
                            onPress={() => navigation.navigate('Recruit')}>
                            <Image source={goRecruit} style={{ width: 100, height: 100, marginTop: 'auto' }} />
                            <Text style={styles.hobbyText}>모집하기</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.hobbyBox, {backgroundColor : '#E8C257'}]}
                            onPress={() => navigation.navigate('Join')}>
                            <Image source={goJoin} style={{ width: 100, height: 100, marginTop: 'auto' }} />
                            <Text style={styles.hobbyText}>참여하기</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.divisionView} />
                <View style={styles.joinBox}>
                    <Text style={[styles.nomalText, { fontSize: 16, fontWeight: '600' }]}>이달의 참여왕은? 🔥</Text>
                    <Text style={[styles.nomalText, { fontSize: 14, fontWeight: '600', color: '#7B7B7B' }]}>현재 가장 많이 취미활동에 참여한 유저는 누구일까요?</Text>
                    <View style={{ gap: 10, marginTop: 10 }}>
                        <View style={styles.gradeUpView}>
                            <View style={[styles.gradeUp, {top : 20}]}>
                                <Image source={dummyProfileIcon} style={{ width: 55, height: 55 }} />
                                <View style={styles.gradeNum}>
                                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>2</Text>
                                </View>
                                <Text style={{ fontSize: 16, fontWeight: '600' }}>장혜림</Text>
                            </View>
                            <View style={styles.gradeUp}>
                                <Image source={dummyProfileIcon} />
                                <View style={styles.gradeNum}>
                                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>1</Text>
                                </View>
                                <Text style={{ fontSize: 16, fontWeight: '600' }}>김한솔</Text>
                            </View>
                            <View style={[styles.gradeUp, {top : 20}]}>
                                <Image source={dummyProfileIcon} style={{ width: 55, height: 55 }} />
                                <View style={styles.gradeNum}>
                                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>3</Text>
                                </View>
                                <Text style={{ fontSize: 16, fontWeight: '600' }}>김선구</Text>
                            </View>
                        </View>
                        <View style={{ marginTop: 20, borderTopWidth: 1, borderTopColor: '#DBDBDB' }}>
                            <View style={styles.gradeLow}>
                                <Text>4등</Text>
                                <Image source={dummyProfileIcon} style={{ width: 36, height: 36 }} />
                                <Text>김준엽</Text>
                            </View>
                            <View style={styles.gradeLow}>
                                <Text>5등</Text>
                                <Image source={dummyProfileIcon} style={{ width: 36, height: 36 }} />
                                <Text>박주철</Text>
                            </View>
                            <View style={styles.gradeLow}>
                                <Text>6등</Text>
                                <Image source={dummyProfileIcon} style={{ width: 36, height: 36 }} />
                                <Text>이나겸</Text>
                            </View>

                        </View>
                    </View>
                </View>
                <View style={styles.divisionView} />
            </ScrollView>
        </SafeAreaView>
    )
}
const dropDownIcon = require('../../assets/icons/dropDownIcon.png');
const goJoin = require('../../assets/images/goJoin.png');
const goRecruit = require('../../assets/images/goRecruit.png');
const tennisBg = require('../../assets/images/tennisBg.png');
const dummyProfileIcon = require('../../assets/icons/dummyProfileIcon.png');

const eventBanner = [
    {
        id: 0,
        bgImg: tennisBg,
        content: '성수동에 테니스 카페 착륙!',
    },
    {
        id: 1,
        bgImg: tennisBg,
        content: '성수동에 테니스 카페 착륙!',
    },
    {
        id: 2,
        bgImg: tennisBg,
        content: '성수동에 테니스 카페 착륙!',
    },
    {
        id: 3,
        bgImg: tennisBg,
        content: '성수동에 테니스 카페 착륙!',
    },
    {
        id: 4,
        bgImg: tennisBg,
        content: '성수동에 테니스 카페 착륙!',
    },
]
const topOption = [
    {
        id: 0,
        option: '홈',
    },
    {
        id: 1,
        option: '취미활동',
    },
    {
        id: 2,
        option: '순위',
    },
    {
        id: 3,
        option: '체험단',
    },
    {
        id: 4,
        option: '친구초대',
    },
]
const styles = StyleSheet.create({
    topbarView: {
        height: 44,
        paddingHorizontal: 24,
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#DBDBDB',
    },
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
        paddingHorizontal: 12,
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
    hobbyNameView : {
        flexDirection: 'row',
        alignItems: 'center', 
        ustifyContent: 'flex-start', 
        paddingVertical: 15, 
        gap: 10 
    },
    hobbyBox : {
        width: 176, 
        height: 176, 
        overflow: 'hidden', 
        borderRadius: 15, 
    },
    hobbyText : {
        left: 45, 
        top: 70, 
        fontSize: 24, 
        fontWeight: '700', 
        color: '#fff', 
        position: 'absolute', 
        zIndex: 2
    },
    joinBox : {
        marginBottom: 20, 
        paddingHorizontal: 16, 
        paddingTop: 15, 
        gap: 6
    },
    gradeUpView : {
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexDirection: 'row', 
        paddingHorizontal: 16 
    },
    gradeUp : {
        gap: 16, 
        alignItems: 'center', 
        justifyContent: 'center',
    },
    gradeLow : {
        justifyContent: 'flex-start', 
        alignItems: 'center', 
        flexDirection: 'row', 
        paddingVertical: 12, 
        paddingHorizontal: 16,
        gap: 10, 
        borderBottomWidth: 1, 
        borderBottomColor: '#DBDBDB'
    },
    gradeNum : {
        width: 24, 
        height: 24, 
        bottom: 20, 
        position: 'absolute', 
        zIndex: 2, 
        borderRadius: 50, 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: '#4AABFF'
    },
    divisionView: {
        width: width,
        height: 10,
        backgroundColor: '#E6E6E6'
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
        fontSize: 14,
        fontWeight: 'bold',
    },
    howText: {
        color: '#fff',
        fontFamily: 'Pretendard',
        fontSize: 16,

    },
    icon: {
        width: 24,
        height: 24
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
        fontWeight: 600,
    },
    listRcruit: {
        fontFamily: 'Pretendard',
        fontSize: 12,
        fontWeight: 700,
    },
    listLocation: {
        color: '#07AC7D',
        width: 200,
        fontFamily: 'Pretendard',
        fontWeight: 400,
    },
    showBtn: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#07AC7D'
    }

})

export default Main;