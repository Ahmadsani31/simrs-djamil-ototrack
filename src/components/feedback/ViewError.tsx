import { AntDesign } from '@expo/vector-icons';
import { Text, View } from 'react-native';
interface ErrorProps {
  plaintext: string;
}

export default function ViewError({ plaintext }: ErrorProps) {
  return (
    <View className="my-4 flex-row items-center rounded-lg bg-red-300 p-4">
      <AntDesign name="exclamation-circle" size={24} color="black" />
      <View className="ms-2">
        <Text className="font-medium">{plaintext}</Text>
      </View>
    </View>
  );
}
