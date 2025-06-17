import React from 'react';
import { TextInput, Text, View } from 'react-native';

interface InputAreaProps {
  label?: string;
  placeholder: string;
  value: string;
  onChangeText?: (text: string) => void;
  error?: string;
  className?: string;
}

export default function InputArea({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  className
}: InputAreaProps) {

  return (
    <View className="mb-4">
      {label && <Text className="text-gray-700 mb-1 font-bold">{label}</Text>}
      <TextInput
        className={`border ${error ? 'border-red-500' : 'border-gray-500'} min-h-24 rounded-lg p-3 ${className}`}
        multiline
        numberOfLines={5}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        textAlignVertical="top"
      />
      {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}
    </View>
  );
}