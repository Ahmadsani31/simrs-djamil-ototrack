import { Feather } from '@expo/vector-icons';
import {
  GoogleSignin,
  GoogleSigninButton,
  isSuccessResponse,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { Formik } from 'formik';
import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  FadeInDown,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Toast } from 'toastify-react-native';
import * as yup from 'yup';

import ButtonCostum from '@/components/forms/ButtonCostum';
import Input from '@/components/forms/Input';
import { useAuthStore } from '@/stores/authStore';


import { LoginData } from '@/types/types';
import ViewError from '@/components/feedback/ViewError';
import useOnceEffect from '@/hooks/useOnceEffect';

import { colors } from '@/constants/colors';

const validationSchema = yup.object().shape({
  username: yup.string().required('Username harus diisi'),
  password: yup.string().min(6, 'Minimal 6 karakter').required('Password harus diisi'),
});

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [submitLogin, setSubmitLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(true);
  const { login, loginSSO, isLoading, errorLogin } = useAuthStore();

  // Animated decorative circles
  const circle1 = useSharedValue(0);
  const circle2 = useSharedValue(0);

  useOnceEffect(() => {
    circle1.value = withSpring(1, { damping: 12 });
    circle2.value = withDelay(150, withSpring(1, { damping: 12 }));
  });

  const circle1Style = useAnimatedStyle(() => ({
    transform: [{ scale: circle1.value }],
    opacity: circle1.value,
  }));
  const circle2Style = useAnimatedStyle(() => ({
    transform: [{ scale: circle2.value }],
    opacity: circle2.value,
  }));

  const handleLogin = async (value: LoginData) => {
    const log = await login(value);
    if (!log) return;
    if (log.role == 'admin') {
      router.replace('/(protected)/(tabs-admin)/');
    } else if (log.role == 'driver') {
      router.replace('/(protected)/(tabs)/');
    }
  };

  const signIn = async () => {
    setSubmitLogin(true);
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();
      if (isSuccessResponse(response)) {
        const email = response.data.user.email;
        const sso = await loginSSO({ email });
        if (sso) {
          router.replace('/(protected)/(tabs)/');
        } else {
          await GoogleSignin.signOut();
        }
      } else {
        await GoogleSignin.signOut();
      }
    } catch (error: unknown) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            Toast.show({ type: 'error', text1: 'Login', text2: 'Sedang diproses' });
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            Toast.show({ type: 'error', text1: 'Login', text2: 'Play Services tidak tersedia' });
            break;
          default:
            Toast.show({ type: 'error', text1: 'Login', text2: 'Terjadi kesalahan' });
        }
      } else {
        Toast.show({ type: 'error', text1: 'Login', text2: 'Terjadi kesalahan' });
      }
    } finally {
      setSubmitLogin(false);
    }
  };

  return (
    <View className="flex-1 bg-brand">
      {/* Decorative circles */}
      <Animated.View
        style={[
          circle1Style,
          {
            position: 'absolute',
            top: -60,
            right: -60,
            width: 200,
            height: 200,
            borderRadius: 100,
            backgroundColor: 'rgba(255,255,255,0.08)',
          },
        ]}
      />
      <Animated.View
        style={[
          circle2Style,
          {
            position: 'absolute',
            bottom: -40,
            left: -40,
            width: 160,
            height: 160,
            borderRadius: 80,
            backgroundColor: 'rgba(255,255,255,0.06)',
          },
        ]}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingTop: insets.top,
            paddingBottom: insets.bottom + 16,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* Logo */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(500)}
            className="mb-6 items-center">
            <View className="rounded-2xl bg-white/90 px-6 py-3 shadow-sm">
              <Image
                style={{ width: 220, height: 70 }}
                resizeMode="contain"
                source={require('@asset/images/logo/logo-djamil.png')}
              />
            </View>
          </Animated.View>

          {/* Login Card */}
          <Animated.View
            entering={FadeInDown.delay(250).duration(500)}
            className="mx-5 rounded-3xl bg-white p-6 shadow-sm">
            <View className="mb-5">
              <Text className="text-center text-lg text-gray-500">Pencatatan</Text>
              <Text className="text-center text-2xl font-bold text-gray-800">
                Kendaraan Operasional
              </Text>
            </View>

            {errorLogin && <ViewError plaintext={errorLogin} />}

            <Formik
              initialValues={{ username: '', password: '' }}
              validationSchema={validationSchema}
              onSubmit={async (values) => handleLogin(values)}>
              {({ handleChange, handleSubmit, values, errors, touched }) => (
                <>
                  <Input
                    label="Username"
                    placeholder="Masukkan username"
                    value={values.username}
                    onChangeText={handleChange('username')}
                    error={touched.username ? errors.username : undefined}
                    className="bg-gray-50"
                  />

                  <View className="relative">
                    <Input
                      label="Password"
                      placeholder="Masukkan password"
                      value={values.password}
                      onChangeText={handleChange('password')}
                      secureTextEntry={showPassword}
                      error={touched.password ? errors.password : undefined}
                      className="bg-gray-50"
                    />
                    <TouchableOpacity
                      className="absolute right-3 top-9"
                      onPress={() => setShowPassword(!showPassword)}>
                      <Feather name={showPassword ? 'eye-off' : 'eye'} size={22} color="#94a3b8" />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleSubmit()}
                    disabled={isLoading}
                    className="mt-2 items-center rounded-xl bg-brand py-3.5"
                    activeOpacity={0.8}>
                    <Text className="text-base font-bold text-white">
                      {isLoading ? 'Memproses...' : 'Masuk'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </Formik>

            {/* Divider */}
            <View className="my-5 flex-row items-center">
              <View className="flex-1 border-t border-gray-200" />
              <Text className="mx-3 text-xs text-gray-400">atau masuk dengan</Text>
              <View className="flex-1 border-t border-gray-200" />
            </View>

            {/* Google sign-in */}
            <View className="items-center">
              <GoogleSigninButton
                size={GoogleSigninButton.Size.Wide}
                color={GoogleSigninButton.Color.Dark}
                onPress={() => signIn()}
                disabled={submitLogin}
              />
            </View>
          </Animated.View>

          {/* Footer */}
          <Animated.View
            entering={FadeInDown.delay(400).duration(500)}
            className="mt-8 items-center">
            <Text className="text-xs text-white/50">Pencatatan Kendaraan</Text>
            <Text className="mt-0.5 text-[10px] text-white/30">
              Version {Constants.expoConfig?.version}
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
