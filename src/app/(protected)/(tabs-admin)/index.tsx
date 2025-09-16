import secureApi from '@/services/service';
import { useInfiniteQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import {
  TextInput,
  Text,
  View,
  Pressable,
  TouchableOpacity,
  RefreshControl,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { AntDesign, Entypo, Fontisto, MaterialCommunityIcons } from '@expo/vector-icons';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { colors } from '@/constants/colors';
import SkeletonList from '@/components/SkeletonList';
import { Link, router } from 'expo-router';

const LIMIT = 5;

const fetchData = async ({
  pageParam = 0,
  queryKey,
}: {
  pageParam?: number;
  queryKey: (string | { date: string | undefined })[];
}) => {
  // queryKey is an array: [string, { date: Date | undefined }]
  const [_key, params] = queryKey;

  // console.log(params);

  const date = (params as { date?: String }).date;

  try {
    const response = await secureApi.get(`reservasi/list_admin`, {
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

export default function IndexScreen() {
  const [date, setDate] = useState<Date>();
  const [dateInput, setDateInput] = useState('');

  useEffect(() => {
    refetch();
  }, []);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch, isRefetching, isLoading } =
    useInfiniteQuery({
      queryKey: ['pemakaian', { date: dateInput }],
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
    refetch();
  };

  const flatData = data?.pages.flatMap((page) => page.data) || [];
  // console.log(flatData);

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-slate-300">
      <View className="absolute h-44 w-full rounded-bl-[50] rounded-br-[50]  bg-[#205781]" />
      <View className="px-4">
        <View className="mb-4 ">
          <Text className="text-center text-white">
            Berikut semua list pemakaian kendaraan Operasional RS Djamil
          </Text>
        </View>
        <FlatList
          data={flatData}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={isRefetching || isLoading} onRefresh={refetch} />
          }
          stickyHeaderIndices={[0]}
          contentContainerStyle={{ paddingBottom: 80 }}
          ListHeaderComponent={
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
          }
          renderItem={({ item }) => (
            <>
              <View
                className={`flex-row items-center ${item.status == 'Dipakai' ? ' bg-[#F2E5BF]' : 'bg-teal-300'} justify-between rounded-t-lg px-4`}>
                <Text className={`p-2 text-black`}>
                  {dayjs(item.created_at).format('dddd ,DD MMMM YYYY')}
                </Text>
                {item.status == 'Dipakai' ? (
                  <TouchableOpacity
                    onPress={() =>
                      router.push({
                        pathname: '/pengembalian_manual',
                        params: {
                          reservasi_id: item?.id,
                          user_id: item?.user_id,
                        },
                      })
                    }
                    className={`my-2 rounded-md ${colors.primary}`}>
                    <View className=" flex-row items-center justify-center px-2 py-1">
                      <Text className="font-bold text-white">Pengembalian</Text>
                      <MaterialCommunityIcons
                        name="arrow-top-right-bold-box"
                        size={24}
                        color="black"
                      />
                    </View>
                  </TouchableOpacity>
                ) : null}
              </View>
              <View className="mb-2 gap-2 rounded-b-lg bg-white p-4 shadow">
                <View className="flex-row items-center justify-between gap-2">
                  <Text className={`text-center text-xl font-bold text-black`}>
                    {item.nameUser}
                  </Text>
                  <View>
                    <Text className={`text-wrap text-lg font-bold text-black`}>{item.model}</Text>
                    <Text className="text-secondary text-sm">{item.no_polisi}</Text>
                  </View>
                </View>
                <View className="rounded-md bg-slate-100 p-3">
                  <Text className="text-center font-medium">{item.kegiatan}</Text>
                </View>
                <View className="border-1 my-1 h-px bg-gray-200 dark:bg-gray-700"></View>

                <View className="flex-row items-center justify-between">
                  <View className="w-48 items-center rounded-md bg-blue-200 p-2">
                    <Text className={`text-lg font-bold`}>Dipakai</Text>
                    <Text className="text-secondary text-center font-medium">
                      {item.reservasi_in
                        ? dayjs(item.reservasi_in).format('dddd ,DD MMMM YYYY | HH:mm')
                        : ''}
                    </Text>
                    <Text className="text-secondary text-sm ">{item.spidometer_in} Km</Text>
                  </View>
                  <View className="w-48 items-center rounded-md bg-amber-200 p-2">
                    <Text className={`text-lg font-bold `}>Dikembalikan</Text>
                    <Text className="text-secondary text-center font-medium">
                      {item.reservasi_out
                        ? dayjs(item.reservasi_out).format('dddd ,DD MMMM YYYY | HH:mm')
                        : '-'}
                    </Text>
                    <Text className="text-secondary text-sm">
                      {item.spidometer_out ? `${item.spidometer_out} Km` : '-'}
                    </Text>
                  </View>
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
              <Text>Belum ada pemakaian kendaraan</Text>
            </View>
          }
          ListFooterComponent={isLoading || isFetchingNextPage ? <SkeletonList loop={5} /> : null}
        />
      </View>
    </SafeAreaView>
  );
}
