import { View, Text, TouchableOpacity, Image as ImageLocal, ScrollView, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Image } from 'expo-image';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import secureApi from '@/services/service';
import { AntDesign, Entypo, MaterialCommunityIcons } from '@expo/vector-icons';
import { ModalRN } from '@/components/ModalRN';
import ButtonCostum from '@/components/ButtonCostum';
import { colors } from '@/constants/colors';
import ModalCamera from '@/components/ModalCamera';
import InputArea from '@/components/InputArea';
import { reLocation } from '@/hooks/locationRequired';
import { Toast } from 'toastify-react-native';
import PageServiceListImage from '@/components/PageServiceListImage';
import ModalPreviewImage from '@/components/ModalPreviewImage';
import { useLoadingStore } from '@/stores/loadingStore';
import dayjs from 'dayjs';

type rawData = {
  id: number;
  name: string;
  kendaraan_id: string;
  no_polisi: string;
  created_at: string;
  keterangan: string;
  jenis_kerusakan: string;
  lokasi: string;
};

type propsUseQuery = {
  id: number;
  keterangan: string;
  file_image: string;
};

type propsService = {
  id: string;
  name: string;
  no_polisi: string;
  keterangan: string;
  jenis_kerusakan: string;
  lokasi: string;
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

export default function PemiliharaanNestedScreen() {
  const setLoading = useLoadingStore((state) => state.setLoading);
  // console.log('PageService item:', item);
  const { service_id } = useLocalSearchParams();

  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [dialogCamera, setDialogCamera] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [note, setNote] = useState('');
  const [row, setRow] = useState<rawData>();
  const [previewImage, setPreviewImage] = useState(false);
  const [imgPreviewUrl, setImgPreviewUrl] = useState<string | null>(null);
  const [pageError, setPageError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await secureApi.get(`/service/data_aktif`, {
          params: {
            service_id: service_id,
          },
        });

        setRow(response.data);
      } catch (error) {
        setPageError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [service_id]);

  const handleDialogBBM = () => {
    setModalVisible(false);
    setImgUrl(null);
    setNote('');
  };

  const handleSubmit = async () => {
    setLoadingSubmit(true);
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
      setLoadingSubmit(false);
      return;
    }

    if (note == null || note == '') {
      Toast.show({
        type: 'error',
        text1: 'Warning!',
        text2: 'Keterangan harus diisi',
        useModal: true,
      });
      setLoadingSubmit(false);
      return;
    }
    try {
      const formData = new FormData();

      formData.append('latitude', coordinate?.lat?.toString() || '');
      formData.append('longitude', coordinate?.long.toString() || '');
      formData.append('service_id', row?.id.toString() || '');
      formData.append('keterangan', note);
      formData.append('fileImage', {
        uri: imgUrl,
        name: 'service-capture.jpg',
        type: 'image/jpeg',
      } as any);

      console.log('formData', formData);
      // return;
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
      setLoadingSubmit(false);
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
    queryKey: ['fetch_service', row?.id],
    queryFn: async () => await fetchDataLog(row?.id ?? 0),
  });

  return (
    <View className="flex-1 gap-4 bg-slate-300 p-4">
      <TouchableOpacity onPress={() => router.push('/')}>
        <View className="flex-row items-center justify-center gap-2 rounded-lg bg-stone-800 p-2">
          <AntDesign name="back" size={24} color="white" />
          <Text className="text-white">Kembali</Text>
        </View>
      </TouchableOpacity>
      <View className="rounded-lg bg-amber-200 p-4">
        <Text className="text-center">Kendaraan</Text>
        <Text className="text-center text-4xl font-bold">{row?.name}</Text>
        <Text className="mb-2 text-center text-xl font-medium">{row?.no_polisi}</Text>
        <Text className="mb-2 text-center font-medium">
          {dayjs(row?.created_at).format('dddd ,DD MMMM YYYY | HH:mm')}
        </Text>
        <View className=" rounded-lg bg-gray-100 p-1 px-3">
          <Text className="text-center text-xl font-bold">{row?.jenis_kerusakan}</Text>
          <Text className="text-center font-medium">{row?.keterangan}</Text>
          <Text className="text-center">Lokasi : </Text>
          <Text className="text-center font-medium">{row?.lokasi}</Text>
        </View>
      </View>
      <View className="mb-2 rounded-lg bg-white p-4">
        <View className="flex items-center justify-center gap-4 rounded-lg bg-white">
          <TouchableOpacity
            className="w-full rounded-lg bg-slate-200 p-2"
            onPress={() =>
              router.push({
                pathname: 'pengembalian-service',
                params: {
                  service_id: row?.id,
                  kendaraan_id: row?.kendaraan_id,
                },
              })
            }>
            <View className="w-full flex-row items-center gap-5">
              <Image
                style={{ width: 60, height: 60 }}
                source={require('@asset/images/done-service.png')}
              />
              <View className="w-72 text-wrap">
                <Text className="text-xl font-bold">Selesai Pemeliharaan</Text>
                <Text className="text-sm">
                  Klik disini untuk memproses mengembalikan kendaraan / pemeliharaan kendaraan telah
                  selesai
                </Text>
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            className="w-full rounded-lg bg-teal-200 p-2"
            onPress={() => setModalVisible(true)}>
            <View className="w-full flex-row items-center gap-5">
              <Image
                style={{ width: 60, height: 60 }}
                source={require('@asset/images/camera.png')}
              />
              <View className="w-72 text-wrap">
                <Text className="text-xl font-bold">Foto Aktivitas</Text>
                <Text className="text-sm">
                  Klik disini untuk pengambilan gambar waktu pemeliharaan / foto struk pembelian
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
            Silahkan foto aktivitas atau struck dari pemeliharaan Kendaraan, untuk sebagai bukti
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
              loading={loadingSubmit}
              onPress={handleDialogBBM}
            />
            <ButtonCostum
              classname={colors.primary}
              title="Simpan"
              loading={loadingSubmit}
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
    </View>
  );
}
