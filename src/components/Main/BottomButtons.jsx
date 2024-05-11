import React, { useCallback, useMemo, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Animated, Easing, Pressable, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const PressalbeAnimated = Animated.createAnimatedComponent(Pressable);

const BottomButtons = ({ peopleCount, joinUsers, showValue, onLikePress, rightButtonText, onPressToken }) => {
    const insets = useSafeAreaInsets();
    const likeValue = useRef(new Animated.Value(0)).current;
    const pressValue = useRef(new Animated.Value(0)).current;
    const scrapValue = useRef(new Animated.Value(0)).current;

    const pressAnimated = (value) => Animated.timing(pressValue, { toValue: value, useNativeDriver: true, duration: 100 });
    const scrapAnimated = (value) => Animated.timing(scrapValue, { toValue: value, useNativeDriver: true, duration: 200 });


    const onPressOne = useCallback(() => {
        if (rightButtonText) {
            scrapAnimated(1).start(({ finished }) => {
                if (finished) {
                    scrapAnimated(0).start();
                }
            });
        } else {
            Animated.timing(likeValue, {
                toValue: 1,
                useNativeDriver: true,
                easing: Easing.bounce,
                duration: 400,
            }).start(() =>
                Animated.timing(likeValue, {
                    toValue: 0,
                    useNativeDriver: true,
                    duration: 200,
                }).start(),
            );
        }
        return onLikePress();
    }, [onLikePress, rightButtonText]);

    return (
        <Animated.View
            style={{
                ...styles.bottom,
                paddingBottom: insets.bottom + 8,
                paddingTop: Math.floor(23 * 0.6764705882),
                transform: [
                    {
                        translateY: showValue.interpolate({
                            inputRange: [0, 1],
                            outputRange: [95, 0],
                        }),
                    },
                ],
            }}
        >
            {/* <View style={styles.bottomItem}> */}
                <View style={{ gap : 8}}>
                    <Text style={{ fontSize: 14, fontWeight: 600, color: '#898989' }}>참여가능인원</Text>
                    <Text style={{ fontSize : 12, color: '#898989' }}><Text style={{ color: '#07AC7D' }}>{joinUsers.length}명</Text> / {peopleCount}명</Text>
                </View>
                <TouchableOpacity 
                    style={{ paddingHorizontal: 26, paddingVertical: 12, borderRadius: 8, backgroundColor: '#07AC7D' }}
                    onPress={onPressToken}
                >
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>참여하기</Text>
                </TouchableOpacity>
            {/* </View> */}

        </Animated.View>
    );
};

const styles = StyleSheet.create({
    bottom: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        borderStyle: 'solid',
        borderColor: '#07AC7D',
        borderWidth: 0.5,
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    bottomItem: {
        flexDirection: 'row',
        height: 36,
        justifyContent : 'space-between',
        alignItems : 'center'
    },
    button: {
        flex: 1,
        marginLeft: 24,
        paddingVertical: 10,
        backgroundColor: '#4AABFF',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default React.memo(BottomButtons);
