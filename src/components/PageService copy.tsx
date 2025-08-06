import { View, Text, TouchableOpacity, Image as ImageLocal, ScrollView, Alert } from 'react-native';
import React, { useState } from 'react';
import { Image } from 'expo-image';
import { Link, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import secureApi from '@/services/service';
import { AntDesign, Entypo, MaterialCommunityIcons } from '@expo/vector-icons';
import { ModalRN } from './ModalRN';
import ButtonCostum from './ButtonCostum';
import { colors } from '@/constants/colors';
import ModalCamera from './ModalCamera';
import InputArea from './InputArea';
import { reLocation } from '@/hooks/locationRequired';
import { Toast } from 'toastify-react-native';
import PageServiceListImage from './PageServiceListImage';
import ModalPreviewImage from './ModalPreviewImage';

type rawData = {
  item: {
    id: number;
    name: string;
    kendaraan: string;
    kendaraan_id: string;
    no_polisi: string;
    kegiatan: string;
    created_at: string;
    keterangan: string;
    jenis_kerusakan: string;
    lokasi: string;
  };
};

type propsUseQuery = {
  id: number;
  keterangan: string;
  file_image: string;
};

const fetchDataLog = async (service_id: number) => {
  try {
    const response = await secureApi.get(`/service/list_images`, {
      params: {
        service_id: service_id,
      },
    });
    return response.data;
  } catch (error) {
    return [];
  }
};

const PageService = ({ item }: rawData) => {
  // console.log('PageService item:', item);

  const [loading, setLoading] = useState(false);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [dialogCamera, setDialogCamera] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [note, setNote] = useState('');

  const [previewImage, setPreviewImage] = useState(false);
  const [imgPreviewUrl, setImgPreviewUrl] = useState<string | null>(null);

  const handleDialogBBM = () => {
    setModalVisible(false);
    setImgUrl(null);
    setNote('');
  };

  const handleSubmit = async () => {
    setLoading(true);
    const coordinate = await reLocation.getCoordinate();

    if (!coordinate?.lat && coordinate?.long) {
      Alert.alert('Peringatan!', 'Error device location', [{ text: 'Tutup', onPress: () => null }]);
      return;
    }

    if (imgUrl == null || imgUrl == null) {
      Toast.show({
        type: 'error',
        text1: 'Warning!',
        text2: 'Foto lokasi dan foto struck harus diisi',
        useModal: true,
      });
      setLoading(false);
      return;
    }

    if (note == null || note == '') {
      Toast.show({
        type: 'error',
        text1: 'Warning!',
        text2: 'Keterangan harus diisi',
        useModal: true,
      });
      setLoading(false);
      return;
    }

    const formData = new FormData();

    formData.append('latitude', coordinate?.lat?.toString() || '');
    formData.append('longitude', coordinate?.long.toString() || '');
    formData.append('service_id', item?.id.toString() || '');
    formData.append('keterangan', note);
    formData.append('fileImage', {
      uri: imgUrl,
      name: 'service-capture.jpg',
      type: 'image/jpeg',
    } as any);

    // console.log('formData', formData);

    try {
      await secureApi.postForm('/service/image_store', formData);
      // console.log('response save ', JSON.stringify(response));

      handleDialogBBM();
      refetch();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Warning!',
        text2: JSON.stringify(error.response.data.message) || 'Terjadi kesalahan.',
        useModal: true,
      });

      // console.log('response checkpoint', JSON.stringify(error.response.data));
      // Alert.alert('Warning!', error.response.data.message, [
      //   { text: 'Tutup', onPress: () => null },
      // ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPreviewImage = (e: string) => {
    setPreviewImage(true);
    setImgPreviewUrl(e);
  };

  const handleCloseImage = () => {
    setPreviewImage(false);
    setImgPreviewUrl('');
  };

  const {
    data: fetch_service,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<propsUseQuery[]>({
    queryKey: ['fetch_service', item.id],
    queryFn: async () => await fetchDataLog(item.id),
  });

  return (
    <>
      <View className="my-2 rounded-lg bg-amber-500 p-4">
        <Text className="mb-3 text-center text-2xl font-bold">Pemiliharaan Kendaraan</Text>
        <Text className="text-center">Kendaraan</Text>
        <Text className="text-center text-4xl font-bold">{item?.kendaraan}</Text>
        <Text className="mb-2 text-center text-xl font-medium">{item?.no_polisi}</Text>
        <View className=" rounded-lg bg-white p-1 px-3">
          <Text className="text-center text-xl font-bold">{item?.jenis_kerusakan}</Text>
          <Text className="text-center font-medium">{item?.keterangan}</Text>
          <Text className="text-center font-medium">{item?.lokasi}</Text>
        </View>
      </View>
      <View className="mb-2 rounded-lg bg-white p-4">
        <View className="flex items-center justify-center gap-4 rounded-lg bg-white">
          <TouchableOpacity
            className="w-full rounded-lg bg-slate-500 p-2"
            onPress={() =>
              router.push({
                pathname: 'pengembalian-service',
                params: {
                  service_id: item?.id,
                  kendaraan_id: item?.kendaraan_id,
                },
              })
            }>
            <View className="w-full flex-row items-center gap-5">
              <Image
                style={{ width: 60, height: 60 }}
                source={require('@asset/images/done-service.png')}
              />
              <View className="w-72 text-wrap">
                <Text className="text-xl font-bold text-white">Selesai Pemiliharaan</Text>
                <Text className="text-sm">
                  Klik disini untuk memproses mengembalikan kendaraan / pemiliharaan kendaraan telah
                  selesai
                </Text>
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            className="w-full rounded-lg bg-teal-400 p-2"
            onPress={() => setModalVisible(true)}>
            <View className="w-full flex-row items-center gap-5">
              <Image
                style={{ width: 60, height: 60 }}
                source={require('@asset/images/camera.png')}
              />
              <View className="w-72 text-wrap">
                <Text className="text-xl font-bold">Foto Aktivitas</Text>
                <Text className="text-sm">
                  Klik disini untuk pengambilan gambar waktu pemiliharaan / foto struk pembelian
                  barang
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <PageServiceListImage
        items={fetch_service ?? []}
        isLoading={isLoading}
        onPress={(e) => handleOpenPreviewImage(e)}
      />
      <ModalRN visible={isModalVisible} onClose={handleDialogBBM}>
        <ModalRN.Header>
          <Text className="text-center text-xl font-bold">
            Foto Aktivitas Pemiliharan Kendaraan
          </Text>
          <Text className="text-center">
            Silahkan aktivitas pemiliharaan atau struck dari pemiliharaan Kendaraan sebagai bukti
          </Text>
        </ModalRN.Header>
        <ModalRN.Content>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
            <View className="mb-4">
              <Text className="font-bold">Foto</Text>
              {!imgUrl ? (
                <>
                  <TouchableOpacity
                    className="my-2 flex-row items-center justify-center rounded-lg bg-indigo-500 p-2"
                    onPress={() => setDialogCamera(true)}>
                    <AntDesign name="camera" size={28} />
                    <Text className="ms-2 font-bold text-white">Ambil Gambar</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <View className="w-full rounded-lg bg-black">
                  <ImageLocal source={{ uri: imgUrl }} className="aspect-[3/4] w-full rounded-lg" />
                  <TouchableOpacity
                    className="absolute right-2 top-2 rounded-full bg-white p-1"
                    onPress={() => setImgUrl(null)}>
                    <AntDesign name="closecircleo" size={32} color="red" />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <InputArea
              className="bg-gray-50"
              label="Keterangan"
              placeholder="keteragan..."
              value={note}
              onChangeText={(note) => setNote(note)}
            />
          </ScrollView>
        </ModalRN.Content>
        <ModalRN.Footer>
          <View className="flex-row gap-2">
            <ButtonCostum
              classname={colors.warning}
              title="Exit"
              loading={loading}
              onPress={handleDialogBBM}
            />
            <ButtonCostum
              classname={colors.primary}
              title="Simpan"
              loading={loading}
              onPress={handleSubmit}
            />
          </View>
        </ModalRN.Footer>
      </ModalRN>
      <ModalCamera
        visible={dialogCamera}
        onClose={() => setDialogCamera(false)}
        setUriImage={(e) => setImgUrl(e)}
      />
      <ModalPreviewImage
        title={'Preview Image'}
        imgUrl={imgPreviewUrl || ''}
        visible={previewImage}
        onPress={() => handleCloseImage()}
      />
    </>
  );
};

export default PageService;
