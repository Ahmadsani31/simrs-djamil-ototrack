import React, { useState } from 'react';
import { AntDesign } from '@expo/vector-icons';
import { StyleSheet, View, Button, SafeAreaView, Image, TouchableHighlight, Text } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

function AccordionItem({
    isExpanded,
    children,
    viewKey,
    style,
    duration = 500,
}: any) {
    const height = useSharedValue(0);

    const derivedHeight = useDerivedValue(() =>
        withTiming(height.value * Number(isExpanded.value), {
            duration,
        })
    );
    const bodyStyle = useAnimatedStyle(() => ({
        height: derivedHeight.value,
    }));

    return (
        <Animated.View
            key={`accordionItem_${viewKey}`}
            style={[styles.animatedView, bodyStyle, style]}>
            <View
                onLayout={(e) => {
                    height.value = e.nativeEvent.layout.height;
                }}
                style={styles.wrapper}>
                {children}
            </View>
        </Animated.View>
    );
}

function Item() {
    return <View style={styles.box} />;
}

export default function ImagePriview({ uriImage,index }: any) {
    const open = useSharedValue(false);
    const [nameIcon, setNameIcon] = useState(true)
    const onPress = () => {
        open.value = !open.value;
        setNameIcon(!nameIcon)
    };
    return (
        <View key={index}>
            <TouchableHighlight onPress={onPress} className='p-1 bg-gray-300 rounded-lg '>
                <View className='flex-row items-center'>
                    <AntDesign name={nameIcon?'upcircle':'downcircle'} size={14} color="black" />
                    <Text className='ms-5 text-center'>show image</Text>
                </View>
            </TouchableHighlight>
            <View className='flex-1 w-full'>
                <AccordionItem isExpanded={open} viewKey="Accordion">
                    <Image className='w-full aspect-[3/4] rounded-lg' source={{ uri: uriImage }} />
                </AccordionItem>
            </View>
        </View>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingTop: 24,
    },
    buttonContainer: {
        flex: 1,
        paddingBottom: 10,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    parent: {
        width: 200,
    },
    wrapper: {
        width: '100%',
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
    },
    animatedView: {
        width: '100%',
        overflow: 'hidden',
    },
    box: {
        height: 120,
        width: 120,
        color: '#f8f9ff',
        backgroundColor: '#b58df1',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
