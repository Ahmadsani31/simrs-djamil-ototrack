import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Link, router } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import SafeAreaView from '@/components/SafeAreaView';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { register, isLoading, error } = useAuthStore();

  const handleRegister = async () => {
    try {
      await register({name, email, password,confirmPassword});
      router.replace('/(protected)'); // Redirect to the protected tabs after registration);
    } catch (error) {
      Alert.alert('Error', error as string);
    }
  };

  return (
    <SafeAreaView className="flex-1 justify-center p-4 bg-white">
      <Text className="text-2xl font-bold text-center mb-6">Register</Text>
      
      {error && <Text className="text-red-500 mb-4 text-center">{error}</Text>}
      
      <TextInput
        className="border border-gray-300 rounded p-3 mb-4"
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      
      <TextInput
        className="border border-gray-300 rounded p-3 mb-4"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        className="border border-gray-300 rounded p-3 mb-6"
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity
        className="bg-blue-500 p-3 rounded items-center"
        onPress={handleRegister}
        disabled={isLoading}
      >
        <Text className="text-white font-medium">
          {isLoading ? 'Loading...' : 'Register'}
        </Text>
      </TouchableOpacity>
      
      <View className="mt-4 flex-row justify-center">
        <Text>Already have an account? </Text>
        <Link href="/login" replace className="text-blue-500">
          Login
        </Link>
      </View>
    </SafeAreaView>
  );
}