import { Button, Text, View } from "react-native";
import { Link, useRouter } from "expo-router";

export default function DetailScreen() {
  const router = useRouter();

  return (
    <View className="justify-center flex-1 p-4">
      <Text>Second Screen</Text>
      <Link href="/second/nested" push asChild>
        <Button title="Push to /second/nested" />
      </Link>
      <Button
        title="Back"
        onPress={() => {
          router.back();
        }}
      />
    </View>
  );
}

/**
 * /index
 * /second (stack)
 *   /second/index
 *   /second/nested
 *   /second/also-nested
 * /third
 * /fourth
 */