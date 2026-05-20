import DateTimePicker from '@expo/ui/datetimepicker';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useInfiniteQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Text, View, Pressable, TouchableOpacity, RefreshControl, FlatList } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Toast } from 'toastify-react-native';

import SkeletonList from '@/components/feedback/SkeletonList';
import ModalPreviewImage from '@/components/modals/ModalPreviewImage';
import { useDatePicker } from '@/hooks/useDatePicker';
import secureApi from '@/services/service';

const LIMIT = 10;

const fetchData = async ({
  pageParam = 0,
  queryKey,
}: {
  pageParam?: number;
  queryKey: (string | { date: string | undefined })[];
}) => {
  const [, params] = queryKey;
  const date = (params as { date?: string }).date;
  try {
    const response = await secureApi.get(`reservasi/list_admin`, {
      params: { limit: LIMIT, offset: pageParam, tanggal: date },
    });
    return {
      data: response.data,
      nextOffset: response.data.length < LIMIT ? null : pageParam + LIMIT,
    };
  } catch {
    return { data: [], nextOffset: null };
  }
};

export default function IndexScreen() {
  const insets = useSafeAreaInsets();
  const [date, setDate] = useState<Date>();
  const [dateInput, setDateInput] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [previewImg, setPreviewImg] = useState('');

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch, isRefetching, isLoading } =
    useInfiniteQuery({
      queryKey: ['pemakaian', { date: dateInput }],
      queryFn: fetchData,
      getNextPageParam: (lastPage) => lastPage.nextOffset,
      initialPageParam: 0,
    });

  const datePicker = useDatePicker({ initialValue: date ?? new Date(), maximumDate: new Date() });

  const showDatePicker = () => {
    datePicker.openWithCallback('date', (selected) => {
      setDateInput(selected.toISOString().split('T')[0]);
      setDate(selected);
    });
  };

  const clearDate = () => {
    setDateInput('');
    setDate(undefined);
    refetch();
  };

  const showImage = (uri: string) => {
    setPreviewImg(uri);
    setModalVisible(true);
  };

  const flatData = data?.pages.flatMap((page) => page.data) || [];

  const renderItem = ({ item }: { item: any }) => {
    const isActive = item.status === 'Dipakai';
    return (
      <View className="mx-4 mb-3 overflow-hidden rounded-2xl bg-white shadow-sm">
        {/* Status bar */}
        <View
          className={`flex-row items-center justify-between px-4 py-2.5 ${isActive ? 'bg-amber-100' : 'bg-emerald-100'}`}>
          <View className="flex-row items-center gap-1.5">
            <View
              className={`h-2 w-2 rounded-full ${isActive ? 'bg-amber-500' : 'bg-emerald-500'}`}
            />
            <Text className="text-xs font-medium text-gray-600">
              {dayjs(item.created_at).format('ddd, DD MMM YYYY')}
            </Text>
          </View>
          {isActive && (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: '/pengembalian_manual',
                  params: { reservasi_id: item.id, user_id: item.user_id },
                })
              }
              className="flex-row items-center gap-1 rounded-full bg-amber-500 px-3 py-1">
              <Text className="text-xs font-bold text-white">Pengembalian</Text>
              <Feather name="arrow-right" size={12} color="white" />
            </TouchableOpacity>
          )}
        </View>

        {/* Content */}
        <View className="p-4">
          {/* User + Vehicle */}
          <View className="mb-3 flex-row items-start justify-between">
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-800" numberOfLines={1}>
                {item.nameUser}
              </Text>
              <Text className="mt-0.5 text-xs text-gray-400">{item.kegiatan}</Text>
            </View>
            <View className="items-end rounded-lg bg-slate-100 px-3 py-1.5">
              <Text className="text-sm font-bold text-gray-800">{item.model}</Text>
              <Text className="text-xs text-gray-500">{item.no_polisi}</Text>
            </View>
          </View>

          {/* Timeline: Dipakai -> Dikembalikan */}
          <View className="flex-row gap-2">
            {/* Dipakai */}
            <Pressable
              onPress={() => item.spidometer_file_in && showImage(item.spidometer_file_in)}
              className="flex-1 rounded-xl bg-blue-50 p-3">
              <View className="mb-1 flex-row items-center gap-1">
                <Feather name="log-in" size={12} color="#3b82f6" />
                <Text className="text-xs font-semibold text-blue-600">Dipakai</Text>
              </View>
              <Text className="text-xs text-gray-600">
                {item.reservasi_in ? dayjs(item.reservasi_in).format('DD/MM/YY HH:mm') : '-'}
              </Text>
              <Text className="mt-0.5 text-[11px] text-gray-400">{item.spidometer_in} Km</Text>
            </Pressable>

            {/* Arrow */}
            <View className="items-center justify-center">
              <Feather name="arrow-right" size={16} color="#cbd5e1" />
            </View>

            {/* Dikembalikan */}
            <Pressable
              onPress={() =>
                item.reservasi_out
                  ? showImage(item.spidometer_file_out)
                  : Toast.info('Kendaraan masih dipakai', 'center')
              }
              className="flex-1 rounded-xl bg-amber-50 p-3">
              <View className="mb-1 flex-row items-center gap-1">
                <Feather name="log-out" size={12} color="#f59e0b" />
                <Text className="text-xs font-semibold text-amber-600">Dikembalikan</Text>
              </View>
              <Text className="text-xs text-gray-600">
                {item.reservasi_out ? dayjs(item.reservasi_out).format('DD/MM/YY HH:mm') : '-'}
              </Text>
              <Text className="mt-0.5 text-[11px] text-gray-400">
                {item.spidometer_out ? `${item.spidometer_out} Km` : '-'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <View className="flex-1 bg-slate-200">
        {/* Header */}
        <View className="bg-brand px-4 pb-14" style={{ paddingTop: insets.top + 3 * 4 }}>
          <View className="flex-row items-center gap-2">
            <MaterialCommunityIcons name="clipboard-list-outline" size={20} color="white" />
            <Text className="text-lg font-bold text-white">Pemakaian Harian</Text>
          </View>
          <Text className="mt-0.5 text-sm text-white/60">
            Semua pemakaian kendaraan operasional
          </Text>
        </View>

        {/* Date filter (overlaps header) */}
        <Pressable
          onPress={showDatePicker}
          className="mx-4 -mt-7 mb-3 flex-row items-center rounded-xl bg-white px-3 py-5 shadow-sm">
          <Feather name="calendar" size={18} color="#94a3b8" />
          <Text className={`ml-2 flex-1 text-sm ${dateInput ? 'text-gray-800' : 'text-gray-400'}`}>
            {dateInput
              ? dayjs(dateInput).format('dddd, DD MMMM YYYY')
              : 'Filter berdasarkan tanggal...'}
          </Text>
          {dateInput ? (
            <TouchableOpacity onPress={clearDate} hitSlop={8}>
              <Feather name="x-circle" size={18} color="#94a3b8" />
            </TouchableOpacity>
          ) : (
            <Feather name="chevron-down" size={18} color="#94a3b8" />
          )}
        </Pressable>

        {/* List */}
        <FlatList
          data={flatData}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={isRefetching || isLoading} onRefresh={refetch} />
          }
          contentContainerStyle={{ paddingBottom: 80, paddingTop: 4 }}
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            isLoading ? null : (
              <View className="mx-4 mt-8 items-center rounded-2xl bg-white p-8">
                <MaterialCommunityIcons name="car-off" size={48} color="#cbd5e1" />
                <Text className="mt-3 text-center text-gray-400">
                  Belum ada pemakaian kendaraan
                </Text>
              </View>
            )
          }
          ListFooterComponent={
            isLoading || isFetchingNextPage ? (
              <View className="mx-4">
                <SkeletonList loop={3} />
              </View>
            ) : null
          }
        />
      </View>

      {/* Image Preview Modal */}
      {modalVisible && (
        <ModalPreviewImage
          title="Foto Spidometer"
          visible={modalVisible}
          imgUrl={previewImg}
          onPress={() => setModalVisible(false)}
        />
      )}

      {/* Date Picker Dialog */}
      {datePicker.visible && (
        <DateTimePicker
          value={datePicker.value}
          mode={datePicker.mode}
          presentation="dialog"
          is24Hour
          maximumDate={new Date()}
          onValueChange={datePicker.handleChange}
          onDismiss={datePicker.dismiss}
        />
      )}
    </SafeAreaView>
  );
}
