import React from 'react';
import { View } from 'react-native';
import { Skeleton } from 'moti/skeleton';
import { MotiView } from 'moti';

export default function SkeletonItem() {
    return (
        <View className='bg-gray-100 rounded-lg'>
            <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ type: 'timing', duration: 300 }}
                className="flex-row items-center space-x-4 p-4"
            >
                {/* Avatar */}
                <Skeleton
                    colorMode="light"
                    height={68}
                    width={68}
                    radius="round"
                />

                {/* Text Lines */}
                <View className="flex-1 space-y-2 ps-3 gap-2">
                    <Skeleton
                        colorMode="light"
                        height={14}
                        width="100%"
                        radius="round"
                    />
                    <Skeleton
                        colorMode="light"
                        height={14}
                        width="75%"
                        radius="round"
                    />
                    <Skeleton
                        colorMode="light"
                        height={14}
                        width="75%"
                        radius="round"
                    />
                </View>
            </MotiView>
        </View>
    )
}
