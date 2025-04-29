import { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Dimensions, Animated, useAnimatedValue } from 'react-native';
import { Link, router } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import SafeAreaView from '@/components/SafeAreaView';
import * as yup from 'yup';
import { Formik } from 'formik';
import Input from '@/components/Input';

import { Feather } from '@expo/vector-icons';
import ButtonCostum from '@/components/ButtonCostum';
import { LoginData } from '@/types/types';
import ViewError from '@/components/ViewError';

const validationSchema = yup.object().shape({
  email: yup.string().required('Email harus diisi'),
  password: yup.string().min(6, 'Minimal 6 karakter').required('Password harus diisi'),
});


export default function LoginScreen() {
  const fadeAnim = useAnimatedValue(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const [showPassword, setShowPassword] = useState(true);

  const { login, isLoading, error } = useAuthStore();

  const handleLogin = async (value: LoginData) => {
    console.log(value);
    try {
      await login(value);
      router.replace('/(protected)');
    } catch (error) {
      console.log('error screen login');

      Alert.alert('Error', error as string);
    }
  };

  return (
    <SafeAreaView className="flex-1 justify-center p-4 bg-slate-300">

      <View className="absolute z-10 bg-teal-500 h-80 w-80 top-0 left-0 rounded-full shadow-lg -translate-x-32 -translate-y-32" />


      <View className="absolute bg-teal-500 h-80 w-80 top-0 right-0 rounded-full shadow-lg translate-x-36 translate-y-12" />
      <Animated.View
        style={{ opacity: fadeAnim, zIndex: 10 }}
      >
        <View className='z-10 bg-white p-4 rounded-lg'>

          <Text className="text-2xl font-bold text-center mb-6">Login</Text>

          {error && <ViewError plaintext={error} />}

          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={validationSchema}
            onSubmit={async (values) => handleLogin(values)}
          >
            {({ handleChange, handleSubmit, values, errors, touched }) => (
              <>
                <Input
                  label="Email"
                  placeholder="Enter your email"
                  value={values.email}
                  onChangeText={handleChange('email')}
                  error={touched.email ? errors.email : undefined}
                  className='bg-gray-200'
                />


                <View className='relative'>
                  <Input
                    label="Password"
                    placeholder="Enter your password"
                    value={values.password}
                    onChangeText={handleChange('password')}
                    secureTextEntry={showPassword}
                    error={touched.password ? errors.password : undefined}
                    className='bg-gray-200'
                  />
                  <TouchableOpacity className='absolute top-9 right-3' onPress={() => setShowPassword(!showPassword)}>
                    {showPassword ? <Feather name='eye-off' size={24} /> : <Feather name='eye' size={24} />}
                  </TouchableOpacity>
                </View>

                <ButtonCostum
                  classname="bg-indigo-500"
                  title="Login"
                  onPress={handleSubmit}
                  loading={isLoading}
                  variant="primary"
                />
              </>
            )}
          </Formik>
        </View>
      </Animated.View>
      <View className="mt-4 flex-row justify-center z-10">
        <Text>Don't have an account? </Text>
        <Link href="/register" push className="text-blue-500">
          Register
        </Link>
      </View>
      <View className="-z-0 absolute bg-teal-500 h-60 w-60 bottom-1/4 left-0 rounded-full shadow-lg -translate-x-16 translate-y-20" />
      <View className="absolute bg-teal-500 h-40 w-40 bottom-0 right-0 rounded-full shadow-lg translate-x-16 translate-y-20" />
    </SafeAreaView>
  );
}