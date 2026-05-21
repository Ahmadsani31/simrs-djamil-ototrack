import DateTimePicker from '@expo/ui/datetimepicker';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import BottomSheet, { useBottomSheetSpringConfigs } from '@gorhom/bottom-sheet';
import { useInfiniteQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, FlatList, Pressable, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import SkeletonList from '@/components/feedback/SkeletonList';
import ModalPreviewImage from '@/components/modals/ModalPreviewImage';
import ListDetailSectionSheet from '@/components/sections/ListDetailSectionSheet';
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
    const response = await secureApi.get(`reservasi/list`, {
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

export default function PemakaianScreen() {
  const insets = useSafeAreaInsets();

  const animationConfigs = useBottomSheetSpringConfigs({
    damping: 80,
    overshootClamping: true,
    stiffness: 500,
  });
  const snapPoints = useMemo(() => ['100%'], []);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const [reservasiID, setReservasiID] = useState(undefined);
  const handleSnapPressDetail = useCallback((id: any) => {
    setReservasiID(id);
    bottomSheetRef.current?.expand();
  }, []);

  const [date, setDate] = useState<Date>();
  const [dateInput, setDateInput] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [previewImg, setPreviewImg] = useState('');

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch, isRefetching, isLoading } =
    useInfiniteQuery({
      queryKey: ['listPemakaian', { date: dateInput }],
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

  const showImage = useCallback((uri: string) => {
    setPreviewImg(uri);
    setModalVisible(true);
  }, []);

  const flatData = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

  const renderItem = useCallback(
    ({ item }: { item: any }) => (
      <View className="mx-4 mb-3 overflow-hidden rounded-2xl bg-white shadow-sm">
        {/* Header bar */}
        <View className="flex-row items-center justify-between bg-brand px-4 py-2.5">
          <Text className="text-xs font-medium text-white">
            {dayjs(item.created_at).format('ddd, DD MMM YYYY')}
          </Text>
          {item.bbm && (
            <TouchableOpacity
              onPress={() => handleSnapPressDetail(item.id)}
              className="flex-row items-center gap-1 rounded-full bg-gray-700 px-3 py-1">
              <MaterialCommunityIcons name="gas-station" size={13} color="white" />
              <Text className="text-xs font-medium text-white">BBM</Text>
            </TouchableOpacity>
          )}
        </View>

        <View className="p-4">
          {/* Vehicle + Activity */}
          <View className="mb-3 flex-row items-start justify-between">
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-800" numberOfLines={1}>
                {item.model}
              </Text>
              <Text className="text-xs text-gray-400">{item.no_polisi}</Text>
            </View>
            <View className="rounded-lg bg-slate-100 px-3 py-1.5">
              <Text className="text-xs font-medium text-gray-600" numberOfLines={1}>
                {item.kegiatan}
              </Text>
            </View>
          </View>

          {/* Stats row */}
          <View className="mb-3 flex-row gap-2">
            <View className="flex-1 rounded-xl bg-slate-50 p-2.5">
              <Text className="text-[10px] text-gray-400">Total Perjalanan</Text>
              <Text className="text-sm font-bold text-gray-800">{item.total_spidometer} Km</Text>
            </View>
            <View className="flex-1 rounded-xl bg-slate-50 p-2.5">
              <Text className="text-[10px] text-gray-400">Lama Perjalanan</Text>
              <Text className="text-sm font-bold text-gray-800">{item.selisih_waktu} Menit</Text>
            </View>
          </View>

          {/* Timeline: Pergi -> Pulang */}
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => showImage(item.spidometer_file_in)}
              className="flex-1 rounded-xl bg-blue-100 p-3">
              <View className="mb-1 flex-row items-center gap-1">
                <Feather name="log-in" size={12} color="#3b82f6" />
                <Text className="text-xs font-semibold text-blue-600">Pergi</Text>
              </View>
              <Text className="text-xs text-gray-600">
                {item.reservasi_in ? dayjs(item.reservasi_in).format('DD/MM/YY HH:mm') : '-'}
              </Text>
              <Text className="mt-0.5 text-[11px] text-gray-400">{item.spidometer_in} Km</Text>
            </Pressable>
            <View className="items-center justify-center">
              <Feather name="arrow-right" size={16} color="#cbd5e1" />
            </View>
            <Pressable
              onPress={() => showImage(item.spidometer_file_out)}
              className="flex-1 rounded-xl bg-amber-100 p-3">
              <View className="mb-1 flex-row items-center gap-1">
                <Feather name="log-out" size={12} color="#f59e0b" />
                <Text className="text-xs font-semibold text-amber-600">Pulang</Text>
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
    ),
    [handleSnapPressDetail, showImage]
  );

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: 0 }} edges={['bottom']}>
      {/* Header */}
      <View className="bg-brand px-4 pb-10" style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center gap-2">
          <Feather name="list" size={20} color="white" />
          <Text className="text-2xl font-bold text-white">Riwayat Pemakaian</Text>
        </View>
        <Text className="mt-0.5 text-sm text-white/60">Pemakaian kendaraan operasional</Text>
      </View>

      {/* Date filter */}
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
        removeClippedSubviews
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={7}
        ListEmptyComponent={
          isLoading ? null : (
            <View className="mx-4 mt-8 items-center rounded-2xl bg-white p-8">
              <MaterialCommunityIcons name="car-off" size={48} color="#cbd5e1" />
              <Text className="mt-3 text-center text-gray-400">Belum ada pemakaian kendaraan</Text>
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

      {modalVisible && (
        <ModalPreviewImage
          title="Foto Spidometer"
          visible={modalVisible}
          imgUrl={previewImg}
          onPress={() => setModalVisible(false)}
        />
      )}
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        index={-1}
        enablePanDownToClose
        animationConfigs={animationConfigs}>
        <ListDetailSectionSheet
          reservasiID={reservasiID ?? ''}
          onPressImage={(e) => showImage(e)}
        />
      </BottomSheet>
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
