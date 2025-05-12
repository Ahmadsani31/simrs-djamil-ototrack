import { View } from "react-native";
import SkeletonItem from "./SkeletonItem";
import { MotiView } from "moti";
import { Skeleton } from "moti/skeleton";

interface SkeProps {
  loop: number
}

export default function SkeletonList({ loop }: SkeProps) {
  return (
    <View className="gap-3">
      {Array.from({ length: loop }).map((_, i) => (
        <View className='bg-gray-100 rounded-lg' key={i} >
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 300 }}
            className="flex-row items-center space-x-4 p-4"
          >
            <View className="flex-1 space-y-2 ps-3 gap-2">
              <Skeleton
                colorMode="light"
                height={16}
                width="100%"
                radius="round"
              />
              <Skeleton
                colorMode="light"
                height={16}
                width="75%"
                radius="round"
              />
              <Skeleton
                colorMode="light"
                height={16}
                width="85%"
                radius="round"
              />
            </View>
          </MotiView>
        </View>
      ))}
    </View>
  );
}
