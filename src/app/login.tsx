import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
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

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const validationSchema = yup.object().shape({
  username: yup.string().required('Username harus diisi'),
  password: yup.string().min(6, 'Minimal 6 karakter').required('Password harus diisi'),
});

import {
  GoogleSignin,
  GoogleSigninButton,
  isSuccessResponse,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { ScrollView } from 'react-native-gesture-handler';
import { Toast } from 'toastify-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const [submitLogin, setSubmitLogin] = useState(false);

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
  });

  const [showPassword, setShowPassword] = useState(true);

  const { login, loginSSO, isLoading, errorLogin } = useAuthStore();

  const handleLogin = async (value: LoginData) => {
    const log = await login(value);

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
        // console.log(response);
        const email = response.data.user.email;
        const sso = await loginSSO({ email: email });
        if (sso) {
          router.replace('/(protected)/(tabs)/');
        } else {
          await GoogleSignin.signOut();
        }
      } else {
        // sign in was cancelled by user
        await GoogleSignin.signOut();
      }
    } catch (error: any) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            // operation (eg. sign in) already in progress
            Toast.show({
              type: 'error',
              text1: 'Login with email',
              text2: 'On prosess login',
            });
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            // Android only, play services not available or outdated
            Toast.show({
              type: 'error',
              text1: 'Login with email',
              text2: 'Play services not available',
            });
            break;
          default:
            // some other error happened
            Toast.show({
              type: 'error',
              text1: 'Login with email',
              text2: JSON.stringify(error),
            });
        }
      } else {
        // an error that's not related to google sign in occurred
        Toast.show({
          type: 'error',
          text1: 'Login with email',
          text2: JSON.stringify(error),
        });
      }
    } finally {
      setSubmitLogin(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-300" edges={['left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled">
          <Animated.View
            style={{ width: WiconTL, height: HiconTL }}
            className="absolute left-[-80] top-[-80] rounded-full bg-[#4F959D]"
          />
          <Animated.View
            style={{ width: WiconTR, height: HiconTR }}
            className="absolute right-[-100] top-16 rounded-full bg-[#205781]"
          />
          <View className="mb-5 mt-10 items-center">
            <View className="rounded-2xl bg-white/85 p-2">
              <Image
                className="h-[80] w-[250] object-cover"
                source={require('@asset/images/logo/logo-djamil.png')}
              />
            </View>
          </View>
          <View className="z-10 mx-4 mb-24 rounded-lg bg-white p-6">
            <View className="mb-5 mt-2">
              <Text className="text-center text-xl font-medium">Pencatatan</Text>
              <Text className="text-center text-2xl font-bold">Kendaraan Operasional</Text>
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
                    placeholder="Enter your username"
                    value={values.username}
                    onChangeText={handleChange('username')}
                    error={touched.username ? errors.username : undefined}
                    className="bg-gray-50"
                  />

                  <View className="relative">
                    <Input
                      label="Password"
                      placeholder="Enter your password"
                      value={values.password}
                      onChangeText={handleChange('password')}
                      secureTextEntry={showPassword}
                      error={touched.password ? errors.password : undefined}
                      className="bg-gray-50"
                    />
                    <TouchableOpacity
                      className="absolute right-3 top-9"
                      onPress={() => setShowPassword(!showPassword)}>
                      {showPassword ? (
                        <Feather name="eye-off" size={24} />
                      ) : (
                        <Feather name="eye" size={24} />
                      )}
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
            <View className="items-center">
              <View className="flex-row items-center text-sm text-gray-500">
                <View className="flex-grow border-t border-gray-300" />
                <Text className="mx-2 py-4 text-gray-500">or Login via google</Text>
                <View className="flex-grow border-t border-gray-300" />
              </View>
              <GoogleSigninButton
                size={GoogleSigninButton.Size.Wide}
                color={GoogleSigninButton.Color.Dark}
                onPress={() => signIn()}
                disabled={submitLogin}
              />
            </View>
          </View>
          <View className="absolute bottom-0 w-full items-center">
            <Text className="text-sm font-medium">Pencatatan Kendaraan</Text>
            <Text className="text-xs font-bold">Version. {Constants.expoConfig?.version}</Text>
            <Text className="text-xs">URL : {API_URL}</Text>
          </View>
          <Animated.View
            style={{ width: WiconBL, height: HiconBL }}
            className="absolute bottom-16 left-[-60] rounded-full bg-[#497D74]"
          />
          <Animated.View
            style={{ width: WiconBR, height: HiconBR }}
            className="absolute bottom-0 right-0 rounded-full  bg-[#03A791]"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
