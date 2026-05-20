import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useState } from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity } from 'react-native';

import ModalPreviewImage from '@/components/modals/ModalPreviewImage';
import secureApi from '@/services/service';
import { logger } from '@/utils/logger';

interface propsBbm {
  id: number;
  jenis: string;
  uang: string;
  liter: string;
  bbm_date: string;
  created_at: string;
  spidometer: string;
  image_spidometer: string;
  image_struk: string;
  type_bbm: string;
}

const fetchDataLog = async (reservasi_id: number) => {
  try {
    const response = await secureApi.get(`/bbm/list_pengisian`, {
      params: { reservasi_id },
    });
    return response.data;
  } catch {
    return [];
  }
};

export default function PageDailyCheckpoint({ id }: { id: number }) {
  const {
    data: fetch_checkpoint,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<propsBbm[]>({
    queryKey: ['fetch_checkpoint', id],
    queryFn: async () => await fetchDataLog(id),
    enabled: !!id,
  });

  const [titleModal, setTitleModal] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [imgUrl, setImgUrl] = useState<string>();

  const showImage = (url: string, title: string) => {
    setTitleModal(title);
    setImgUrl(url);
    setModalVisible(true);
  };

  if (isError) {
    logger.error('Error fetching checkpoint data:', error);
  }

  if (!fetch_checkpoint || fetch_checkpoint.length === 0) return null;

  return (
    <View className="mt-3 rounded-2xl bg-white p-4 shadow-sm">
      <View className="mb-3 flex-row items-center gap-2">
        <View className="rounded-full bg-amber-50 p-1.5">
          <MaterialCommunityIcons name="gas-station" size={16} color="#f59e0b" />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-bold text-gray-800">Riwayat Pengisian BBM</Text>
          <Text className="text-[10px] text-gray-400">{fetch_checkpoint.length} pengisian</Text>
        </View>
      </View>

      <FlatList
        data={fetch_checkpoint}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        keyExtractor={(item) => item.id.toString()}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View className="h-2" />}
        renderItem={({ item }) => {
          const isVoucher = item.jenis === 'Voucher';
          return (
            <View className="overflow-hidden rounded-xl bg-slate-50">
              {/* Date row */}
              <View className="flex-row items-center justify-between border-b border-slate-100 px-3 py-2">
                <View>
                  <Text className="text-xs font-medium text-gray-700">
                    {dayjs(item.bbm_date).format('ddd, DD MMM YYYY')}
                  </Text>
                  <Text className="text-[10px] text-gray-400">
                    {dayjs(item.bbm_date).format('HH:mm')}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => showImage(item.image_spidometer, 'Foto Spidometer')}
                  className="flex-row items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1">
                  <Feather name="image" size={11} color="#2563eb" />
                  <Text className="text-[10px] font-semibold text-blue-700">
                    {item.spidometer} Km
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Content row */}
              <View className="flex-row items-center justify-between p-3">
                <View className="flex-1">
                  <View className="flex-row items-center gap-1.5">
                    <View
                      className={`h-2 w-2 rounded-full ${isVoucher ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    />
                    <Text className="text-sm font-bold text-gray-800">{item.type_bbm}</Text>
                  </View>
                  <Text className="mt-0.5 text-xs text-gray-500">
                    {isVoucher
                      ? `${item.liter} Liter`
                      : `Rp ${parseFloat(Number(item.uang).toFixed(2)).toLocaleString('id-ID')}`}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => showImage(item.image_struk, 'Foto Struk BBM')}
                  className="flex-row items-center gap-1 rounded-lg bg-slate-200 px-2.5 py-1.5">
                  <Feather name="file-text" size={12} color="#475569" />
                  <Text className="text-[11px] font-medium text-gray-600">Struk</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      <ModalPreviewImage
        title={titleModal}
        imgUrl={imgUrl || ''}
        visible={modalVisible}
        onPress={() => {
          setModalVisible(false);
          setImgUrl('');
        }}
      />
    </View>
  );
}
