import {
  View,
  Text,
  FlatList,
  Pressable,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RefreshControl } from 'react-native-gesture-handler';
import BottomSheet, { useBottomSheetSpringConfigs } from '@gorhom/bottom-sheet';

import dayjs from 'dayjs';
import secureApi from '@/services/service';
import { Entypo, Fontisto, MaterialCommunityIcons } from '@expo/vector-icons';
import SkeletonList from '@/components/SkeletonList';
import ModalPreviewImage from '@/components/ModalPreviewImage';
import { colors } from '@/constants/colors';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useInfiniteQuery } from '@tanstack/react-query';
import ListDetailServiceSheet from '@/components/ListDetailServiceSheet';
import { Image } from 'expo-image';

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
    const response = await secureApi.get(`service/list`, {
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
export default function PemiliharaanScreen() {
  const animationConfigs = useBottomSheetSpringConfigs({
    damping: 80,
    overshootClamping: true,
    restDisplacementThreshold: 0.1,
    restSpeedThreshold: 0.1,
    stiffness: 500,
  });

  const snapPoints = useMemo(() => ['100%'], []);

  const [modalVisible, setModalVisible] = useState(false);
  const [imgBase64, setImgBase64] = useState<Base64URLString>();

  const handleModalImageShow = async (uri: any) => {
    // console.log('show image modal');
    setImgBase64(uri);
    setModalVisible(true);
  };
  // ref
  const bottomSheetDetailRef = useRef<BottomSheet>(null);

  const [rawService, setRawService] = useState([]);
  const handleSnapPressDetail = useCallback((item: []) => {
    setRawService(item);
    bottomSheetDetailRef.current?.expand();
  }, []);

  const [date, setDate] = useState<Date>();
  const [dateInput, setDateInput] = useState('');

  useEffect(() => {
    refetch();
  }, []);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch, isRefetching, isLoading } =
    useInfiniteQuery({
      queryKey: ['list-service', { date: dateInput }],
      queryFn: fetchData,
      getNextPageParam: (lastPage) => lastPage.nextOffset,
      initialPageParam: 0,
    });

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
              Semua list pemiliharaan kendaraan Operasional RS Djamil
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
            keyExtractor={(item, index) => index.toString()}
            refreshControl={
              <RefreshControl refreshing={isRefetching || isLoading} onRefresh={refetch} />
            }
            // stickyHeaderIndices={[0]}
            contentContainerStyle={{ paddingBottom: 120 }}
            renderItem={({ item }) => (
              <>
                <View className="flex-row items-center justify-between rounded-t-lg bg-[#F2E5BF] px-4">
                  <Text className={` text-black`}>
                    {dayjs(item.created_at).format('dddd ,DD MMMM YYYY | HH:ss')}
                  </Text>
                  <TouchableOpacity
                    className={`my-2 flex-row items-center justify-center gap-2 rounded-lg px-3 py-1 ${colors.secondary}`}
                    onPress={() => handleSnapPressDetail(item.images)}>
                    <Text className="text-white">Detail</Text>
                    <MaterialCommunityIcons
                      name="arrow-top-right-bold-box"
                      size={18}
                      color="white"
                    />
                  </TouchableOpacity>
                </View>
                <View className="mb-2 rounded-b-lg bg-white p-4 shadow">
                  <View style={{ flex: 1 }} className="flex flex-row">
                    <View className="flex-1">
                      <Text className="text-wrap text-xl font-bold text-black">
                        {item.kendaraan}
                      </Text>
                      <Text className="text-secondary text-sm">{item.no_polisi}</Text>
                    </View>
                    <View className="mt-2 justify-center rounded-lg bg-blue-200 px-4">
                      <Text className="text-center font-medium">Biaya : Rp. {item.nominal}</Text>
                    </View>
                  </View>

                  <View className="mb-3 mt-2 rounded-lg">
                    <View className="w-full flex-1 flex-row items-start gap-5">
                      <Pressable onPress={() => handleModalImageShow(item.image)}>
                        <Image
                          source={{ uri: item.image }}
                          style={{ width: 120, height: 120, borderRadius: 8 }}
                          contentFit="cover"
                        />
                      </Pressable>
                      <View className="flex-1 gap-2">
                        <View className=" rounded-md bg-slate-200 p-2">
                          <Text className="text-lg font-bold">{item.jenis_kerusakan}</Text>
                          <Text className="text-wrap">{item.keterangan}</Text>
                        </View>
                        <View className=" rounded-md bg-slate-200 p-2">
                          <Text className="text-lg font-bold">Spidometer</Text>
                          <Text className="text-wrap">{item.spidometer} Km</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  <View className="mt-2 flex-1 rounded-lg bg-slate-200 p-1">
                    <Text className="text-center text-lg font-bold">Keterangan</Text>
                    <Text className="text-center font-medium">{item.keterangan_out}</Text>
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
                <Text>Tidak ada proses pemiliharaan kendaraan</Text>
              </View>
            }
            ListFooterComponent={isLoading || isFetchingNextPage ? <SkeletonList loop={5} /> : null}
          />
        </View>
      </View>
      <ModalPreviewImage
        title="Gambar Pemiliharaan"
        visible={modalVisible}
        imgUrl={imgBase64 || ''}
        onPress={() => setModalVisible(false)}
      />
      <BottomSheet
        ref={bottomSheetDetailRef}
        snapPoints={snapPoints}
        index={-1}
        enablePanDownToClose
        animationConfigs={animationConfigs}>
        <ListDetailServiceSheet items={rawService} />
      </BottomSheet>
    </SafeAreaView>
  );
}
