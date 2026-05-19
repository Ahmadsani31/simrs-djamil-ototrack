import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  classname?: string;
  variant?: 'primary' | 'secondary';
}

export default function ButtonCostum({
  title,
  onPress,
  classname,
  loading = false,
  variant = 'primary',
}: ButtonProps) {
  const textColor = variant === 'primary' ? 'text-white' : 'text-gray-800';

  return (
    <View className="my-2">
    <TouchableOpacity
      className={`${classname} py-3 px-4 rounded-lg items-center justify-center`}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? 'white' : 'gray'} />
      ) : (
        <Text className={`${textColor} font-bold`}>{title}</Text>
      )}
    </TouchableOpacity>
    </View>
  );
}