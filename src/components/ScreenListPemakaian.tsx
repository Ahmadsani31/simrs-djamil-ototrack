import { useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import dayjs from 'dayjs';
import secureApi from '@/services/service';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Entypo, Fontisto, MaterialCommunityIcons } from '@expo/vector-icons';
import SkeletonList from './SkeletonList';
import ModalPreviewImage from './ModalPreviewImage';
import { colors } from '@/constants/colors';
import InputDate from './InputDate';

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

interface cardProps {
  onPress: (value: any) => void;
}

export default function ScreenListPemakaian({ onPress }: cardProps) {
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
    refetch();
  };

  const flatData = data?.pages.flatMap((page) => page.data) || [];

  return (
    <>
      <Pressable className="mb-2 rounded-lg bg-white p-2" onPress={showMode}>
        <Fontisto className="absolute left-6 top-5 z-10" name="date" size={24} color={'black'} />
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
        contentContainerStyle={{ paddingBottom: 80 }}
        renderItem={({ item }) => (
          <>
            <View className="flex-row items-center justify-between rounded-t-lg bg-[#F2E5BF] px-4">
              <Text className={` text-black`}>
                {dayjs(item.created_at).format('dddd ,DD MMMM YYYY | HH:ss')}
              </Text>
              <TouchableOpacity
                className={`my-2 flex-row gap-2 rounded-lg p-2 ${colors.secondary}`}
                onPress={() => onPress(item.id)}>
                <MaterialCommunityIcons name="gas-station" size={18} color="white" />
                <Text className="text-white">BBM</Text>
              </TouchableOpacity>
            </View>
            <View className="mb-2 rounded-b-lg bg-white p-4 shadow">
              <View className="items-center">
                <Text className={`text-xl font-bold text-black`}>{item.model}</Text>
                <Text className="text-secondary text-sm">{item.no_polisi}</Text>
              </View>
              <View className="mt-2 rounded-lg bg-slate-200 p-1">
                <Text className="text-center font-medium">{item.kegiatan}</Text>
              </View>
              <View className="mt-2 flex-row items-center justify-around rounded-lg bg-slate-200 p-1">
                <View className="items-center">
                  <Text>Total Perjalanan</Text>
                  <Text className="font-bold">{item.total_spidometer} Km</Text>
                </View>
                <View className="items-center">
                  <Text>Lama Perjalanan</Text>
                  <Text className="font-bold">{item.selisih_waktu} Menit</Text>
                </View>
              </View>
              <View className="mt-2 flex justify-center gap-2">
                <TouchableOpacity onPress={() => handleModalImageShow(item.spidometer_file_in)}>
                  <View className="flex-row items-center rounded-lg bg-blue-300 p-2">
                    <View className="w-1/3">
                      <Text className="mx-5 text-center text-2xl font-bold">Pergi</Text>
                    </View>
                    <View>
                      <Text className="font-bold text-black">
                        {dayjs(item.reservasi_in).format('dddd ,DD MMMM YYYY')}
                      </Text>
                      <Text className="text-black ">
                        Jam {dayjs(item.reservasi_in).format('HH:mm')}
                      </Text>
                      <Text className="text-black ">Spidometer {item.spidometer_in}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleModalImageShow(item.spidometer_file_out)}>
                  <View className="flex-row items-center rounded-lg bg-amber-300 p-2">
                    <View className="w-1/3">
                      <Text className="mx-5 text-center text-2xl font-bold">Pulang</Text>
                    </View>

                    <View>
                      <Text className="font-bold text-black">
                        {dayjs(item.reservasi_out).format('dddd ,DD MMMM YYYY')}
                      </Text>
                      <Text className="text-black ">
                        Jam {dayjs(item.reservasi_out).format('HH:mm')}
                      </Text>
                      <Text className="text-black ">Spidometer {item.spidometer_out}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
            <ModalPreviewImage
              title="Gambar Spidometer"
              visible={modalVisible}
              imgUrl={imgBase64 || ''}
              onPress={() => setModalVisible(false)}
            />
          </>
        )}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          isLoading || isFetchingNextPage ? (
            <SkeletonList loop={8} />
          ) : (
            <View className="flex-1 items-center justify-center rounded-lg bg-white p-5">
              <Text>Belum ada pemakaian kendaraan</Text>
            </View>
          )
        }
      />
    </>
  );
}
