import ButtonCloseImage from '@/components/ButtonCloseImage';
import ModalCamera from '@/components/ModalCamera';
import SkeletonList from '@/components/SkeletonList';
import { reLocation } from '@/hooks/locationRequired';
import secureApi from '@/services/service';
import { useEffect, useState } from 'react';
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
import { AntDesign, Entypo } from '@expo/vector-icons';
import ButtonCostum from '@/components/ButtonCostum';
import { colors } from '@/constants/colors';
import { router, useLocalSearchParams } from 'expo-router';
import { cn } from '@/utils/constants';
import { Image as ImageExpo } from 'expo-image';
import { Toast } from 'toastify-react-native';
import HandleError from '@/utils/handleError';
import ModalPreviewImage from '@/components/ModalPreviewImage';
import CustomNumberInput from '@/components/CustomNumberInput';

type propsBBMVoucher = {
  bbm_id: string;
  liter: string;
  type_bbm: string;
};

export default function BbmVoucherScreen() {
  const { kendaraan_id, reservasi_id } = useLocalSearchParams();

  const [dialogCamera, setDialogCamera] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [isError, setIsError] = useState(false);
  const [typeImage, setTypeImage] = useState('');
  const [data, setData] = useState<propsBBMVoucher>();
  const [uriLokasi, setUriLokasi] = useState<string | null>(null);
  const [uriStruck, setUriStruck] = useState<string | null>(null);
  const [spidometer, setSpidometer] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [imgBase64, setImgBase64] = useState<Base64URLString>();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await secureApi.get(`/bbm`, {
          params: {
            kendaraan_id: kendaraan_id,
          },
        });
        setData(response.data);
      } catch (error) {
        setIsError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [kendaraan_id]);

  // console.log(error);
  console.log(data);

  if (isError) {
    return (
      <View className="flex-1 items-center justify-start bg-white p-4">
        <ImageExpo
          source={require('assets/images/gif/forbidden.gif')}
          style={{ width: 300, height: 300 }}
          transition={1000}
        />
        <View className="m-5 flex-row items-center gap-3 rounded-lg bg-red-500 p-5">
          <AntDesign name="exclamationcircle" size={24} color="white" />
          <Text className="font-bold text-white">
            Pengisian BBM dengan VOUCHER dibatasi, silahkan hubungi admin atau yang yang terkait
            untuk pengajuan pengisian BBM dengan voucher
          </Text>
        </View>
        <TouchableOpacity
          className={cn('mt-4 flex-row items-center gap-2 rounded-lg p-3', colors.primary)}
          onPress={() => router.back()}>
          <Entypo name="back" size={24} color="white" />
          <Text className="text-white">Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleSubmitProsesBBM = async () => {
    setLoadingSubmit(true);
    const coordinate = await reLocation.getCoordinate();

    if (!coordinate?.lat && coordinate?.long) {
      Alert.alert('Peringatan!', 'Error device location', [{ text: 'Tutup', onPress: () => null }]);
      return;
    }

    if (uriLokasi == null || uriStruck == null) {
      Toast.show({
        type: 'error',
        text1: 'Warning!',
        text2: 'Foto nilai spidometer dan foto struk harus diisi',
        closeIconSize: 18,
        closeIconColor: '#ff0000',
      });
      setLoadingSubmit(false);
      return;
    }

    if (spidometer == null || spidometer == '') {
      Toast.show({
        type: 'error',
        text1: 'Warning!',
        text2: 'Nilai spidometer harus diisi',
        closeIconSize: 18,
        closeIconColor: '#ff0000',
      });
      setLoadingSubmit(false);
      return;
    }

    try {
      const formData = new FormData();

      formData.append('id', data?.bbm_id || '');

      formData.append('latitude', coordinate?.lat?.toString());
      formData.append('longitude', coordinate?.long.toString());
      formData.append('reservasi_id', reservasi_id ? reservasi_id.toString() : '');
      formData.append('spidometer', spidometer);
      formData.append('imgSpidometer', {
        uri: uriLokasi,
        name: 'lokasi-capture.jpg',
        type: 'image/jpeg',
      } as any);
      formData.append('imgStruk', {
        uri: uriStruck,
        name: 'struck-capture.jpg',
        type: 'image/jpeg',
      } as any);

      console.log('formData', formData);
      // return;
      await secureApi.postForm('/bbm/store_voucher', formData);
      router.dismissTo('/(protected)/(tabs)');
    } catch (error: any) {
      HandleError(error);
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleOpenCamera = (type: string) => {
    setTypeImage(type);
    setDialogCamera(true);
  };

  return (
    <KeyboardAvoidingView
      className=" bg-slate-300"
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 100}>
      <View className="absolute h-80 w-full rounded-bl-[50] rounded-br-[50]  bg-[#205781]" />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="m-4 rounded-lg bg-white p-4">
          {loading || isError ? (
            <SkeletonList loop={5} />
          ) : (
            <>
              <View className="mb-3 items-center gap-4 py-2">
                <View className="flex-row items-center text-sm text-gray-500">
                  <View className="flex-grow border-t border-gray-300" />
                  <Text className="mx-2 text-lg font-bold text-[#205781]">Pengisian BBM</Text>
                  <View className="flex-grow border-t border-gray-300" />
                </View>
                <Text className="text-center text-5xl font-bold">
                  Voucher : {data?.liter} Liter, {data?.type_bbm}
                </Text>
                <Text className="text-center text-sm">
                  Silahkan foto nilai spidometer terkini saat melakukan proses pengisian BBM
                  Kendaraan
                </Text>
              </View>
              <View className="mb-3">
                <Text className="mb-1 font-bold text-gray-700">Foto nilai spidometer</Text>
                {!uriLokasi ? (
                  <TouchableOpacity
                    className={`flex-row items-center gap-2 rounded-lg border border-gray-500 bg-slate-100 px-3 py-2`}
                    onPress={() => handleOpenCamera('lokasi')}>
                    <AntDesign name="camera" size={24} color={'black'} />
                    <Text className="font-bold">Klik untuk ambil gambar</Text>
                  </TouchableOpacity>
                ) : (
                  <View className="h-16 flex-row items-center justify-between gap-2 rounded-lg border border-gray-500 bg-slate-100 px-3 py-1">
                    <TouchableOpacity
                      className="flex-row items-center gap-2"
                      onPress={() => {
                        setImgBase64(uriLokasi);
                        setModalVisible(true);
                      }}>
                      <Image source={{ uri: uriLokasi }} className="size-10 rounded-lg" />
                      <View>
                        <Text className="font-bold">foto-spidometer.jpg</Text>
                        <Text className="text-start text-xs">klik disini untuk lihat.</Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="rounded-full bg-white p-1"
                      disabled={loading}
                      onPress={() => setUriLokasi(null)}>
                      <AntDesign name="closecircleo" size={24} color="red" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              <CustomNumberInput
                className="bg-gray-50"
                placeholder="Masukan nilai Spidometer"
                label="Nilai Spidometer"
                onFormattedValue={(raw) => setSpidometer(raw)}
              />
              <View className="mb-4">
                <Text className="mb-1 font-bold text-gray-700">Foto struk pembelian</Text>
                {!uriStruck ? (
                  <TouchableOpacity
                    className={`flex-1 flex-row items-center gap-2 rounded-lg border border-gray-500 bg-slate-100 px-3 py-2`}
                    onPress={() => handleOpenCamera('struck')}>
                    <AntDesign name="camera" size={24} color={'black'} />
                    <Text className="font-bold">Klik untuk ambil gambar</Text>
                  </TouchableOpacity>
                ) : (
                  <View className="h-16 flex-row items-center justify-between gap-2 rounded-lg border border-gray-500 bg-slate-100 px-3 py-1">
                    <TouchableOpacity
                      className="flex-row items-center gap-2"
                      onPress={() => {
                        setImgBase64(uriStruck);
                        setModalVisible(true);
                      }}>
                      <Image source={{ uri: uriStruck }} className="size-10 rounded-lg" />
                      <View>
                        <Text className="font-bold">foto-struk-pembelian.jpg</Text>
                        <Text className="text-start text-xs">klik disini untuk lihat.</Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="rounded-full bg-white p-1"
                      disabled={loading}
                      onPress={() => setUriStruck(null)}>
                      <AntDesign name="closecircleo" size={24} color="red" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <ButtonCostum
                classname={colors.secondary}
                title="Simpan Pengisian BBM"
                loading={loadingSubmit}
                onPress={handleSubmitProsesBBM}
              />
            </>
          )}
        </View>
      </ScrollView>
      {modalVisible && (
        <ModalPreviewImage
          title="Gambar Spidometer"
          visible={modalVisible}
          imgUrl={imgBase64 || ''}
          onPress={() => setModalVisible(false)}
        />
      )}
      {dialogCamera && (
        <ModalCamera
          visible={dialogCamera}
          onClose={() => setDialogCamera(false)}
          setUriImage={(e) => (typeImage == 'lokasi' ? setUriLokasi(e) : setUriStruck(e))}
        />
      )}
    </KeyboardAvoidingView>
  );
}
