import React, { useState } from 'react';
import { TextInput, View, StyleSheet, TextInputProps, Text } from 'react-native';

type Props = TextInputProps & {
  onFormattedValue?: (rawValue: string) => void;
  label: string;
  placeholder: string;
  error?: string;
  className?: string;
};

const CustomNumberInput = ({
  onFormattedValue,
  label,
  placeholder,
  error,
  className,
  ...props
}: Props) => {
  const [value, setValue] = useState('');

  const formatNumber = (text: string) => {
    // Remove non-digit characters
    const raw = text.replace(/\D/g, '');

    // Format with thousand separator
    const formatted = raw.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    setValue(formatted);
    if (onFormattedValue) onFormattedValue(raw);
  };

  return (
    <View className="mb-4">
      {label && <Text className="mb-1 font-bold text-gray-700">{label}</Text>}
      <TextInput
        {...props}
        value={value}
        onChangeText={formatNumber}
        keyboardType="numeric"
        className={`border ${error ? 'border-red-500' : 'border-gray-500'} rounded-lg p-3 ${className}`}
        placeholder={placeholder}
      />
      {error && <Text className="mt-1 text-xs text-red-500">{error}</Text>}
    </View>
  );
};

export default CustomNumberInput;
