import {
  View,
  Text,
  FlatList,
  Pressable,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  BackHandler,
} from 'react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RefreshControl } from 'react-native-gesture-handler';
import BottomSheet, { useBottomSheetSpringConfigs } from '@gorhom/bottom-sheet';
import ListDetailSectionSheet from '@/components/ListDetailSectionSheet';

import dayjs from 'dayjs';
import secureApi from '@/services/service';
import { Entypo, Fontisto, MaterialCommunityIcons } from '@expo/vector-icons';
import SkeletonList from '@/components/SkeletonList';
import ModalPreviewImage from '@/components/ModalPreviewImage';
import { colors } from '@/constants/colors';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useInfiniteQuery } from '@tanstack/react-query';

const LIMIT = 10;

const fetchData = async ({
  pageParam = 0,
  queryKey,
}: {
  pageParam?: number;
  queryKey: (string | { date: string | undefined })[];
}) => {
  // queryKey is an array: [string, { date: Date | undefined }]
  const [_key, params] = queryKey;
  const date = (params as { date?: String }).date;
  try {
    const response = await secureApi.get(`reservasi/list`, {
      params: {
        limit: LIMIT,
        offset: pageParam,
        tanggal: date,
      },
    });
    return {
      data: response.data,
      nextOffset: response.data.length < LIMIT ? null : pageParam + LIMIT,
    };
  } catch (error) {
    return {
      data: [],
      nextOffset: null,
    };
  }
};
export default function PemakaianScreen() {
  const animationConfigs = useBottomSheetSpringConfigs({
    damping: 80,
    overshootClamping: true,
    restDisplacementThreshold: 0.1,
    restSpeedThreshold: 0.1,
    stiffness: 500,
  });

  const snapPoints = useMemo(() => ['100%'], []);

  // ref
  const bottomSheetRef = useRef<BottomSheet>(null);

  const [reservasiID, setReservasiID] = useState(undefined);
  const handleSnapPressDetail = useCallback((id: any) => {
    setReservasiID(id);
    bottomSheetRef.current?.expand();
  }, []);

  const [date, setDate] = useState<Date>();
  const [dateInput, setDateInput] = useState('');

  useEffect(() => {
    refetch();
  }, []);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch, isRefetching, isLoading } =
    useInfiniteQuery({
      queryKey: ['listPemakaian', { date: dateInput }],
      queryFn: fetchData,
      getNextPageParam: (lastPage) => lastPage.nextOffset,
      initialPageParam: 0,
    });

  const [modalVisible, setModalVisible] = useState(false);
  const [imgBase64, setImgBase64] = useState<Base64URLString>();

  const handleModalImageShow = async (uri: any) => {
    // console.log('show image modal');
    setImgBase64(uri);
    setModalVisible(true);
  };

  const showMode = (currentMode: any) => {
    DateTimePickerAndroid.open({
      value: date ?? new Date(),
      onChange,
      mode: currentMode,
      is24Hour: true,
      maximumDate: new Date(),
    });
  };

  const onChange = (event: any, selectedDate: any) => {
    if (event.type == 'set') {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      const currentDate = selectedDate;
      setDateInput(formattedDate);
      setDate(currentDate);
    }

    // setInputDate(dayjs(selectedDate).format('dddd ,DD MMMM YYYY'));
    // refetch()
  };

  const handleResetTanggal = () => {
    setDateInput('');
    setDate(new Date());
    refetch();
  };

  const flatData = data?.pages.flatMap((page) => page.data) ?? [];
  // console.log('flatData pemakaiana', fetchData);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="flex-1 bg-slate-300">
        <View className="absolute h-44 w-full rounded-bl-[50] rounded-br-[50]  bg-[#205781]" />
        <View className="px-4">
          <View className="mb-4 ">
            <Text className="text-center text-white">
              Semua list pemakaian kendaraan Operasional RS Djamil
            </Text>
          </View>
          <Pressable className="mb-2 rounded-lg bg-white p-2" onPress={showMode}>
            <Fontisto
              className="absolute left-6 top-5 z-10"
              name="date"
              size={24}
              color={'black'}
            />
            <TextInput
              className="rounded-md border border-gray-300 bg-gray-100 py-4 ps-14"
              placeholder="Select Date"
              editable={false}
              value={dateInput ? dayjs(dateInput).format('dddd ,DD MMMM YYYY') : ''}
            />
            {dateInput && (
              <TouchableOpacity onPress={handleResetTanggal} className="absolute right-3 top-5">
                <Entypo name="circle-with-cross" size={28} color="black" />
              </TouchableOpacity>
            )}
          </Pressable>
          <FlatList
            data={flatData}
            keyExtractor={(item) => item.id.toString()}
            refreshControl={
              <RefreshControl refreshing={isRefetching || isLoading} onRefresh={refetch} />
            }
            // stickyHeaderIndices={[0]}
            contentContainerStyle={{ paddingBottom: 120 }}
            renderItem={({ item }) => (
              <>
                <View className="flex-row items-center justify-between rounded-t-lg bg-[#F2E5BF] px-4">
                  <Text className="p-2 text-black">
                    {dayjs(item.created_at).format('dddd ,DD MMMM YYYY | HH:ss')}
                  </Text>
                  {item.bbm ? (
                    <TouchableOpacity
                      className={`my-2 flex-row gap-2 rounded-lg p-2 ${colors.secondary}`}
                      onPress={() => handleSnapPressDetail(item.id)}>
                      <MaterialCommunityIcons name="gas-station" size={18} color="white" />
                      <Text className="text-white">BBM</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
                <View className="mb-2 rounded-b-lg bg-white p-4 shadow">
                  <View className="flex flex-row items-center gap-3">
                    <View className="flex-1">
                      <Text className="text-wrap text-xl font-bold text-black">{item.model}</Text>
                      <Text className="text-secondary text-sm">{item.no_polisi}</Text>
                    </View>
                    <View className="h-full flex-1 rounded-lg bg-slate-100 p-2">
                      <Text className="font-medium">{item.kegiatan}</Text>
                    </View>
                  </View>

                  <View className="mt-2 rounded-lg bg-gray-200 p-2">
                    <View className="flex-row items-center justify-between">
                      <Text>Total Perjalanan</Text>
                      <Text className="font-bold">{item.total_spidometer} Km</Text>
                    </View>
                    <View className="flex-row items-center justify-between">
                      <Text>Lama Perjalanan</Text>
                      <Text className="font-bold">{item.selisih_waktu} Menit</Text>
                    </View>
                  </View>
                  <View className="mt-2 flex justify-center gap-2">
                    <TouchableOpacity onPress={() => handleModalImageShow(item.spidometer_file_in)}>
                      <View className="flex-row items-center gap-10 rounded-lg bg-blue-300 p-2">
                        <Text className=" text-2xl font-bold">Pergi</Text>
                        <View className="flex-1 gap-2">
                          <Text className=" text-black">
                            {dayjs(item.reservasi_in).format('dddd ,DD MMMM YYYY | HH:mm')}
                          </Text>
                          <View className="flex-row items-center justify-between">
                            <Text className="text-black ">Spidometer</Text>
                            <Text className="font-bold text-black">{item.spidometer_in} Km</Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleModalImageShow(item.spidometer_file_out)}>
                      <View className="flex-row items-center gap-5 rounded-lg bg-amber-300 p-2">
                        <Text className="text-2xl font-bold">Pulang</Text>

                        <View className="flex-1 gap-2">
                          <Text className=" text-black">
                            {dayjs(item.reservasi_out).format('dddd ,DD MMMM YYYY | HH:mm')}
                          </Text>
                          <View className="flex-row items-center justify-between">
                            <Text className="text-black ">Spidometer</Text>
                            <Text className="font-bold text-black">{item.spidometer_out} Km</Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center rounded-lg bg-white p-5">
                <Text>Tidak ada pemakaian kendaraan yang dilakukan</Text>
              </View>
            }
            ListFooterComponent={isLoading || isFetchingNextPage ? <SkeletonList loop={5} /> : null}
          />
        </View>
      </View>
      {modalVisible && (
        <ModalPreviewImage
          title="Gambar Spidometer"
          visible={modalVisible}
          imgUrl={imgBase64 || ''}
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
          onPressImage={(e) => handleModalImageShow(e)}
        />
      </BottomSheet>
    </SafeAreaView>
  );
}
