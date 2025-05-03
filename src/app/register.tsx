import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Link, router } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import SafeAreaView from '@/components/SafeAreaView';
import Input from '@/components/Input';
import ButtonCostum from '@/components/ButtonCostum';
import * as yup from 'yup';
import { Feather } from '@expo/vector-icons';
import { Formik } from 'formik';
import { RegisterData } from '@/types/types';
import ViewError from '@/components/ViewError';
import Animated, { FadeIn, FadeInDown, FadeInLeft, FadeInRight, FadeInUp, FadeOutRight } from 'react-native-reanimated';

const validationSchema = yup.object().shape({
  name: yup.string().min(3, 'Minimal 3 karakter').required('Nama harus diisi'),
  email: yup.string().email('email tidak valid').required('Email harus diisi'),
  password: yup.string().min(6, 'Minimal 6 karakter').required('Password harus diisi'),
  password_confirmation: yup.string()
    .oneOf([yup.ref('password')], 'Konfirmasi password tidak cocok')
    .required('Konfirmasi password wajib diisi')
});

export default function RegisterScreen() {

  const { register, isLoading, error } = useAuthStore();

  const [showPassword, setShowPassword] = useState(true);

  const handleRegister = async (data: RegisterData) => {
    try {
      await register(data);
      router.replace('/(protected)'); // Redirect to the protected tabs after registration);
    } catch (error) {
      Alert.alert('Error', error as string);
    }
  };

  return (
    <SafeAreaView className="flex-1 justify-center p-4 bg-slate-300">
      <Animated.View entering={FadeInLeft.duration(500).springify().withInitialValues({ transform: [{ translateX: -300 }] })} className="absolute bg-[#205781] h-80 w-80 top-[-100] left-[-100] rounded-full" />
      <Animated.View entering={FadeInRight.duration(500).springify().withInitialValues({ transform: [{ translateX: 300 }] })} className="absolute bg-[#497D74] h-80 w-80 top-40 right-[-100] rounded-full" />
      <Animated.View className='z-10 bg-white p-4 rounded-lg'
        entering={FadeInDown.duration(500).springify().withInitialValues({ transform: [{ translateY: 420 }] })}
      >
        <Text className="text-5xl font-bold text-center my-6">Register</Text>

        {error && <ViewError plaintext={error} />}
        <Formik
          initialValues={{ name: '', email: '', password: '', password_confirmation: '' }}
          validationSchema={validationSchema}
          onSubmit={async (values) => handleRegister(values)}
        >
          {({ handleChange, handleSubmit, values, errors, touched }) => (
            <>
              <Input
                label="Full Name"
                placeholder="Enter your name"
                value={values.name}
                onChangeText={handleChange('name')}
                error={touched.name ? errors.name : undefined}
                className='bg-gray-200'
                autoFocus={true}
              />

              <Input
                label="Email"
                placeholder="Enter your email"
                value={values.email}
                onChangeText={handleChange('email')}
                error={touched.email ? errors.email : undefined}
                className='bg-gray-200'
              />

              <Input
                label="Password"
                placeholder="Enter your password"
                value={values.password}
                onChangeText={handleChange('password')}
                secureTextEntry={showPassword}
                error={touched.password ? errors.password : undefined}
                className='bg-gray-200'
              />
              <View className='relative'>
                <Input
                  label="Password"
                  placeholder="Enter your password"
                  value={values.password_confirmation}
                  onChangeText={handleChange('password_confirmation')}
                  secureTextEntry={showPassword}
                  error={touched.password_confirmation ? errors.password_confirmation : undefined}
                  className='bg-gray-200'
                />
                <TouchableOpacity className='absolute top-9 right-3' onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? <Feather name='eye-off' size={24} /> : <Feather name='eye' size={24} />}
                </TouchableOpacity>
              </View>

              <ButtonCostum
                classname="bg-[#06202B]"
                title="Register"
                onPress={handleSubmit}
                loading={isLoading}
                variant="primary"
              />
            </>
          )}
        </Formik>
      </Animated.View>
      <View className="mt-4 flex-row justify-center">
        <Text>Already have an account? </Text>
        <Link href="/login" replace className="text-[#205781] font-bold">
          Login
        </Link>
      </View>
      <Animated.View entering={FadeInRight.duration(500).springify().withInitialValues({ transform: [{ translateX: -300 }] })} className="absolute bg-[#4F959D] h-40 w-40 bottom-[-50] left-1/4 rounded-full" />
    </SafeAreaView>
  );
}