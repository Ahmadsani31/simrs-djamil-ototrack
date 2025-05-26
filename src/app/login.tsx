import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Image, Dimensions } from 'react-native';
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
import Constants from 'expo-constants';

const validationSchema = yup.object().shape({
  username: yup.string().required('Username harus diisi'),
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

  const { login, isLoading, errorLogin } = useAuthStore();

  const handleLogin = async (value: LoginData) => {

    await login(value);
    router.replace('/(protected)');

  };


  return (
    <SafeAreaView className="flex-1 justify-center bg-slate-300">
      <Animated.View style={{ width: WiconTL, height: HiconTL }} className="absolute bg-[#4F959D] top-[-80] left-[-80] rounded-full" />
      <Animated.View style={{ width: WiconTR, height: HiconTR }} className="absolute bg-[#205781] top-16 right-[-100] rounded-full" />
      <View className='items-center mb-5'>
        <View className='bg-white/85 rounded-2xl p-2'>
          <Image className='h-[80] w-[250] object-cover' source={require('@asset/images/logo/logo-djamil.png')} />
        </View>
      </View>
      <View className=' bg-white p-4 mx-4 mb-24 rounded-lg z-10'>
        <View className='mb-5 mt-5'>
          <Text className="text-xl font-medium text-center">Pencatatan</Text>
          <Text className="font-mono text-2xl font-bold text-center">Kendaraan Operasional</Text>
        </View>
        {errorLogin && <ViewError plaintext={errorLogin} />}
        <Formik
          initialValues={{ username: '', password: '' }}
          validationSchema={validationSchema}
          onSubmit={async (values) => handleLogin(values)}
        >
          {({ handleChange, handleSubmit, values, errors, touched }) => (
            <>
              <Input
                label="Username"
                placeholder="Enter your username"
                value={values.username}
                onChangeText={handleChange('username')}
                error={touched.username ? errors.username : undefined}
                className='bg-gray-50'
              />


              <View className='relative'>
                <Input
                  label="Password"
                  placeholder="Enter your password"
                  value={values.password}
                  onChangeText={handleChange('password')}
                  secureTextEntry={showPassword}
                  error={touched.password ? errors.password : undefined}
                  className='bg-gray-50'
                />
                <TouchableOpacity className='absolute top-9 right-3' onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? <Feather name='eye-off' size={24} /> : <Feather name='eye' size={24} />}
                </TouchableOpacity>
              </View>

              <ButtonCostum
                classname="bg-[#06202B]"
                title="Login"
                onPress={handleSubmit}
                loading={isLoading}
                variant="primary"
              />
            </>
          )}
        </Formik>
      </View>
      <View className='absolute w-full items-center bottom-2'>
        <Text className='text-sm font-medium'>Pencatatan Kendaraan</Text>
        <Text className='text-xs font-bold'>Version. {Constants.expoConfig?.version}</Text>
      </View>
      <Animated.View style={{ width: WiconBL, height: HiconBL }} className="absolute bg-[#497D74] bottom-24 left-[-60] rounded-full" />
      <Animated.View style={{ width: WiconBR, height: HiconBR }} className="absolute bg-[#03A791] bottom-0 right-0  rounded-full" />
    </SafeAreaView>
  );
}
