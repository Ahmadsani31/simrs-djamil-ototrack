import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import ModalCamera from '@/components/ModalCamera';
import secureApi from '@/services/service';
import { Formik } from 'formik';
import * as yup from 'yup';
import { colors } from '@/constants/colors';
import { reLocation } from '@/hooks/locationRequired';
import { useLoadingStore } from '@/stores/loadingStore';
import { useQuery } from '@tanstack/react-query';
import SkeletonList from '@/components/SkeletonList';
import { Toast } from 'toastify-react-native';
import CustomNumberInput from '@/components/CustomNumberInput';
import InputArea from '@/components/InputArea';
import HandleError from '@/utils/handleError';
import ModalPreviewImage from '@/components/ModalPreviewImage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type propsService = {
  id: string;
  name: string;
  no_polisi: string;
  keterangan: string;
  jenis_kerusakan: string;
  lokasi: string;
};

const fetchData = async (service_id: string) => {
  const response = await secureApi.get(`/service/data_aktif`, {
    params: {
      service_id: service_id,
    },
  });
  // console.log(`fetchData response`, response.data);

  return response.data;
};

const validationSchema = yup.object().shape({
  nominal: yup.number().required('Uang wajib isi'),
});

type propsSubmit = {
  nominal: string;
  keterangan: string;
};

export default function PengembalianServiceScreen() {
  const { service_id, kendaraan_id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [modalImageVisible, setModalImageVisible] = useState(false);
  const [imgBase64, setImgBase64] = useState<Base64URLString>();

  const { data, isLoading, error, isError } = useQuery<propsService>({
    queryKey: ['pengembalian', service_id],
    queryFn: () => fetchData(service_id.toString()),
  });

  if (isError) {
    Alert.alert('Peringatan!', 'Tidak ada pemeliharaan kendaraan yang aktif!', [
      { text: 'Kembali', onPress: () => router.back() },
    ]);
  }

  const setLoading = useLoadingStore((state) => state.setLoading);

  const [modalVisible, setModalVisible] = useState(false);

  const [uri, setUri] = useState<string | null>(null);

  const postSubmitData = async (values: propsSubmit) => {
    // console.log(values);

    setLoading(true);

    if (!uri) {
      Toast.error('Foto struk / bon belum di ambil');
      setLoading(false);
      return;
    }

    const coordinate = await reLocation.getCoordinate();

    if (!coordinate?.lat && coordinate?.long) {
      Alert.alert('Peringatan!', 'Error device location', [{ text: 'Tutup', onPress: () => null }]);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('latitude', coordinate?.lat?.toString() || '');
      formData.append('longitude', coordinate?.long.toString() || '');
      formData.append('service_id', service_id.toString());
      formData.append('kendaraan_id', kendaraan_id.toString());
      formData.append('nominal', values.nominal);
      formData.append('keterangan', values.keterangan);
      formData.append('fileImage', {
        uri: uri,
        name: 'bon-capture.jpg',
        type: 'image/jpeg',
      } as any);

      // console.log('formData', formData);
      // return;

      await secureApi.postForm('/service/update', formData);
      // console.log('response ', JSON.stringify(response.data));

      // await SecureStore.deleteItemAsync('DataAktif');
      // console.log(response.message);
      router.replace('(tabs)/(pemiliharaan)');
    } catch (error: any) {
      // console.log(error.response);
      HandleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className=" bg-slate-300"
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : insets.bottom}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="absolute h-80 w-full rounded-bl-[50] rounded-br-[50]  bg-[#205781]" />
        <View className="m-4 rounded-lg bg-white p-4">
          {isLoading || isError ? (
            <SkeletonList loop={5} />
          ) : (
            <Formik
              initialValues={{ nominal: '', keterangan: '' }}
              validationSchema={validationSchema}
              onSubmit={async (values) => postSubmitData(values)}>
              {({ handleChange, handleSubmit, values, touched, errors }) => (
                <>
                  <View className="mb-3 items-center gap-4 py-2">
                    <View className="flex-row items-center text-sm text-gray-500">
                      <View className="flex-grow border-t border-gray-300" />
                      <Text className="mx-2 text-lg text-[#205781]">
                        Proses Pengembalian pemeliharaan Kendaraan
                      </Text>
                      <View className="flex-grow border-t border-gray-300" />
                    </View>
                    <View>
                      <Text className="text-center text-5xl font-bold">{data?.name}</Text>
                      <Text className="mt-3 text-center font-medium">{data?.no_polisi}</Text>
                    </View>
                  </View>
                  <View className="mb-4 w-full border border-b-2" />
                  <Text className="mb-3 text-center">
                    Silahkan foto struk atau bon belanja pemeliharaan kendaraan
                  </Text>

                  <CustomNumberInput
                    className="bg-gray-100"
                    placeholder="Masukan nominal"
                    label="Biaya Pemeliharaan"
                    value={values.nominal}
                    error={touched.nominal ? errors.nominal : undefined}
                    onFormattedValue={handleChange('nominal')}
                  />

                  <View className="mb-3">
                    <Text className="mb-1 font-bold text-gray-700">
                      Foto struk / bon pemeliharaan
                    </Text>
                    {!uri ? (
                      <TouchableOpacity
                        className={`flex-row items-center gap-2 rounded-lg border border-gray-500 bg-slate-100 px-3 py-2`}
                        onPress={() => setModalVisible(true)}>
                        <AntDesign name="camera" size={24} color={'black'} />
                        <Text className="font-bold">Klik untuk ambil gambar</Text>
                      </TouchableOpacity>
                    ) : (
                      <View className="h-16 flex-row items-center justify-between gap-2 rounded-lg border border-gray-500 bg-slate-100 px-3 py-1">
                        <TouchableOpacity
                          className="flex-row items-center gap-2"
                          onPress={() => {
                            setImgBase64(uri);
                            setModalImageVisible(true);
                          }}>
                          <Image source={{ uri: uri }} className="size-10 rounded-lg" />
                          <View>
                            <Text className="font-bold">foto-struk-bon-pemeliharaan.jpg</Text>
                            <Text className="text-start text-xs">klik disini untuk lihat.</Text>
                          </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                          className="rounded-full bg-white p-1"
                          onPress={() => setUri(null)}>
                          <AntDesign name="closecircleo" size={24} color="red" />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                  <InputArea
                    className="bg-gray-50"
                    label="Keterangan"
                    placeholder="Keterangan pengembalian (opsional)"
                    value={values.keterangan}
                    onChangeText={handleChange('keterangan')}
                  />
                  <TouchableOpacity
                    className={`my-2 flex-row items-center justify-center gap-2 rounded-lg p-3 ${colors.secondary}`}
                    onPress={() => handleSubmit()}>
                    <Text className="font-bold text-white">Pemeliharaan Selesai</Text>
                    <MaterialCommunityIcons name="car" size={22} color="white" />
                  </TouchableOpacity>
                </>
              )}
            </Formik>
          )}
        </View>
      </ScrollView>
      {modalImageVisible && (
        <ModalPreviewImage
          title="Gambar Spidometer"
          visible={modalImageVisible}
          imgUrl={imgBase64 || ''}
          onPress={() => setModalImageVisible(false)}
        />
      )}
      {modalVisible ? (
        <ModalCamera
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          setUriImage={(e) => setUri(e)}
        />
      ) : null}
    </KeyboardAvoidingView>
  );
}
