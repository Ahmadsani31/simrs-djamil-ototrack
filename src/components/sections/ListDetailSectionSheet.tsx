import { Checkpoint, CheckpointBBM } from '@/types/types';
import { BottomSheetSectionList } from '@gorhom/bottom-sheet';
import dayjs from 'dayjs';
import React from 'react';
import { Text, View, Pressable, SectionListRenderItemInfo } from 'react-native';
import SkeletonList from '@/components/feedback/SkeletonList';
import { useQuery } from '@tanstack/react-query';
import secureApi from '@/services/service';
import { Image } from 'expo-image';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

interface itemsProps {
  reservasiID: string;
  onPressImage: (e: string) => void;
}

const fetchData = async (reservasi_id: string) => {
  try {
    const response = await secureApi.get(`/checkpoint/pemakaian`, {
      params: { reservasi_id },
    });
    return response.data;
  } catch {
    return [];
  }
};

export default function ListDetailSectionSheet({ reservasiID, onPressImage }: itemsProps) {
  const { data, isLoading } = useQuery<Checkpoint[]>({
    queryKey: ['dataReservasi', reservasiID],
    queryFn: async () => await fetchData(reservasiID),
    enabled: !!reservasiID,
  });

  return (
    <View className="flex-1">
      <View className="border-b border-slate-100 px-4 pb-3 pt-1">
        <View className="flex-row items-center gap-2">
          <View className="rounded-full bg-amber-50 p-1.5">
            <MaterialCommunityIcons name="gas-station" size={16} color="#f59e0b" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-gray-800">Detail Pengisian BBM</Text>
            <Text className="text-[11px] text-gray-400">
              {data?.length ?? 0} checkpoint pengisian
            </Text>
          </View>
        </View>
      </View>

      <BottomSheetSectionList<CheckpointBBM, Checkpoint>
        sections={data || []}
        keyExtractor={(_item: CheckpointBBM, index: number) => index.toString()}
        stickySectionHeadersEnabled
        contentContainerStyle={{ paddingBottom: 80, paddingTop: 8 }}
        renderItem={({ item, index }: SectionListRenderItemInfo<CheckpointBBM, Checkpoint>) => {
          const isVoucher = item.jenis === 'Voucher';
          return (
            <View className="mx-4 mb-2 overflow-hidden rounded-xl bg-slate-50">
              <View className="flex-row items-center justify-between border-b border-slate-200 px-3 py-2">
                <View className="flex-row items-center gap-1.5">
                  <View
                    className={`h-2 w-2 rounded-full ${isVoucher ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  />
                  <Text className="text-xs font-medium text-gray-600">
                    Pengisian #{index + 1}
                  </Text>
                </View>
                <Text className="text-[11px] font-semibold text-gray-700">
                  {isVoucher
                    ? `${item.liter} Liter`
                    : `Rp ${parseFloat(Number(item.uang).toFixed(2)).toLocaleString('id-ID')}`}
                </Text>
              </View>
              <Pressable onPress={() => onPressImage(item.image)}>
                <Image
                  style={{ height: 240, width: '100%' }}
                  contentFit="cover"
                  source={{ uri: item.image }}
                />
              </Pressable>
            </View>
          );
        }}
        renderSectionHeader={({ section }: { section: Checkpoint }) => {
          const { checkpoint_in, image } = section;
          return (
            <View className="mx-4 mb-2 mt-2 rounded-2xl bg-brand p-4">
              <View className="flex-row items-center gap-3">
                <Pressable
                  onPress={() => onPressImage(image)}
                  className="overflow-hidden rounded-xl">
                  <Image
                    style={{ height: 70, width: 70, borderRadius: 12 }}
                    contentFit="cover"
                    source={{ uri: image }}
                  />
                </Pressable>
                <View className="flex-1">
                  <View className="flex-row items-center gap-1">
                    <Feather name="map-pin" size={11} color="rgba(255,255,255,0.7)" />
                    <Text className="text-[11px] font-medium text-white/80">Checkpoint BBM</Text>
                  </View>
                  <Text className="mt-0.5 text-sm font-bold text-white">
                    {dayjs(checkpoint_in).format('ddd, DD MMM YYYY')}
                  </Text>
                  <Text className="text-[11px] text-white/70">
                    {dayjs(checkpoint_in).format('HH:mm')}
                  </Text>
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          isLoading ? (
            <View className="px-4">
              <SkeletonList loop={4} />
            </View>
          ) : (
            <View className="mx-4 mt-8 items-center rounded-2xl bg-slate-50 p-8">
              <MaterialCommunityIcons name="gas-station-off" size={40} color="#cbd5e1" />
              <Text className="mt-3 text-center text-sm text-gray-400">
                Tidak ada data pengisian BBM
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}
