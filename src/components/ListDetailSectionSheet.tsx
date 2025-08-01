import { Checkpoint } from '@/types/types';
import { BottomSheetSectionList } from '@gorhom/bottom-sheet';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { TextInput, Text, View, Image, Pressable } from 'react-native';
import ModalPreviewImage from './ModalPreviewImage';
import SkeletonList from './SkeletonList';
import { useQuery } from '@tanstack/react-query';
import secureApi from '@/services/service';

interface itemsProps {
  reservasiID: string;
  onPressImage: (e: string) => void;
}

const fetchData = async (reservasi_id: string) => {
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

export default function ListDetailSectionSheet({ reservasiID, onPressImage }: itemsProps) {
  const { data, isLoading, isError, error, refetch } = useQuery<Checkpoint[]>({
    queryKey: ['dataReservasi', reservasiID],
    queryFn: async () => await fetchData(reservasiID),
    enabled: !!reservasiID,
  });

  return (
    <BottomSheetSectionList
      style={{ height: 300 }}
      sections={data || []}
      keyExtractor={(item, index) => index.toString()}
      stickySectionHeadersEnabled={true}
      renderItem={({ item, index }) => (
        <View className="px-4">
          <View className="mb-3 rounded-lg bg-slate-200 p-2">
            <View className="flex-row items-center justify-between">
              <Text>{index + 1}. Pengisiian BBM </Text>
              {/* <Text>{dayjs(item.created_at).format('dddd ,DD MMMM YYYY | hh')}</Text> */}
              <View className="ms-4 flex-row">
                <Text>{item.jenis}</Text>
                <Text className="text-secondary me-4">
                  {item.jenis == 'Voucher'
                    ? ` : ${item.liter} Liter`
                    : ` : Nominal Rp.${parseFloat(Number(item.uang).toFixed(2)).toLocaleString()}`}
                </Text>
              </View>
            </View>
            <View className="p-4">
              <Image className="aspect-[3/4] w-full rounded-lg" source={{ uri: item.image }} />
            </View>
          </View>
        </View>
      )}
      renderSectionHeader={({ section: { checkpoint_in, image } }) => (
        <View className="mx-4 my-3 flex-row items-center justify-between rounded-lg bg-[#F2E5BF] p-4">
          <View>
            <Text className="font-bold">Proses Pengisian BBM,</Text>
            <Text>{dayjs(checkpoint_in).format('dddd ,DD MMMM YYYY')}</Text>
            <Text>Waktu : {dayjs(checkpoint_in).format('HH:ss')}</Text>
          </View>
          <View className="p-4">
            <Pressable onPress={() => onPressImage(image)}>
              <Image className="size-32 rounded-lg" source={{ uri: image }} />
              <Text className="absolute left-4 top-1/3 rounded-md bg-white/75 p-1">
                Clik to show
              </Text>
            </Pressable>
          </View>
        </View>
      )}
      ListEmptyComponent={
        isLoading ? (
          <SkeletonList loop={10} />
        ) : (
          <View className="flex-1 items-center justify-center rounded-lg bg-white p-5">
            <Text>Tidak ada data pengambilan BBM</Text>
          </View>
        )
      }
    />
  );
}
