import SafeAreaView from '@/components/SafeAreaView';
import secureApi from '@/services/service';
import { useInfiniteQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { TextInput, Text, View, Pressable, TouchableOpacity, RefreshControl, FlatList } from 'react-native';
import { AntDesign, Entypo,  Fontisto } from '@expo/vector-icons';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { colors } from '@/constants/colors';
import SkeletonList from '@/components/SkeletonList';
import { Link } from 'expo-router';

const LIMIT = 5;

const fetchData = async ({ pageParam = 0, queryKey }: { pageParam?: number; queryKey: (string | { date: string | undefined })[]; }) => {
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


export default function AdminScreen() {

  const [date, setDate] = useState<Date>();
  const [dateInput, setDateInput] = useState('');

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
    isLoading,
  } = useInfiniteQuery({
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
      maximumDate: new Date()
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
  }


  const flatData = data?.pages.flatMap((page) => page.data) || [];
  // console.log(flatData);


  return (
    <SafeAreaView noTop>
      <View className="flex-1 bg-slate-300">
        <View className='absolute w-full bg-[#205781] h-44 rounded-br-[50]  rounded-bl-[50]' />
        <View className='px-4'>

          <FlatList
            data={flatData}
            keyExtractor={(item) => item.id.toString()}
            refreshControl={
              <RefreshControl refreshing={isRefetching || isLoading} onRefresh={refetch} />
            }
            stickyHeaderIndices={[0]}
            contentContainerStyle={{ paddingBottom: 270 }}
            ListHeaderComponent={
              <Pressable className='p-2 bg-white mb-2 rounded-lg' onPress={showMode}>
                <Fontisto className='absolute z-10 left-6 top-5' name="date" size={24} color={'black'} />
                <TextInput className='border border-gray-300 rounded-md bg-gray-100 py-4 ps-14'
                  placeholder="Select Date"
                  editable={false}
                  value={dateInput ? dayjs(dateInput).format('dddd ,DD MMMM YYYY') : ''}
                />
                {dateInput && (
                  <TouchableOpacity onPress={handleResetTanggal} className='absolute top-5 right-3'>
                    <Entypo name="circle-with-cross" size={28} color="black" />
                  </TouchableOpacity>
                )}

              </Pressable>
            }
            renderItem={({ item }) => (
              <>
                <View className={`flex-row items-center ${item.status == 'Dipakai' ? ' bg-[#F2E5BF]' : 'bg-teal-300'} justify-between px-4 rounded-t-lg`}>
                  <Text className={`p-2 text-black`}>
                    {dayjs(item.created_at).format("dddd ,DD MMMM YYYY | HH:ss")}
                  </Text>

                </View>
                <View className="bg-white gap-2 p-4 rounded-b-lg shadow mb-2">
                  <Text className={`text-xl font-bold text-black text-center`}>
                    {item.nameUser}
                  </Text>
                  <View className="h-px my-1 bg-gray-200 border-1 dark:bg-gray-700"></View>

                  <View className='flex-row justify-between items-center'>

                    <View>
                      <Text className={`text-lg font-bold text-black`}>
                        {item.model}
                      </Text>
                      <Text className='text-secondary text-sm'>
                        {item.no_polisi}
                      </Text>
                    </View>
                    <View className={`${item.status == 'Selesai' ? 'bg-blue-400' : 'bg-amber-400'} rounded-lg p-1 items-center`}>
                      <Text className={`font-bold text-xl px-2 ${item.status == 'Selesai' ? 'text-white' : 'text-black'}`}>{item.status} {item.status == 'Selesai' ? <AntDesign name="checkcircle" size={16} color="white" /> : null}</Text>
                    </View>

                  </View>
                  <View className='bg-slate-100 rounded-md p-3'>
                    <Text className='font-medium text-center'>
                      {item.kegiatan}
                    </Text>
                  </View>
                  <View className='flex-row justify-between items-center'>

                    <View className='w-48 items-center'>
                      <Text className={`text-lg font-bold text-black`}>
                        Awal
                      </Text>
                      <Text className='text-secondary font-medium'>
                        {item.reservasi_in ? dayjs(item.reservasi_in).format('dddd ,DD MMMM YYYY') : ''}
                      </Text>
                      <Text className='text-secondary text-sm'>
                        {item.spidometer_in} Km
                      </Text>
                    </View>
                    <View className='w-48 items-center'>
                      <Text className={`text-lg font-bold text-black`}>
                        Akhir
                      </Text>
                      <Text className='text-secondary font-medium'>
                        {item.reservasi_out ? dayjs(item.reservasi_out).format('dddd ,DD MMMM YYYY') : '-'}
                      </Text>
                      <Text className='text-secondary text-sm'>
                        {item.spidometer_out ? `${item.spidometer_out} Km` : '-'}
                      </Text>
                    </View>

                  </View>
                  {item.status == 'Dipakai' ? (
                    <>
                      <View className="h-px my-1 bg-gray-300 border-1 dark:bg-gray-700"></View>

                      <View className="flex flex-row">

                        <Link asChild push className={`flex-row gap-2 p-2 my-2 rounded-lg justify-center items-center ${colors.primary}`} href={{
                          pathname: '/pengembalianManual',
                          params: {
                            reservasi_id: item?.id,
                            user_id: item?.user_id,
                          }
                        }}>
                            <Text className='font-medium'>Pengembalian</Text>
                        </Link>
           
                      </View>
                    </>
                  ) : null}

                </View>
              </>
            )}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={isLoading || isFetchingNextPage ? (
              <SkeletonList loop={8} />
            ) :
              (<View className="flex-1 justify-center items-center bg-white p-5 rounded-lg">
                <Text>Belum ada pemakaian kendaraan</Text>
              </View>)
            }
          />
        </View>
      </View>
    </SafeAreaView>
  )
}
