import ButtonCloseImage from '@/components/ButtonCloseImage';
import ModalCamera from '@/components/ModalCamera';
import { reLocation } from '@/hooks/locationRequired';
import secureApi from '@/services/service';
import { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { AntDesign, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import ButtonCostum from '@/components/ButtonCostum';
import { colors } from '@/constants/colors';
import { useQuery } from '@tanstack/react-query';
import { dataDetail } from '@/types/types';
import { router, useLocalSearchParams } from 'expo-router';
import CustomNumberInput from '@/components/CustomNumberInput';
import { Toast } from 'toastify-react-native';
import HandleError from '@/utils/handleError';
import { Dropdown } from 'react-native-element-dropdown';
import ModalPreviewImage from '@/components/ModalPreviewImage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const fetchData = async (reservasi_id: string) => {
  const response = await secureApi.get(`/reservasi/cek_data_aktif`, {
    params: {
      reservasi_id: reservasi_id,
    },
  });
  return response.data;
};

export default function BbmUangScreen() {
  const insets = useSafeAreaInsets();

  const { kendaraan_id, reservasi_id } = useLocalSearchParams();

  const [dialogCamera, setDialogCamera] = useState(false);
  const [loading, setLoading] = useState(false);

  const [typeImage, setTypeImage] = useState('');
  const [uriLokasi, setUriLokasi] = useState<string | null>(null);
  const [uriSpidometer, setUriSpidometer] = useState<string | null>(null);
  const [uriStruck, setUriStruck] = useState<string | null>(null);
  const [uang, setUang] = useState('');
  const [spidometer, setSpidometer] = useState('');
  const [typeBbm, setTypeBbm] = useState('');
  const [isFocus, setIsFocus] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [imgBase64, setImgBase64] = useState<Base64URLString>();

  const { data, isLoading, error, isError } = useQuery<dataDetail>({
    queryKey: ['pengembalian', reservasi_id],
    queryFn: () => fetchData(reservasi_id.toString()),
  });

  if (isError) {
    Alert.alert('Peringatan!', 'Data tidak valid atau kendaraan tidak aktif!', [
      { text: 'Kembali', onPress: () => router.back() },
    ]);
  }

  const handleSubmitProsesBBM = async () => {
    setLoading(true);
    const coordinate = await reLocation.getCoordinate();

    if (!coordinate?.lat && coordinate?.long) {
      Alert.alert('Peringatan!', 'Error device location', [{ text: 'Tutup', onPress: () => null }]);
      return;
    }

    if (uriSpidometer == null || uriStruck == null) {
      Toast.show({
        type: 'error',
        text1: 'Warning!',
        text2: 'Foto nilai spidometer dan foto struk pembelian BBM harus diambil',
        closeIconSize: 18,
        closeIconColor: '#ff0000',
      });
      setLoading(false);
      return;
    }

    if (uang == null || uang == '') {
      Toast.show({
        type: 'error',
        text1: 'Warning!',
        text2: 'Nominal uang harus diisi',
        closeIconSize: 18,
        closeIconColor: '#ff0000',
      });
      setLoading(false);
      return;
    }

    if (typeBbm == null || typeBbm == '') {
      Toast.show({
        type: 'error',
        text1: 'Warning!',
        text2: 'Jenis BBM harus diisi',
        closeIconSize: 18,
        closeIconColor: '#ff0000',
      });
      setLoading(false);
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
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();

      formData.append('latitude', coordinate?.lat?.toString());
      formData.append('longitude', coordinate?.long.toString());
      formData.append('reservasi_id', reservasi_id ? reservasi_id.toString() : '');
      formData.append('kendaraan_id', kendaraan_id ? kendaraan_id.toString() : '');
      formData.append('jenis', 'Uang');
      formData.append('uang', uang);
      formData.append('type_bbm', typeBbm);
      formData.append('spidometer', spidometer);
      formData.append('imgSpidometer', {
        uri: uriSpidometer,
        name: 'spidometer-capture.jpg',
        type: 'image/jpeg',
      } as any);
      formData.append('imgStruk', {
        uri: uriStruck,
        name: 'struck-capture.jpg',
        type: 'image/jpeg',
      } as any);

      // console.log('formData', formData);
      // return;
      await secureApi.postForm('/bbm/store_uang', formData);
      router.dismissTo('/(protected)/(tabs)');
      // console.log('response save ', JSON.stringify(response));
      // await SecureStore.setItemAsync('Checkpoint', JSON.stringify(response.data));
      // handleDialogExit();
      // handleReload();
    } catch (error: any) {
      HandleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCamera = (type: string) => {
    setTypeImage(type);
    setDialogCamera(true);
  };

  const handleUriCamera = (uri: string | null) => {
    if (typeImage == 'lokasi') {
      setUriLokasi(uri);
    } else if (typeImage == 'struck') {
      setUriStruck(uri);
    } else if (typeImage == 'spidometer') {
      setUriSpidometer(uri);
    }
  };

  const dataDrowdown = [
    { label: 'Pertalite', value: 'Pertalite' },
    { label: 'Pertamax', value: 'Pertamax' },
    { label: 'Pertamax Turbo', value: 'Pertamax Turbo' },
    { label: 'Dexlite', value: 'Dexlite' },
    { label: 'Pertamina Dex', value: 'Pertamina Dex' },
    { label: 'Bio Solar (Solar)', value: 'Bio Solar (Solar)' },
  ];

  return (
    <KeyboardAvoidingView
      className="bg-slate-300"
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : insets.bottom}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="absolute h-80 w-full rounded-bl-[50] rounded-br-[50]  bg-[#205781]" />
        <View className="m-4 rounded-lg bg-white p-4">
          <View className="mb-3 items-center gap-4 py-2">
            <View className="flex-row items-center text-sm text-gray-500">
              <View className="flex-grow border-t border-gray-300" />
              <Text className="mx-2 text-lg font-bold text-[#205781]">
                Pengisian BBM Dengan Uang
              </Text>
              <View className="flex-grow border-t border-gray-300" />
            </View>
            <Text className="text-center text-sm">
              Proses pengisian BBM dengan Uang, silahkan ambil foto nilai spidometer terkini dan
              struk pengisian BBM Kendaraan.
            </Text>
          </View>
          <View className="mb-3">
            <Text className="mb-1 font-bold text-gray-700">Foto nilai spidometer</Text>
            {!uriSpidometer ? (
              <TouchableOpacity
                className={`flex-row items-center gap-2 rounded-lg border border-gray-500 bg-slate-100 px-3 py-2`}
                onPress={() => handleOpenCamera('spidometer')}>
                <AntDesign name="camera" size={24} color={'black'} />
                <Text className="font-bold">Klik untuk ambil gambar</Text>
              </TouchableOpacity>
            ) : (
              <View className="h-16 flex-row items-center justify-between gap-2 rounded-lg border border-gray-500 bg-slate-100 px-3 py-1">
                <TouchableOpacity
                  className="flex-row items-center gap-2"
                  onPress={() => {
                    setImgBase64(uriSpidometer);
                    setModalVisible(true);
                  }}>
                  <Image source={{ uri: uriSpidometer }} className="size-10 rounded-lg" />
                  <View>
                    <Text className="font-bold">foto-spidometer.jpg</Text>
                    <Text className="text-start text-xs">klik disini untuk lihat.</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  className="rounded-full bg-white p-1"
                  disabled={loading}
                  onPress={() => setUriSpidometer(null)}>
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
            <Text className="mb-1 font-bold text-gray-700">Jenis BBM</Text>
            <Dropdown
              style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              data={dataDrowdown}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder={!isFocus ? 'Pilih Jenis BBM' : '...'}
              searchPlaceholder="Search..."
              value={typeBbm}
              onFocus={() => setIsFocus(true)}
              onBlur={() => setIsFocus(false)}
              onChange={(item) => {
                setTypeBbm(item.value);
                setIsFocus(false);
              }}
            />
          </View>

          <CustomNumberInput
            className="bg-gray-50"
            placeholder="Masukan nominal uang"
            label="Uang"
            onFormattedValue={(raw) => setUang(raw)}
          />

          <View className="mb-4">
            <Text className="mb-1 font-bold text-gray-700">Foto struk pembelian</Text>
            {!uriStruck ? (
              <TouchableOpacity
                className={`flex-row items-center gap-2 rounded-lg border border-gray-500 bg-slate-100 px-3 py-2`}
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
            loading={loading}
            onPress={handleSubmitProsesBBM}
          />
        </View>
      </ScrollView>
      {dialogCamera && (
        <ModalCamera
          visible={dialogCamera}
          onClose={() => setDialogCamera(false)}
          setUriImage={(e) => handleUriCamera(e)}
        />
      )}

      {modalVisible && (
        <ModalPreviewImage
          title="Gambar Spidometer"
          visible={modalVisible}
          imgUrl={imgBase64 || ''}
          onPress={() => setModalVisible(false)}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 16,
  },
  dropdown: {
    height: 42,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: 'absolute',
    backgroundColor: 'white',
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});
