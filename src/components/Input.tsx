import React from 'react';
import { TextInput, Text, View } from 'react-native';

interface InputProps {
  label?: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  error?: string;
  className?: string;
}

export default function Input({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  error,
  className
}: InputProps) {

  return (
    <View className="mb-4">
      {label && <Text className="text-gray-700 mb-1 font-bold">{label}</Text>}
      <TextInput
        className={`border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 ${className}`}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
      />
      {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}
    </View>
  );
}