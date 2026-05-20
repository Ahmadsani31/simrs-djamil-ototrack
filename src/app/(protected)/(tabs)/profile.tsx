import {
  AntDesign,
  Feather,
  FontAwesome5,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';
import {
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import Constants from 'expo-constants';
import { Image } from 'expo-image';
import { useFormik } from 'formik';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Toast } from 'toastify-react-native';
import * as yup from 'yup';

import SkeletonList from '@/components/feedback/SkeletonList';
import secureApi from '@/services/service';
import { useAuthStore } from '@/stores/authStore';

import { dataDashboard } from '@/types/types';
import HandleError from '@/utils/handleError';

const validationSchema = yup.object().shape({
  password: yup.string().min(6, 'Minimal 6 karakter').required('Password harus diisi'),
  password_confirmation: yup
    .string()
    .oneOf([yup.ref('password')], 'Konfirmasi password tidak cocok')
    .required('Konfirmasi password wajib diisi'),
});

export default function Profile() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [rawData, setRawData] = useState<dataDashboard | undefined>();

  const fetchDashboard = async () => {
    setIsLoading(true);
    try {
      const response = await secureApi.get(`/user/dashboard`);
      setRawData(response.data);
    } catch {
      setRawData(undefined);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboard();
    setRefreshing(false);
  };

  // Bottom sheet for password change
  const sheetRef = useRef<BottomSheetModal>(null);

  const openSheet = useCallback(() => {
    sheetRef.current?.present();
  }, []);

  const closeSheet = useCallback(() => {
    sheetRef.current?.dismiss();
  }, []);

  const formik = useFormik({
    initialValues: { password: '', password_confirmation: '' },
    validationSchema,
    onSubmit: async (values) => {
      setSubmitting(true);
      try {
        const formData = new FormData();
        formData.append('password', values.password);
        formData.append('password_konfirmasi', values.password_confirmation);
        await secureApi.postForm('/user/password_update', formData);

        formik.resetForm();
        closeSheet();
        Toast.show({
          type: 'success',
          text1: 'Berhasil',
          text2: 'Password berhasil diperbarui',
        });

        // Tawarkan logout setelah animasi sheet selesai
        setTimeout(() => {
          Alert.alert('Password Diperbarui', 'Mau logout dan login dengan password baru?', [
            { text: 'Tetap Login', style: 'cancel' },
            { text: 'Logout', onPress: () => logout() },
          ]);
        }, 400);
      } catch (error: unknown) {
        HandleError(error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleLogout = () => {
    Alert.alert('Konfirmasi', 'Apakah Anda yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <ScrollView
        className="flex-1 bg-slate-200"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {/* Header */}
        <View className="bg-brand px-4 pb-14" style={{ paddingTop: insets.top + 16 }}>
          <View className="flex-row items-center rounded-2xl bg-white/15 p-4">
            <View className="mr-4 rounded-full border-2 border-white/40 p-1">
              <Image
                style={{ borderRadius: 100, width: 72, height: 72 }}
                source={require('@asset/images/profile.png')}
              />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-white">{user?.name || '-'}</Text>
              <View className="mt-1 flex-row items-center gap-1">
                <Feather name="mail" size={13} color="rgba(255,255,255,0.7)" />
                <Text className="text-sm text-white/70">{user?.email || '-'}</Text>
              </View>
              <View className="mt-2 self-start rounded-full bg-white/20 px-3 py-1">
                <Text className="text-xs font-semibold uppercase tracking-wider text-white">
                  {user?.role || '-'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View className="mx-4 -mt-8 flex-row gap-3">
          {isLoading ? (
            <View className="flex-1">
              <SkeletonList loop={1} />
            </View>
          ) : (
            <>
              <View className="flex-1 rounded-2xl bg-white p-4 shadow-sm">
                <View className="mb-2 flex-row items-center gap-2">
                  <View className="rounded-full bg-blue-50 p-1.5">
                    <FontAwesome5 name="car-side" size={14} color="#3b82f6" />
                  </View>
                  <Text className="text-[11px] text-gray-400">Hari Ini</Text>
                </View>
                <Text className="text-3xl font-bold text-gray-800">
                  {rawData?.pemakaianHariIni ?? 0}
                </Text>
              </View>
              <View className="flex-1 rounded-2xl bg-white p-4 shadow-sm">
                <View className="mb-2 flex-row items-center gap-2">
                  <View className="rounded-full bg-emerald-50 p-1.5">
                    <MaterialCommunityIcons name="notebook-check" size={14} color="#10b981" />
                  </View>
                  <Text className="text-[11px] text-gray-400">Total</Text>
                </View>
                <Text className="text-3xl font-bold text-gray-800">
                  {rawData?.pemakaianHariSemua ?? 0}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Actions */}
        <View className="mx-4 mt-4 gap-3">
          {user?.role === 'driver' && (
            <TouchableOpacity
              onPress={openSheet}
              className="flex-row items-center justify-center gap-2 rounded-xl bg-teal-500 px-4 py-3.5"
              activeOpacity={0.8}>
              <MaterialIcons name="password" size={18} color="white" />
              <Text className="font-bold text-white">Update Password</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={handleLogout}
            className="flex-row items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3.5"
            activeOpacity={0.8}>
            <AntDesign name="logout" size={18} color="white" />
            <Text className="font-bold text-white">Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="mt-10 items-center pb-6">
          <Text className="text-xs text-gray-400">Pencatatan Kendaraan Operasional</Text>
          <Text className="mt-0.5 text-sm font-bold text-gray-500">RSUP DR. M. DJAMIL PADANG</Text>
          <Text className="mt-3 text-[10px] text-gray-300">
            Version {Constants.expoConfig?.version}
          </Text>
        </View>
      </ScrollView>

      {/* Password Bottom Sheet */}
      <BottomSheetModal
        ref={sheetRef}
        // ✅ Keyboard naik saat input focus
        keyboardBehavior={Platform.OS === 'ios' ? 'interactive' : 'fillParent'}
        // ✅ Otomatis turun kembali saat keyboard hidden
        keyboardBlurBehavior="restore"
        // ✅ Khusus Android agar layout resize
        android_keyboardInputMode="adjustResize"
        backgroundStyle={{ borderRadius: 24 }}
        handleIndicatorStyle={{ backgroundColor: '#ccc', width: 40 }}>
        <BottomSheetView className="mb-5 flex-1 px-5 pb-10 pt-5">
          <View className="mb-5">
            <Text className="text-2xl font-bold text-gray-800">Update Password</Text>
            <Text className="mt-0.5 text-xs text-gray-400">
              Masukkan password baru minimal 6 karakter
            </Text>
          </View>

          {/* Password */}
          <View className="mb-4">
            <Text className="mb-1.5 text-sm font-semibold text-gray-700">Password Baru</Text>
            <View className="relative">
              <BottomSheetTextInput
                className={`rounded-xl border bg-gray-50 px-4 py-3 pr-11 text-base text-gray-800 ${
                  formik.touched.password && formik.errors.password
                    ? 'border-red-400'
                    : 'border-gray-200'
                }`}
                placeholder="Masukkan password baru"
                placeholderTextColor="#9ca3af"
                value={formik.values.password}
                onChangeText={formik.handleChange('password')}
                onBlur={formik.handleBlur('password')}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                className="absolute right-3 top-3"
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={8}>
                <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>
            {formik.touched.password && formik.errors.password && (
              <Text className="mt-1 text-xs text-red-500">{formik.errors.password}</Text>
            )}
          </View>

          {/* Confirm */}
          <View className="mb-5">
            <Text className="mb-1.5 text-sm font-semibold text-gray-700">Konfirmasi Password</Text>
            <BottomSheetTextInput
              className={`rounded-xl border bg-gray-50 px-4 py-3 text-base text-gray-800 ${
                formik.touched.password_confirmation && formik.errors.password_confirmation
                  ? 'border-red-400'
                  : 'border-gray-200'
              }`}
              placeholder="Ulangi password baru"
              placeholderTextColor="#9ca3af"
              value={formik.values.password_confirmation}
              onChangeText={formik.handleChange('password_confirmation')}
              onBlur={formik.handleBlur('password_confirmation')}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            {formik.touched.password_confirmation && formik.errors.password_confirmation && (
              <Text className="mt-1 text-xs text-red-500">
                {formik.errors.password_confirmation}
              </Text>
            )}
          </View>

          {/* Actions */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={closeSheet}
              disabled={submitting}
              className="flex-1 items-center rounded-xl bg-slate-100 py-3"
              activeOpacity={0.8}>
              <Text className="text-sm font-semibold text-gray-600">Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => formik.handleSubmit()}
              disabled={submitting}
              className={`flex-1 items-center rounded-xl py-3 ${
                submitting ? 'bg-teal-300' : 'bg-teal-500'
              }`}
              activeOpacity={0.8}>
              <Text className="text-sm font-bold text-white">
                {submitting ? 'Memproses...' : 'Update Password'}
              </Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </SafeAreaView>
  );
}
