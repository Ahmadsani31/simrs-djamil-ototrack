import React from 'react';
import { View } from 'react-native';
import Skeleton from '@/components/feedback/Skeleton';
import FadeInView from '@/components/feedback/FadeInView';

export default function SkeletonItem() {
  return (
    <View className="rounded-lg bg-gray-100">
      <FadeInView className="flex-row items-center space-x-4 p-4">
        {/* Text Lines */}
        <View className="flex-1 gap-2 space-y-2 ps-3">
          <Skeleton colorMode="light" height={16} width="100%" radius="round" />
          <Skeleton colorMode="light" height={16} width="75%" radius="round" />
          <Skeleton colorMode="light" height={16} width="85%" radius="round" />
        </View>
      </FadeInView>
    </View>
  );
}
