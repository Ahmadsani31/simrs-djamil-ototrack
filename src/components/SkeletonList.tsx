import { View } from "react-native";
import SkeletonItem from "./SkeletonItem";

interface SkeProps {
  loop:number
}

export default function SkeletonList({loop}:SkeProps) {
    return (
      <View className="gap-3 px-4">
        {Array.from({ length: loop }).map((_, i) => (
          <SkeletonItem key={i} />
        ))}
      </View>
    );
  }
  