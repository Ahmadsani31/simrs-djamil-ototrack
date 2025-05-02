import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
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
import Animated, { useSharedValue, withSpring, FadeInDown } from 'react-native-reanimated';
import useOnceEffect from '@/components/useOnceEffect';

const validationSchema = yup.object().shape({
  email: yup.string().required('Email harus diisi'),
  password: yup.string().min(6, 'Minimal 6 karakter').required('Password harus diisi'),
});


export default function LoginScreen() {
  const WiconBR = useSharedValue<number>(10);
  const HiconBR = useSharedValue<number>(10);

  const WiconBL = useSharedValue<number>(80);
  const HiconBL = useSharedValue<number>(80);

  const WiconTL = useSharedValue<number>(20);
  const HiconTL = useSharedValue<number>(20);

  const WiconTR = useSharedValue<number>(20);
  const HiconTR = useSharedValue<number>(20);


  useOnceEffect(() => {
    WiconBR.value = withSpring(WiconBR.value + 60);
    HiconBR.value = withSpring(HiconBR.value + 60);

    WiconBL.value = withSpring(WiconBL.value + 120);
    HiconBL.value = withSpring(HiconBL.value + 120);

    WiconTL.value = withSpring(WiconTL.value + 200);
    HiconTL.value = withSpring(HiconTL.value + 200);

    WiconTR.value = withSpring(WiconTR.value + 280);
    HiconTR.value = withSpring(HiconTR.value + 280);
  })

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
      <Animated.View style={{ width: WiconTL, height: HiconTL }} className="absolute z-10 bg-teal-500 top-[-80] left-[-80] rounded-full" />
      <Animated.View style={{ width: WiconTR, height: HiconTR }} className="absolute bg-teal-500 top-16 right-[-100] rounded-full" />
      <Animated.View className=' bg-white p-4 rounded-lg z-10'
        entering={FadeInDown.duration(500).springify().withInitialValues({ transform: [{ translateY: 420 }] })}
      >

        <Text className="text-5xl font-bold text-center my-6">Sign - In</Text>

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
      </Animated.View>
      <View className="mt-4 flex-row justify-center z-10">
        <Text>Don't have an account? </Text>
        <Link href="/register" push className="text-blue-500">
          Register
        </Link>
      </View>
      <Animated.View style={{ width: WiconBL, height: HiconBL }} className="absolute bg-[#03A791] bottom-24 left-[-60] rounded-full shadow-lg" />
      <Animated.View style={{ width: WiconBR, height: HiconBR }} className="absolute bottom-0 right-0 bg-[#03A791] rounded-full">
      </Animated.View>
    </SafeAreaView>
  );
}
