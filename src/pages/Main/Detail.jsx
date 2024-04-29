import React, { useRef, useState } from "react";
import { SafeAreaView, Text, View, TextInput, TouchableOpacity, Dimensions, StyleSheet, Image, FlatList, ScrollView } from "react-native";
import DatePicker from 'react-native-date-picker'
import Modal from "react-native-modal";

import Tobbar from '../../components/Main/TobTab'

const { width, height } = Dimensions.get('window');

const Detail = ({ route, navigation }) => {
    const { pickAddress, pickLatitude, pickLongitude } = route.params;
    const [date, setDate] = useState(new Date())
    const [writeDate, setWrtieDate] = useState(new Date()) // 내가 쓴 모집글 시간을 저장
    const [isDateModal, setIsDateModal] = useState(false)
    const [isPeopleModal, setIsPeopleModal] = useState(false)
    const [saveDate, setSaveDate] = useState('');
    const [detailContent, setDetailConetent] = useState({
        address: pickAddress,
        latitude: pickLatitude,
        longitude: pickLongitude,
        detailAddress: '',
        showTag: '',
        deadLine: saveDate,
        peopleCount: '',
        showTitle: '',
        showContent: '',
    });
    const [currTextlength, setCurrTextlength] = useState(0);
    const [isTextClick, setIsTextClick] = useState({
        detailAddress: false,
        showTag: false,
        deadLine: false,
        peopleCount: false,
        showTitle: false,
        showContent: false,
    });
    const [isModalVisible, setIsModalVisible] = useState(false);


    const handleInputContent = (name, value) => {
        setDetailConetent({
            ...detailContent,
            [name]: value,
        });
    };

    const countTextLength = (text) => {
        setCurrTextlength(text.length)
    }

    const handleFocus = (name) => {
        setIsTextClick(prev => ({
            ...prev,
            [name]: true
        }))
    }

    const handleBlur = (name) => {
        setIsTextClick(prev => ({
            ...prev,
            [name]: false
        }))
    }


    const renderItem = ({ item }) => {
        return (
            <View>
                <TouchableOpacity
                    style={styles.renderOption}
                    onPress={() => {
                        handleInputContent('peopleCount', item.count)
                        setIsPeopleModal(false)
                        handleBlur('peopleCount')
                    }}>
                    <Text style={[styles.commonText, { fontSize: 18, fontWeight: 500, }]}>{item.count} 명</Text>
                </TouchableOpacity>
                <View style={{ borderBottomWidth: 1, borderBottomColor: '#DBE0DD' }} />
            </View>
        )
    }

    const onPressRight = () => {
        setIsModalVisible(!isModalVisible)
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FEFFFE' }}>
            <Tobbar navigation={navigation} route={detailContent} rightFunc='등록' onPressRight={onPressRight} />
            <ScrollView style={{ marginTop: 40, paddingHorizontal: 24, gap: 24 }}>
                <View style={{ paddingVertical: 10, gap: 24 }}>
                    <View style={styles.detailOption}>
                        <View style={styles.detailIndex}>
                            <Text style={[styles.commonText, { color: '#A7A7A7' }]}>주소</Text>
                        </View>
                        <View style={styles.addrView}>
                            <Text style={[styles.commonText, { color: '#A7A7A7' }]}>{pickAddress}</Text>
                        </View>
                    </View>
                    <View style={styles.detailOption}>
                        <View style={styles.detailIndex}>
                            <Text style={[styles.commonText, isTextClick.detailAddress ? { color: '#07AC7D' } : { color: '#A7A7A7' }]}>상세 주소</Text>
                        </View>
                        <TextInput
                            placeholder='자세한 주소를 써주세요!'
                            placeholderTextColor="#A7A7A7"
                            style={[styles.textInput, isTextClick.detailAddress ? { borderColor: '#07AC7D' } : { borderColor: '#A7A7A7' }]}
                            onChangeText={(text) => handleInputContent('detailAddress', text)}
                            onFocus={() => handleFocus('detailAddress')}
                            onBlur={() => handleBlur('detailAddress')} />
                    </View>
                    <View style={styles.detailOption}>
                        <View style={styles.detailIndex}>
                            <Text style={[styles.commonText, isTextClick.showTag ? { color: '#07AC7D' } : { color: '#A7A7A7' }]}>태그</Text>
                        </View>
                        <TextInput
                            placeholder='태그를 입력해주세요!'
                            placeholderTextColor="#A7A7A7"
                            style={[styles.textInput, isTextClick.showTag ? { borderColor: '#07AC7D' } : { borderColor: '#A7A7A7' }]}
                            onChangeText={(text) => handleInputContent('showTag', text)}
                            onFocus={() => handleFocus('showTag')}
                            onBlur={() => handleBlur('showTag')} />
                    </View>
                    <TouchableOpacity 
                        style={styles.detailOption}
                        onPress={() => {
                            setIsDateModal(true)
                            handleFocus('deadLine')}}
                        
                    >
                        <View style={styles.detailIndex}>
                            <Text style={[styles.commonText, isTextClick.deadLine ? { color: '#07AC7D' } : { color: '#A7A7A7' }]}>모집시간</Text>
                        </View>
                        <View style={[styles.datePickView, isTextClick.deadLine ? { borderColor: '#07AC7D' } : { borderColor: '#A7A7A7' }]}>
                            <Text style={[styles.commonText, { paddingTop: 10, color: '#A7A7A7' }]}>{date.getMonth() + 1} 월 {date.getDate()} 일 {date.getHours()} 시 {date.getMinutes()} 분 까지</Text>
                            <View style={{ marginLeft: 'auto', justifyContent: 'center' }}>
                                <Image source={isTextClick.deadLine ? dropDownOnIcon : dropDownOffIcon} style={{ width: 30, height: 30 }} />
                            </View>
                            <DatePicker
                                title='날짜 및 시간을 선택해주세요!'
                                locale='kor'
                                confirmText="확인"
                                cancelText="취소"
                                minuteInterval={5}
                                modal
                                open={isDateModal}
                                date={date}
                                onConfirm={(date) => {
                                    setIsDateModal(false)
                                    setDate(date)
                                    handleInputContent('deadLine', `${date.getMonth() + 1} 월 ${date.getDate()} 일 ${date.getHours()} 시 ${date.getMinutes()} 분 까지`)
                                    handleBlur('deadLine')
                                }}
                                onCancel={() => {
                                    setIsDateModal(false)
                                    handleBlur('deadLine')

                                }}
                            />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.detailOption}
                        onPress={() => {
                            setIsPeopleModal(true)
                            handleFocus('peopleCount')
                        }}>
                        <View style={styles.detailIndex}>
                            <Text style={[styles.commonText, isTextClick.peopleCount ? { color: '#07AC7D' } : { color: '#A7A7A7' }]}>모집인원</Text>
                        </View>
                        <View style={[styles.datePickView, isTextClick.peopleCount ? { borderColor: '#07AC7D' } : { borderColor: '#A7A7A7' }]}>
                            <Text style={[styles.commonText, { paddingTop: 10, color: '#A7A7A7' }]}>{detailContent.peopleCount} 명</Text>
                            <View style={{ marginLeft: 'auto', justifyContent: 'center' }}>
                            <Image source={isTextClick.peopleCount ? dropDownOnIcon : dropDownOffIcon} style={{ width: 30, height: 30 }} />
                            </View>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.detailOption}>
                        <View style={styles.detailIndex}>
                            <Text style={[styles.commonText, isTextClick.showTitle ? { color: '#07AC7D' } : { color: '#A7A7A7' }]}>타이틀</Text>
                        </View>
                        <TextInput
                            placeholder='취미 모집 공고에 올릴 제목을 작성해주세요!'
                            placeholderTextColor="#A7A7A7"
                            style={[styles.textInput, isTextClick.showTitle ? { borderColor: '#07AC7D' } : { borderColor: '#A7A7A7' }]}
                            onChangeText={(text) => handleInputContent('showTitle', text)}
                            onFocus={() => handleFocus('showTitle')}
                            onBlur={() => handleBlur('showTitle')} />
                    </View>
                    <View style={styles.detailOption}>
                        <View style={styles.detailIndex}>
                            <Text style={[styles.commonText, isTextClick.showContent ? { color: '#07AC7D' } : { color: '#A7A7A7' }]}>내용</Text>
                        </View>
                        <TextInput
                            placeholder='취미 모집 공고에 올릴 내용을 작성해주세요!'
                            placeholderTextColor="#A7A7A7"
                            multiline={true}
                            textAlignVertical="top"
                            style={[styles.textInput, { height: 152 }, isTextClick.showContent ? { borderColor: '#07AC7D' } : { borderColor: '#A7A7A7' }]}
                            onChangeText={(text) => {
                                handleInputContent('showContent', text)
                                countTextLength(text)
                            }}
                            onFocus={() => handleFocus('showContent')}
                            onBlur={() => handleBlur('showContent')} />
                        <View style={{ marginLeft: 'auto' }}><Text style={{ color: '#898989' }}>{currTextlength} / 500자</Text></View>
                    </View>
                </View>
            </ScrollView>
            <Modal
                animationIn={"slideInUp"}
                animationOut={"slideOutDown"}
                isVisible={isPeopleModal}
                backdropOpacity={0.8}
                backdropColor="#000"
                style={{ justifyContent: 'flex-end', margin: 0 }}
                onBackdropPress={() => { 
                    setIsPeopleModal(!isPeopleModal)
                    handleBlur('peopleCount')}}
            >
                <View style={{ height: width / 1.3, borderRadius: 10, backgroundColor: '#fff', marginHorizontal: 8, marginBottom: 8 }}>
                    <View style={{ height: 54, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: 14, fontWeight: 700, color: '#898989' }}>인원 수</Text>
                    </View>
                    <FlatList
                        data={countList}
                        renderItem={renderItem}
                        key={item => item.id.toString()}
                        style={{}}
                    />
                    <TouchableOpacity
                        style={{ height: 54, justifyContent: 'center', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#DBE0DD' }}
                        onPress={() => {
                            setIsPeopleModal(false)
                            handleBlur('peopleCount')}}>
                        <Text style={{ fontSize: 18, fontWeight: 700, color: '#1D83FA' }}>확인</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity
                    style={{ height: 54, borderRadius: 10, backgroundColor: '#fff', marginHorizontal: 8, marginBottom: 38, justifyContent: 'center', alignItems: 'center' }}
                    onPress={() => {
                        setIsPeopleModal(false)
                        handleBlur('peopleCount')}}>
                    <Text style={{ fontSize: 18, fontWeight: 700, color: '#1D83FA' }}>취소</Text>
                </TouchableOpacity>
            </Modal>
            <Modal
                animationIn={"bounceIn"}
                animationOut={"bounceOut"}
                isVisible={isModalVisible}
                backdropOpacity={0.7}
                backdropColor='#000'
                onBackdropPress={() => setIsModalVisible(false)}
            >
                <View style={styles.pressLocaView}>
                    <View style={{ height: width / 1.5 }}>
                        <View style={styles.pressTextView}>
                            <Text style={[styles.contentText,]}>주소 : {detailContent.address}</Text>
                            <Text style={[styles.contentText,]}>상세 주소 : {detailContent.detailAddress}</Text>
                            <Text style={[styles.contentText,]}>태그 : {detailContent.showTag}</Text>
                            <Text style={[styles.contentText,]}>모집 기간 : {detailContent.deadLine}</Text>
                            <Text style={[styles.contentText,]}>모집 인원 : {detailContent.peopleCount} 명</Text>
                            <Text style={[styles.contentText, { textAlign: 'center', paddingTop: 16, fontWeight: 600 }]}>제목, 본문 확인하셨나요?</Text>
                        </View>
                        <View style={styles.pressOptionView}>
                            <TouchableOpacity
                                activeOpacity={0.6}
                                style={[styles.pressOptionBtn, { backgroundColor: '#DBDBDB' }]}
                                onPress={() => setIsModalVisible(false)}>
                                <Text style={styles.pressOptionText}>아니요</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                activeOpacity={0.6}
                                style={[styles.pressOptionBtn, { backgroundColor: '#07AC7D' }]}
                                onPress={() => {
                                    navigation.navigate('Join', detailContent)
                                    setIsModalVisible(false)}}>
                                <Text style={styles.pressOptionText}>예</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    )
}

const dropDownOnIcon = require('../../assets/icons/dropDownOnIcon.png');
const dropDownOffIcon = require('../../assets/icons/dropDownOffIcon.png');

const countList = [
    {
        id: 1,
        count: 1,
    },
    {
        id: 2,
        count: 2,
    },
    {
        id: 3,
        count: 3,
    },
    {
        id: 4,
        count: 4,
    },
    {
        id: 5,
        count: 5,
    },
    {
        id: 6,
        count: 6,
    },
    {
        id: 7,
        count: 7,
    },
    {
        id: 8,
        count: 8,
    },
    {
        id: 9,
        count: 9,
    },
    {
        id: 10,
        count: 10,
    }
];

const styles = StyleSheet.create({
    commonText: {
        fontSize: 16,
        fontFamily: 'Pretendard',
        color: '#212529',
    },
    textInput: {
        height: 40,
        paddingHorizontal: 8,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#07AC7D',
        backgroundColor: '#fff',
        fontSize: 16,
        fontFamily: 'Pretendard',
        color: '#212529',
    },
    addrView: {
        height: 40,
        justifyContent: 'center',
        paddingHorizontal: 8,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#A7A7A7',
        backgroundColor: '#fff',
        fontSize: 16,
        fontFamily: 'Pretendard',
        color: '#212529',
    },
    datePickView: {
        height: 40,
        justifyContent: 'center',
        flexDirection: 'row',
        paddingHorizontal: 8,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#A7A7A7',
        backgroundColor: '#fff',
        fontSize: 16,
        fontFamily: 'Pretendard',
    },
    detailOption: {
        marginBottom: 10,
        paddingHorizontal: 8,
        paddingVertical: 5
    },
    detailIndex: {
        top: -3,
        left: 20,
        alignItems: 'center',
        paddingHorizontal: 8,
        position: 'absolute',   
        zIndex: 2,
        backgroundColor: '#fff'
    },
    renderOption: {
        marginVertical: 20,
        paddingHorizontal: 48,
        alignItems: 'center'
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
    pressTextView: {
        marginBottom: 'auto',
        padding : 12,

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
        fontWeight : 'bold',
        color: '#FFF'
    },
    contentText: {
        marginBottom: 6,
        fontSize: 16
    }
})

export default Detail;