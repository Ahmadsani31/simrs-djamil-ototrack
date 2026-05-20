import DateTimePicker from '@expo/ui/datetimepicker';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import BottomSheet, { useBottomSheetSpringConfigs } from '@gorhom/bottom-sheet';

import { useInfiniteQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';

import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, FlatList, Pressable, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import SkeletonList from '@/components/feedback/SkeletonList';
import ModalPreviewImage from '@/components/modals/ModalPreviewImage';

import ListDetailServiceSheet from '@/components/sections/ListDetailServiceSheet';
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
    const response = await secureApi.get(`service/list_admin`, {
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

export default function PemiliharaanScreen() {
  const insets = useSafeAreaInsets();
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  const animationConfigs = useBottomSheetSpringConfigs({
    damping: 80,
    overshootClamping: true,
    stiffness: 500,
  });
  const snapPoints = useMemo(() => ['100%'], []);
  const bottomSheetDetailRef = useRef<BottomSheet>(null);
  const [rawService, setRawService] = useState([]);

  const handleSnapPressDetail = useCallback((item: []) => {
    setRawService(item);
    bottomSheetDetailRef.current?.expand();
  }, []);

  const [date, setDate] = useState<Date>();
  const [dateInput, setDateInput] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [previewImg, setPreviewImg] = useState('');

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch, isRefetching, isLoading } =
    useInfiniteQuery({
      queryKey: ['list-service', { date: dateInput }],
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

  const flatData = data?.pages.flatMap((page: any) => page.data) || [];

  const renderItem = ({ item }: { item: any }) => {
    const isDone = !!item.date_out;
    return (
      <View className="mx-4 mb-3 overflow-hidden rounded-2xl bg-white shadow-sm">
        {/* Status bar */}
        <View
          className={`flex-row items-center justify-between px-4 py-2.5 ${isDone ? 'bg-emerald-100' : 'bg-amber-100'}`}>
          <View className="flex-row items-center gap-1.5">
            <View
              className={`h-2 w-2 rounded-full ${isDone ? 'bg-emerald-500' : 'bg-amber-500'}`}
            />
            <Text className="text-xs font-medium text-gray-600">
              {dayjs(item.created_at).format('ddd, DD MMM YYYY HH:mm')}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => handleSnapPressDetail(item.images)}
            className="flex-row items-center gap-1 rounded-full bg-gray-700 px-3 py-1">
            <Text className="text-xs font-medium text-white">Detail</Text>
            <Feather name="eye" size={11} color="white" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View className="p-4">
          {/* Vehicle + Cost */}
          <View className="mb-3 flex-row items-start justify-between">
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-800" numberOfLines={1}>
                {item.kendaraan}
              </Text>
              <View className="mt-0.5 flex-row items-center gap-1">
                <MaterialCommunityIcons name="card-text-outline" size={13} color="#94a3b8" />
                <Text className="text-xs text-gray-400">{item.no_polisi}</Text>
              </View>
            </View>
            <View className="rounded-lg bg-blue-50 px-3 py-1.5">
              <Text className="text-xs text-gray-400">Biaya</Text>
              <Text className="text-sm font-bold text-blue-600">
                Rp {Number(item.nominal || 0).toLocaleString('id-ID')}
              </Text>
            </View>
          </View>

          {/* Image + Info */}
          <View className="flex-row gap-3">
            <Pressable
              onPress={() => item.image && showImage(item.image)}
              className="overflow-hidden rounded-xl">
              <Image
                source={{ uri: item.image }}
                style={{ width: 80, height: 100, borderRadius: 12 }}
                contentFit="cover"
              />
              <View className="absolute bottom-0 left-0 right-0 bg-black/40 py-0.5">
                <Text className="text-center text-[9px] text-white">Lihat</Text>
              </View>
            </Pressable>

            <View className="flex-1 gap-2">
              <View className="rounded-lg bg-slate-50 p-2.5">
                <Text className="text-xs font-semibold text-gray-700">{item.jenis_kerusakan}</Text>
                <Text className="mt-0.5 text-xs text-gray-500" numberOfLines={2}>
                  {item.keterangan}
                </Text>
              </View>
              <View className="flex-row gap-2">
                <View className="flex-1 rounded-lg bg-slate-50 p-2">
                  <Text className="text-[10px] text-gray-400">Spidometer</Text>
                  <Text className="text-xs font-semibold text-gray-700">{item.spidometer} Km</Text>
                </View>
                <View className="flex-1 rounded-lg bg-slate-50 p-2">
                  <Text className="text-[10px] text-gray-400">Lokasi</Text>
                  <Text className="text-xs font-semibold text-gray-700" numberOfLines={1}>
                    {item.lokasi || '-'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Footer action / keterangan */}
          {isDone ? (
            <View className="mt-3 rounded-lg bg-emerald-50 p-2.5">
              <Text className="text-xs font-semibold text-emerald-700">
                Keterangan Pengembalian
              </Text>
              <Text className="mt-0.5 text-xs text-gray-600">{item.keterangan_out || '-'}</Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: '/pengembalian-service-manual',
                  params: { service_id: item.id, kendaraan_id: item.kendaraan_id },
                })
              }
              className="mt-3 flex-row items-center justify-center gap-2 rounded-xl bg-amber-500 py-2.5"
              activeOpacity={0.8}>
              <MaterialCommunityIcons name="garage-variant" size={16} color="white" />
              <Text className="text-sm font-bold text-white">Proses Pengembalian</Text>
            </TouchableOpacity>
          )}
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
            <MaterialCommunityIcons name="car-wrench" size={20} color="white" />
            <Text className="text-lg font-bold text-white">Pemeliharaan</Text>
          </View>
          <Text className="mt-0.5 text-sm text-white/60">
            Riwayat pemeliharaan kendaraan operasional
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
                <MaterialCommunityIcons name="wrench-outline" size={48} color="#cbd5e1" />
                <Text className="mt-3 text-center text-gray-400">Belum ada data pemeliharaan</Text>
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
          title="Foto Pemeliharaan"
          visible={modalVisible}
          imgUrl={previewImg}
          onPress={() => setModalVisible(false)}
        />
      )}

      {/* Detail Bottom Sheet */}
      {rawService && (
        <BottomSheet
          ref={bottomSheetDetailRef}
          snapPoints={snapPoints}
          index={-1}
          enablePanDownToClose
          animationConfigs={animationConfigs}>
          <ListDetailServiceSheet items={rawService} />
        </BottomSheet>
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
