import React, { useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, Dimensions, Image } from 'react-native';

const { width, height } = Dimensions.get('window');

const TopTab = ({ navigation, route, leftFunc, rightFunc, onPressRight, title }) => {

    return (
        <SafeAreaView style={{ backgroundColor: '#FEFFFE' }}>
            <View style={styles.topbarView}>
                <View style={styles.commonRate}>
                    <TouchableOpacity
                        onPress={() => { navigation.goBack() }}
                        style={styles.commonRate}>
                        {
                            leftFunc ? (<Text style={styles.topText}>{leftFunc}</Text>) : 
                            (<Image source={backIcon} style={{ width: 20, height: 20 }} />)
                        }
                        
                    </TouchableOpacity>
                    <Text style={{fontWeight : '700', fontSize : 16}}>{title}</Text>
                    <TouchableOpacity
                        onPress={onPressRight}
                        style={[styles.commonRate, { gap: 10 }]}>
                        {
                            rightFunc ? ( <Text style={styles.topText}>{rightFunc}</Text>) : (
                                <View style={{width : 20}} />
                            )
                        }
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    )
}

const backIcon = require('../../assets/icons/backIcon.png');

const styles = StyleSheet.create({
    commonRate: {
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row'
    },
    topbarView: {
        height: 44,
        paddingHorizontal: 16,
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#DBDBDB',
    },
    topText: {
        color: '#07AC7D',
        fontFamily: 'Pretendard',
        fontSize: 18,
        fontWeight: 400,
    },
})

export default TopTab;