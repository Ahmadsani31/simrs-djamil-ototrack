import React from 'react';
import { TextInput, Text, View } from 'react-native';

// const inputMode = enum('decimal', 'email', 'none', 'numeric', 'search', 'tel', 'text', 'url')

interface InputProps {
  label?: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  error?: string;
  className?: string;
  inputMode?: any;
  autoFocus?: boolean;
}

export default function Input({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  error,
  className,
  inputMode = 'text',
  autoFocus,
}: InputProps) {
  return (
    <View className="mb-4">
      {label && <Text className="mb-1 font-bold text-gray-700">{label}</Text>}
      <TextInput
        className={`border ${error ? 'border-red-500' : 'border-gray-500'} rounded-lg p-3 ${className}`}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        inputMode={inputMode}
        autoFocus={autoFocus}
      />
      {error && <Text className="mt-1 text-xs text-red-500">{error}</Text>}
    </View>
  );
}
