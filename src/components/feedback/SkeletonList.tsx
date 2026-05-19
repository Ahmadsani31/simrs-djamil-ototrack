import { View } from 'react-native';
import FadeInView from '@/components/feedback/FadeInView';
import Skeleton from '@/components/feedback/Skeleton';

interface SkeProps {
  loop: number;
}

export default function SkeletonList({ loop }: SkeProps) {
  return (
    <View className="gap-3">
      {Array.from({ length: loop }).map((_, i) => (
        <View className="rounded-lg bg-gray-100" key={i}>
          <FadeInView className="flex-row items-center space-x-4 p-4">
            <View className="flex-1 gap-2 space-y-2 ps-3">
              <Skeleton colorMode="light" height={16} width="100%" radius="round" />
              <Skeleton colorMode="light" height={16} width="75%" radius="round" />
              <Skeleton colorMode="light" height={16} width="85%" radius="round" />
            </View>
          </FadeInView>
        </View>
      ))}
    </View>
  );
}
