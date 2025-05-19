import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useAuthStore } from '@/stores/authStore';
import Constants from 'expo-constants';
import { Image } from 'expo-image';
import SafeAreaView from '@/components/SafeAreaView';
import { AntDesign, Feather, FontAwesome5, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { ModalRN } from '@/components/ModalRN';
import { useCallback, useState } from 'react';
import { Formik, FormikValues, useFormik } from 'formik';
import ButtonCostum from '@/components/ButtonCostum';
import { colors } from '@/constants/colors';

import * as yup from 'yup';
import secureApi from '@/services/service';
import Input from '@/components/Input';
import { useQuery } from '@tanstack/react-query';
import SkeletonList from '@/components/SkeletonList';
import { useFocusEffect } from 'expo-router';

const fetchData = async () => {
  try {
    const response = await secureApi.get(`/user/dashboard`);
    return response.data
  } catch (error) {
    return []
  }

};

const validationSchema = yup.object().shape({
  password: yup.string().min(6, 'Minimal 6 karakter').required('Password harus diisi'),
  password_confirmation: yup.string()
    .oneOf([yup.ref('password')], 'Konfirmasi password tidak cocok')
    .required('Konfirmasi password wajib diisi')
});

type dataDashboard = {
  pemakaianHariIni: number;
  pemakaianHariSemua: number;
}

export default function Profile() {
  const { user, logout } = useAuthStore();

  const [isModal, setIsModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(true);

    useFocusEffect(
      useCallback(() => {
        refetch();
      }, [])
    );

  const { data, isLoading, isError, error,refetch } = useQuery<dataDashboard>({
    queryKey: ['dashboard'],
    queryFn: fetchData,
  })

  const formik = useFormik({
    initialValues: { password: '', password_confirmation: '' },
    validationSchema: validationSchema,
    onSubmit: async (values) => {

      setLoading(true)
      try {
        const formData = new FormData();
        formData.append('password', values.password);
        formData.append('password_konfirmasi', values.password_confirmation);
        // console.log('formData', formData);

        const response = await secureApi.postForm('/user/password_update', formData)
        console.log('response ', JSON.stringify(response));
        handleCloseModal()
        Alert.alert('Successfully!', 'Kamu ingin logout/keluar dan login dengan password baru atau tetap login', [
          { text: 'Tutup', onPress: () => null, style: 'cancel' },
          { text: 'Logout', onPress: () => logout() },
        ]);

      } catch (error: any) {
        // alert(error.response.data.message)
        if (error.response && error.response.data) {
          const msg = error.response.data.message || "Terjadi kesalahan.";
          Alert.alert("Warning!", msg, [{ text: "Tutup", style: "cancel" }]);
        } else if (error.request) {
          Alert.alert("Network Error", "Tidak bisa terhubung ke server. Cek koneksi kamu.");
        } else {
          Alert.alert("Error", error.message);
        }
      } finally {
        setLoading(false);
      }

    },
  });

  const handleCloseModal = () => {
    formik.resetForm()
    setIsModal(false)
  }

  return (
    <SafeAreaView noTop>
      <View className="flex-1 bg-slate-300">
        <View className="bg-[#205781] rounded-br-[50]  rounded-bl-[50] shadow">
          <View className='px-4'>

            <View className='bg-white flex-row gap-5 items-center justify-center rounded-lg p-4'>
              <View className='my-3'>
                <Image style={{
                  borderRadius: 100,
                  width: 80,
                  height: 80,
                }} source={require('@asset/images/profile.png')} />
              </View>
              <View className='my-2'>
                <Text className="text-lg font-bold underline">{user?.name || 'Not available'}</Text>
                <Text className="text-lg">{user?.email || 'Not available'}</Text>
              </View>

            </View>
            <View className='flex-row gap-5 items-center justify-center rounded-lg p-4'>
              {isLoading ? <View className='flex-1'><SkeletonList loop={1} /></View> : (
                <View className='w-48 bg-white rounded-lg p-2'>
                  <Text>Pemakaian Hari ini</Text>
                  <View className='my-2 flex-row gap-2 justify-between items-center'>
                    <Text className='text-5xl font-bold  text-blue-500'>
                      {data?.pemakaianHariIni}
                    </Text>
                    <FontAwesome5 name="car-side" size={34} color="black" />
                  </View>
                </View>

              )}

              {isLoading ? <View className='flex-1'><SkeletonList loop={1} /></View> : (
                <View className='w-48 bg-white rounded-lg p-2'>
                  <Text>Total Pemakaian</Text>
                  <View className='my-2 flex-row gap-2 justify-between  items-center'>
                    <Text className='text-5xl font-bold text-blue-500'>
                      {data?.pemakaianHariSemua}
                    </Text>
                    <MaterialCommunityIcons name="notebook-check" size={34} color="black" />
                  </View>
                </View>
              )}


            </View>
            <View className='mb-10'>
              <TouchableOpacity
                onPress={() => setIsModal(true)}
                className={`bg-teal-500 p-3 my-3 flex-row justify-center rounded items-center w-full`}
              >
                <MaterialIcons name="password" size={20} color="white" />
                <Text className="text-white ms-3 font-bold">Update Password</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={logout}
                className={`bg-red-400 p-3 my-3 flex-row justify-center rounded items-center w-full`}
              >
                <AntDesign name="logout" size={20} color="white" />
                <Text className="text-white ms-3 font-bold">Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View className='flex-1 items-center justify-center mb-20'>
          <Text className='font-bold'>Aplikasi</Text>
          <Text className='text-lg font-bold'>Pencatatan Kendaraan Operasional</Text>
          <Text className='text-xl font-bold'>RSUP DR. M. DJAMIL PADANG</Text>
          <Text className='mt-4'>Vesion</Text>
          <Text className='text-sm'>{Constants.expoConfig?.version}</Text>
        </View>
      </View>
      <ModalRN
        visible={isModal}
        onClose={() => setIsModal(false)}
      >
        <ModalRN.Header>
          <Text className='font-bold text-center'>Update Password</Text>
        </ModalRN.Header>
        <ModalRN.Content>

          <Input
            label="Password"
            placeholder="Enter your password"
            value={formik.values.password}
            onChangeText={formik.handleChange('password')}
            secureTextEntry={showPassword}
            error={formik.touched.password ? formik.errors.password : undefined}
            className='bg-gray-200'
          />
          <View className='relative'>
            <Input
              label="Password"
              placeholder="Enter your password"
              value={formik.values.password_confirmation}
              onChangeText={formik.handleChange('password_confirmation')}
              secureTextEntry={showPassword}
              error={formik.touched.password_confirmation ? formik.errors.password_confirmation : undefined}
              className='bg-gray-200'
            />
            <TouchableOpacity className='absolute top-9 right-3' onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? <Feather name='eye-off' size={24} /> : <Feather name='eye' size={24} />}
            </TouchableOpacity>
          </View>

        </ModalRN.Content>
        <ModalRN.Footer>
          <View className="gap-2 flex-row">
            <ButtonCostum classname={colors.warning + ` w-full`} title="Tutup" loading={loading} onPress={handleCloseModal} />
            <ButtonCostum classname={colors.primary} title="Update Password" loading={loading} onPress={formik.handleSubmit} />
          </View>
        </ModalRN.Footer>
      </ModalRN>
    </SafeAreaView >
  );
}