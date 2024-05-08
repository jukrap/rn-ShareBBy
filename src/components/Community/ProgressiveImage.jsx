import React, { useRef, useEffect } from "react";
import { View, StyleSheet, Animated } from "react-native";

const ProgressiveImage = ({ defaultImageSource, source, style, ...props }) => {
	const defaultImageOpacity = useRef(new Animated.Value(0)).current;
	const imageOpacity = useRef(new Animated.Value(0)).current;

	// 기본 이미지 투명도 애니메이션 시작
	useEffect(() => {
		Animated.timing(defaultImageOpacity, {
			toValue: 1,
			useNativeDriver: true,
		}).start();
	}, [defaultImageOpacity]);

	// 실제 이미지 투명도 애니메이션 시작
	useEffect(() => {
		Animated.timing(imageOpacity, {
			toValue: 1,
			useNativeDriver: true,
		}).start();
	}, [imageOpacity]);

	return (
		<View style={styles.container}>
			{/* 기본 이미지 */}
			<Animated.Image
				{...props}
				source={defaultImageSource}
				style={[style, { opacity: defaultImageOpacity, borderRadius: 10 }]}
				blurRadius={1}
			/>
			{/* 실제 이미지 */}
			<Animated.Image {...props} source={source} style={[style, { opacity: imageOpacity }, styles.imageOverlay]} />
		</View>
	);
};

export default ProgressiveImage;

const styles = StyleSheet.create({
	container: {},
	imageOverlay: {
		position: "absolute",
		top: 0,
		bottom: 0,
		left: 0,
		right: 0,
		borderRadius: 10,
	},
});