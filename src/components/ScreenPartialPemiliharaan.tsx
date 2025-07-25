import { View, Text, TouchableOpacity, Image, Alert, TouchableHighlight } from 'react-native';
import React, { useEffect, useState } from 'react';
import secureApi from '@/services/service';
import SkeletonList from './SkeletonList';
import ButtonCostum from './ButtonCostum';
import { colors } from '@/constants/colors';
import { ModalRN } from './ModalRN';
import ModalCamera from './ModalCamera';
import { router } from 'expo-router';
import { reLocation } from '@/hooks/locationRequired';
import { AntDesign, Entypo, MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenPartialPemakaianCheckpoint from './ScreenPartialPemakaianCheckpoint';
import ButtonCloseImage from './ButtonCloseImage';
import { Checkpoint } from '@/types/types';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import ModalPreviewImage from './ModalPreviewImage';

const fetchDataLog = async (reservasi_id: string) => {
  try {
    const response = await secureApi.get(`/checkpoint/pemakaian`, {
      params: {
        reservasi_id: reservasi_id,
      },
    });
    return response.data;
  } catch (error) {
    return [];
  }
};

export default function ScreenPartialPemakaian({ items }: any) {
  const [isLoading, setIsLoading] = useState(false);

  const [checkpointAktif, setCheckpointAktif] = useState(false);

  const [checkpointID, setCheckpointID] = useState<string | null>();

  const [titleModalImage, setTitleModalImage] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [imgUrl, setImgUrl] = useState<string>();

  useEffect(() => {
    fetchData();
  }, [items]);

  const {
    data: dataAllBbm,
    isLoading: isIsLoading,
    isError,
    error,
    refetch,
  } = useQuery<Checkpoint[]>({
    queryKey: ['dataAllBbm', items.id],
    queryFn: async () => await fetchDataLog(items.id),
    enabled: !!items.id,
  });

  const fetchData = async () => {
    setIsLoading(true);
    // console.log('checkpoint:');
    if (items) {
      try {
        const response = await secureApi.get(`checkpoint/aktif`, {
          params: {
            reservasi_id: items.id,
          },
        });
        console.log('respon :', response);

        if (response.status == true) {
          setCheckpointID(response.data.checkpoint_id);
          setCheckpointAktif(true);
        }
      } catch (error: any) {
        setCheckpointAktif(false);
        console.log('Terjadi error checkpoint:', JSON.stringify(error.response.data.message));
      }
    }
    setIsLoading(false);
  };

  const [dialogCamera, setDialogCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dialogExit, setDialogExit] = useState(false);
  const [uri, setUri] = useState<string | null>(null);

  const handleDialogExit = () => {
    setDialogExit(false);
    setUri(null);
  };

  const handleSubmitProsesBBM = async () => {
    setLoading(true);
    const coordinate = await reLocation.getCoordinate();

    if (!coordinate?.lat && coordinate?.long) {
      Alert.alert('Peringatan!', 'Error device location', [{ text: 'Tutup', onPress: () => null }]);
      return;
    }

    try {
      const formData = new FormData();

      formData.append('latitude', coordinate?.lat?.toString());
      formData.append('longitude', coordinate?.long.toString());
      formData.append('reservasi_id', items.id);
      formData.append('fileImage', {
        uri: uri,
        name: 'spidometer-capture.jpg',
        type: 'image/jpeg',
      } as any);

      console.log('formData', formData);

      const response = await secureApi.postForm('/checkpoint/save', formData);
      console.log('response save ', JSON.stringify(response));

      handleDialogExit();
      handleReload();
      setLoading(false);
    } catch (error: any) {
      if (error.response && error.response.data) {
        const msg = error.response.data.message || 'Terjadi kesalahan.';
        Alert.alert('Warning!', msg, [{ text: 'Tutup', style: 'cancel' }]);
      } else if (error.request) {
        Alert.alert('Network Error', 'Tidak bisa terhubung ke server. Cek koneksi kamu.');
      } else {
        Alert.alert('Error', error.message);
      }
      setLoading(false);
    }
  };

  const handleReload = () => {
    fetchData();
    refetch();
  };

  const handleShowImage = (url: string, title: string) => {
    setTitleModalImage(title);
    setImgUrl(url);
    setModalVisible(true);
  };

  const handleCloseImage = () => {
    setModalVisible(false);
    setImgUrl('');
  };

  if (isLoading) {
    return <SkeletonList loop={2} />;
  }

  if (checkpointAktif) {
    return (
      <ScreenPartialPemakaianCheckpoint
        reservasi_id={items.id}
        checkpoint_id={checkpointID}
        reload={() => handleReload()}
      />
    );
  }

  return (
    <>
      <View className="rounded-lg bg-white p-4">
        {/* <TouchableOpacity
          className={`my-2 flex-row items-center justify-center gap-2 rounded-lg p-3 ${colors.primary}`}
          onPress={() => setDialogExit(!dialogExit)}>
          <MaterialCommunityIcons name="gas-station" size={22} color="white" />
          <Text className="font-bold text-white">Proses Pengisiaan BBM</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`my-2 flex-row items-center justify-center gap-2 rounded-lg p-3 ${colors.secondary}`}
          onPress={() =>
            router.push({
              pathname: 'pengembalian',
              params: {
                reservasi_id: items?.id,
              },
            })
          }>
          <Text className="font-bold text-white">Pemiliharaan Selesai</Text>

          <MaterialCommunityIcons name="car" size={22} color="white" />
        </TouchableOpacity> */}
        <View className="flex items-center justify-center gap-4 rounded-lg bg-white">
          <TouchableOpacity
            className="rounded-lg bg-slate-500 p-4"
            onPress={() =>
              router.push({
                pathname: 'pengembalian',
                params: {
                  reservasi_id: items?.id,
                },
              })
            }>
            <View className="w-full flex-row items-center gap-5">
              <Image
                style={{ width: 60, height: 60 }}
                source={require('@asset/images/return-car.png')}
              />
              <View className="w-72 text-wrap">
                <Text className="text-xl font-bold text-white">Pengembalian Kendaraan</Text>
                <Text className="text-sm">Klik disini untuk mengembalikan kendaraan</Text>
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            className="rounded-lg bg-red-400 p-4"
            onPress={() => setDialogExit(!dialogExit)}>
            <View className="w-full flex-row items-center gap-5">
              <Image
                style={{ width: 60, height: 60 }}
                source={require('@asset/images/gas-station1.png')}
              />
              <View className="w-72 text-wrap">
                <Text className="text-xl font-bold text-white">Pengisian BBM Kendaraan</Text>
                <Text className="text-sm">Klik disini untuk proses pengisian BBM ke SPBU</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <Text className="my-3 font-bold">Log pengisian BBM</Text>
      {dataAllBbm ? (
        dataAllBbm?.map((item) =>
          item.data.length > 0 ? (
            <View key={item.id} className="mb-2 rounded-lg bg-[#F2E5BF] p-4">
              <View className="mb-1 flex-row items-center justify-between rounded-lg">
                <View>
                  <Text className="font-bold">{item.checkpoint_name}</Text>
                  <Text>{dayjs(item.checkpoint_in).format('dddd ,DD MMMM YYYY')}</Text>
                  <Text>Jam : {dayjs(item.checkpoint_in).format('HH:ss')}</Text>
                </View>
                <TouchableHighlight
                  onPress={() => handleShowImage(item.image, 'Foto proses pengisian BBM')}
                  className="rounded-lg bg-gray-300 p-1 ">
                  <View className="flex-row items-center">
                    <Entypo name="images" size={24} color="black" />
                    <Text className="ms-5 text-center">gambar pengisian</Text>
                  </View>
                </TouchableHighlight>
              </View>
              {item.data.map((itx, ii) => (
                <View className="mb-3 gap-2 rounded-lg bg-white p-4" key={itx.id}>
                  <View className="flex-row">
                    <Text className="font-bold">Dengan {itx.jenis}</Text>
                    <Text>
                      {itx.jenis == 'Voucher'
                        ? ` : ${itx.liter} Liter`
                        : ` : Nominal Rp.${parseFloat(Number(itx.uang).toFixed(2)).toLocaleString()}`}
                    </Text>
                  </View>
                  <View>
                    <TouchableHighlight
                      onPress={() => handleShowImage(itx.image, 'Foto Bon / Struck pembelian BBM')}
                      className="rounded-lg bg-gray-300 p-1 ">
                      <View className="flex-row items-center">
                        <Entypo name="images" size={24} color="black" />
                        <Text className="ms-5 text-center">gambar struk / bon</Text>
                      </View>
                    </TouchableHighlight>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View
              key={item.id}
              className="mb-2 items-center justify-between rounded-lg bg-white p-4">
              <Text className="text-center ">-----</Text>
            </View>
          )
        )
      ) : (
        <View className="mb-2 items-center justify-between rounded-lg bg-white p-4">
          <Text className="text-center ">-----</Text>
        </View>
      )}

      <ModalRN visible={dialogExit} onClose={handleDialogExit}>
        <ModalRN.Header>
          <Text className="text-center font-bold">Proses Pengisian BBM Kendaraan</Text>
          <Text className="text-center text-sm">
            Silahkan foto kondisi terkini saat melakukan proses pengisian BBM Kendaraan
          </Text>
        </ModalRN.Header>
        <ModalRN.Content>
          {!uri ? (
            <TouchableOpacity
              className="my-3 flex-row items-center justify-center rounded-lg bg-indigo-500 px-3 py-1"
              onPress={() => setDialogCamera(true)}>
              <AntDesign name="camera" size={32} />
              <Text className="ms-2 font-bold text-white">Open Camera</Text>
            </TouchableOpacity>
          ) : (
            <View className="w-full rounded-lg bg-black">
              <Image
                source={{ uri: uri || undefined }}
                className="aspect-[3/4] w-full rounded-lg"
              />
              <ButtonCloseImage onPress={() => setUri(null)} loading={loading} />
            </View>
          )}
        </ModalRN.Content>
        <ModalRN.Footer>
          <View className="flex-row gap-2">
            <ButtonCostum
              classname={colors.warning + ` w-full`}
              title="Tutup"
              loading={loading}
              onPress={handleDialogExit}
            />
            {uri && (
              <ButtonCostum
                classname={colors.primary}
                title="Pengisian BBM"
                loading={loading}
                onPress={handleSubmitProsesBBM}
              />
            )}
          </View>
        </ModalRN.Footer>
      </ModalRN>
      <ModalPreviewImage
        title={titleModalImage}
        imgUrl={imgUrl || ''}
        visible={modalVisible}
        onPress={() => handleCloseImage()}
      />
      <ModalCamera
        visible={dialogCamera}
        onClose={() => setDialogCamera(false)}
        setUriImage={(e) => setUri(e)}
      />
    </>
  );
}
