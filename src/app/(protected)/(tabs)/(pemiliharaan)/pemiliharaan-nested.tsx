import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image as ImageLocal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Toast } from 'toastify-react-native';

import SubmitOverlay from '@/components/feedback/SubmitOverlay';
import ButtonCostum from '@/components/forms/ButtonCostum';
import InputArea from '@/components/forms/InputArea';
import ModalCamera from '@/components/modals/ModalCamera';
import ModalPreviewImage from '@/components/modals/ModalPreviewImage';
import { ModalRN } from '@/components/modals/ModalRN';
import PageServiceListImage from '@/components/sections/PageServiceListImage';
import { colors } from '@/constants/colors';
import { reLocation } from '@/hooks/locationRequired';
import secureApi from '@/services/service';
import HandleError from '@/utils/handleError';

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

const fetchDataLog = async (service_id: number) => {
  try {
    const response = await secureApi.get(`/service/list_images`, {
      params: { service_id },
    });
    return response.data;
  } catch {
    return [];
  }
};

export default function PemiliharaanNestedScreen() {
  const insets = useSafeAreaInsets();
  const { service_id } = useLocalSearchParams();

  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [dialogCamera, setDialogCamera] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [note, setNote] = useState('');
  const [row, setRow] = useState<rawData>();
  const [previewImage, setPreviewImage] = useState(false);
  const [imgPreviewUrl, setImgPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingPage(true);
      try {
        const response = await secureApi.get(`/service/data_aktif`, {
          params: { service_id },
        });
        setRow(response.data);
      } catch {
        // ignore — error sudah di-handle global lewat secureApi interceptor
      } finally {
        setLoadingPage(false);
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
    if (!imgUrl) {
      Toast.show({
        type: 'error',
        text1: 'Foto belum diambil',
        text2: 'Foto aktivitas harus dilampirkan sebagai bukti',
      });
      return;
    }
    if (!note.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Keterangan kosong',
        text2: 'Tulis keterangan singkat tentang aktivitas',
      });
      return;
    }

    setLoadingSubmit(true);
    const coordinate = await reLocation.getCoordinate();
    if (!coordinate?.lat || !coordinate?.long) {
      Toast.show({
        type: 'error',
        text1: 'Lokasi tidak terdeteksi',
        text2: 'Aktifkan GPS dan coba lagi.',
      });
      setLoadingSubmit(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('latitude', coordinate.lat.toString());
      formData.append('longitude', coordinate.long.toString());
      formData.append('service_id', row?.id.toString() ?? '');
      formData.append('keterangan', note);
      formData.append('fileImage', {
        uri: imgUrl,
        name: 'service-capture.jpg',
        type: 'image/jpeg',
      } as any);

      await secureApi.postForm('/service/image_store', formData);
      handleDialogBBM();
      refetch();
    } catch (error: unknown) {
      HandleError(error);
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
    refetch,
  } = useQuery<propsUseQuery[]>({
    queryKey: ['fetch_service', row?.id],
    queryFn: async () => await fetchDataLog(row?.id ?? 0),
  });

  return (
    <View className="flex-1 bg-slate-100">
      {/* Brand header */}
      <View className="bg-brand px-4 pb-8" style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            hitSlop={8}
            className="rounded-full bg-white/15 p-2">
            <Feather name="arrow-left" size={18} color="white" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-white">Detail Pemeliharaan</Text>
            <Text className="mt-0.5 text-xs text-white/70">Aktivitas pemeliharaan kendaraan</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}>
        {/* Vehicle card overlapping header */}
        <View className="mx-4 mt-5 overflow-hidden rounded-2xl bg-white shadow-sm">
          <View className="flex-row items-center gap-2 bg-amber-500 px-4 py-2.5">
            <View className="rounded-full bg-white/20 p-1.5">
              <MaterialCommunityIcons name="car-cog" size={14} color="white" />
            </View>
            <Text className="text-xs font-medium text-white/90">Pemeliharaan Aktif</Text>
            <View className="flex-1" />
            {row?.created_at ? (
              <View className="flex-row items-center gap-1 rounded-full bg-white/20 px-2 py-0.5">
                <Feather name="clock" size={10} color="white" />
                <Text className="text-[10px] font-medium text-white">
                  {dayjs(row.created_at).format('DD MMM, HH:mm')}
                </Text>
              </View>
            ) : null}
          </View>

          <View className="px-4 py-4">
            <Text className="text-2xl font-bold text-gray-800">{row?.name || '-'}</Text>
            <View className="mt-1 flex-row items-center gap-2">
              <View className="rounded-md bg-amber-500 px-2 py-0.5">
                <Text className="text-xs font-bold uppercase tracking-wider text-white">
                  {row?.no_polisi || '-'}
                </Text>
              </View>
            </View>
          </View>

          {/* Damage info */}
          <View className="border-t border-slate-100 bg-slate-50 px-4 py-3">
            <View className="mb-2 flex-row items-center gap-2">
              <MaterialCommunityIcons name="wrench" size={14} color="#d97706" />
              <Text className="text-xs font-bold uppercase tracking-wider text-amber-700">
                {row?.jenis_kerusakan || '-'}
              </Text>
            </View>
            {row?.keterangan ? (
              <View className="mb-1.5 flex-row items-start gap-2">
                <Feather name="message-square" size={12} color="#64748b" />
                <Text className="flex-1 text-xs text-gray-600">{row.keterangan}</Text>
              </View>
            ) : null}
            {row?.lokasi ? (
              <View className="flex-row items-start gap-2">
                <Feather name="map-pin" size={12} color="#64748b" />
                <Text className="flex-1 text-xs text-gray-600">{row.lokasi}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Action cards */}
        <View className="mx-4 mt-4 gap-3">
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() =>
              router.push({
                pathname: 'pengembalian-service',
                params: {
                  service_id: row?.id,
                  kendaraan_id: row?.kendaraan_id,
                },
              })
            }
            className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <View className="flex-row items-center gap-3 p-4">
              <View className="rounded-xl bg-emerald-50 p-3">
                <Image
                  style={{ width: 44, height: 44 }}
                  source={require('@asset/images/done-service.png')}
                  contentFit="contain"
                />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-gray-800">Selesai Pemeliharaan</Text>
                <Text className="mt-0.5 text-xs text-gray-500">
                  Proses pengembalian kendaraan setelah pemeliharaan tuntas
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color="#cbd5e1" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setModalVisible(true)}
            className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <View className="flex-row items-center gap-3 p-4">
              <View className="rounded-xl bg-teal-50 p-3">
                <Image
                  style={{ width: 44, height: 44 }}
                  source={require('@asset/images/camera.png')}
                  contentFit="contain"
                />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-gray-800">Tambah Foto Aktivitas</Text>
                <Text className="mt-0.5 text-xs text-gray-500">
                  Foto kegiatan pemeliharaan / struk pembelian sparepart
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color="#cbd5e1" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Photo log */}
        <View className="mx-4 mt-4">
          <View className="mb-3 flex-row items-center gap-2">
            <Feather name="image" size={16} color="#205781" />
            <Text className="text-sm font-bold text-gray-800">Riwayat Foto Aktivitas</Text>
            {(fetch_service?.length ?? 0) > 0 ? (
              <View className="rounded-full bg-brand px-2 py-0.5">
                <Text className="text-[10px] font-bold text-white">{fetch_service?.length}</Text>
              </View>
            ) : null}
          </View>
          <PageServiceListImage
            items={fetch_service ?? []}
            isLoading={isLoading}
            onPress={(e) => handleOpenPreviewImage(e)}
          />
        </View>
      </ScrollView>

      {/* Photo upload sheet */}
      {isModalVisible && (
        <ModalRN visible={isModalVisible} onClose={handleDialogBBM}>
          <ModalRN.Header>
            <View className="flex-row items-center gap-2">
              <View className="rounded-full bg-teal-100 p-1.5">
                <Feather name="camera" size={14} color="#0d9488" />
              </View>
              <Text className="text-base font-bold text-gray-800">Foto Aktivitas</Text>
            </View>
            <Text className="mt-1 text-xs text-gray-500">
              Lampirkan foto aktivitas / struk pembelian sebagai bukti pemeliharaan
            </Text>
          </ModalRN.Header>
          <ModalRN.Content>
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
              <View className="mb-4">
                <Text className="mb-2 text-sm font-semibold text-gray-700">Foto</Text>
                {!imgUrl ? (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setDialogCamera(true)}
                    className="flex-row items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-slate-50 py-5">
                    <View className="rounded-full bg-white p-2">
                      <Feather name="camera" size={20} color="#205781" />
                    </View>
                    <Text className="text-sm font-medium text-gray-600">
                      Ketuk untuk ambil foto
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                    <ImageLocal
                      source={{ uri: imgUrl }}
                      className="aspect-[4/3] w-full"
                      resizeMode="cover"
                    />
                    <View className="flex-row items-center justify-between border-t border-gray-100 bg-slate-50 px-3 py-2">
                      <View className="flex-row items-center gap-2">
                        <Feather name="check-circle" size={14} color="#10b981" />
                        <Text className="text-xs font-medium text-emerald-600">
                          Foto siap dikirim
                        </Text>
                      </View>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => setImgUrl(null)}
                        className="flex-row items-center gap-1 rounded-md bg-red-50 px-2 py-1">
                        <Feather name="trash-2" size={12} color="#ef4444" />
                        <Text className="text-xs font-medium text-red-500">Ulangi</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>

              <InputArea
                className="bg-gray-50"
                label="Keterangan"
                placeholder="Catatan singkat tentang aktivitas..."
                value={note}
                onChangeText={(n) => setNote(n)}
              />
            </ScrollView>
          </ModalRN.Content>
          <ModalRN.Footer>
            <View className="flex-row gap-2">
              <ButtonCostum
                classname={colors.warning}
                title="Batal"
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
      )}

      {dialogCamera && (
        <ModalCamera
          visible={dialogCamera}
          onClose={() => setDialogCamera(false)}
          setUriImage={(e) => setImgUrl(e)}
        />
      )}
      {previewImage && (
        <ModalPreviewImage
          title="Foto Aktivitas"
          imgUrl={imgPreviewUrl || ''}
          visible={previewImage}
          onPress={() => handleCloseImage()}
        />
      )}

      <SubmitOverlay
        visible={loadingPage}
        message="Memuat data pemeliharaan..."
        hint="Mengambil informasi kendaraan"
      />
      <SubmitOverlay
        visible={loadingSubmit}
        message="Menyimpan foto aktivitas..."
        accent="#14b8a6"
      />
    </View>
  );
}
