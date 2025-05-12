import React, { useState } from 'react';
import { TextInput, View, StyleSheet, TextInputProps, Text } from 'react-native';

type Props = TextInputProps & {
    onFormattedValue?: (rawValue: string, formatted: string) => void;
    label: string,
    placeholder: string;
    error?: string;
    className?: string;
};

const CustomNumberInput = ({ onFormattedValue, label, placeholder, error,
    className, ...props }: Props) => {
    const [value, setValue] = useState('');

    const formatNumber = (text: string) => {
        // Remove non-digit characters
        const raw = text.replace(/\D/g, '');

        // Format with thousand separator
        const formatted = raw.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

        setValue(formatted);
        if (onFormattedValue) onFormattedValue(raw, formatted);
    };

    return (
        <View className='mb-4'>
            {label && <Text className="text-gray-700 mb-1 font-bold">{label}</Text>}
            <TextInput
                {...props}
                value={value}
                onChangeText={formatNumber}
                keyboardType="numeric"
                className={`border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 ${className}`}
                placeholder={placeholder}
            />
        </View>
    );
};

export default CustomNumberInput;

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        padding: 10,
        fontSize: 16,
    },
});
