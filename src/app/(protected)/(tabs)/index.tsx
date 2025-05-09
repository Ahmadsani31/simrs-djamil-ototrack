import { View, Text, FlatList, TouchableOpacity, Alert, RefreshControl, Modal, TextInput, StyleSheet, Dimensions, Pressable, ActivityIndicator, Image, SectionList } from 'react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Entypo, FontAwesome5, Fontisto, Ionicons, MaterialIcons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetFlatList, BottomSheetSectionList, BottomSheetView, useBottomSheetSpringConfigs } from '@gorhom/bottom-sheet';
import BarcodeScanner from '@/components/BarcodeScanner';
import { router, useFocusEffect, useNavigation } from 'expo-router';
import SafeAreaView from '@/components/SafeAreaView';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { colors } from '@/constants/colors';
import dayjs from 'dayjs';
import secureApi from '@/services/service';
import SkeletonItem from '@/components/SkeletonItem';
import CardListPemakaian from '@/components/CardListPemakaian';
import { useLoadingStore } from '@/stores/loadingStore';
import DetailListScreen from '@/components/DetailListScreen';
import SkeletonList from '@/components/SkeletonList';

interface DataAktif {
  name: string;
  no_polisi: string;
  created_at: boolean;
}

interface DataKendaraan {
  id: number;
  kegiatan: string;
  reservasi_in: string;
  reservasi_out: string;
  model: string;
  no_polisi: string;
  created_at: string;
  spidometer_in: number;
  spidometer_out: number;
  total_spidometer: number;
  selisih_waktu: any;
}

interface Checkpoint {
  id: string;
  image: string;
  checkpoint_in: string;
  created_at: string;
  bbm: CheckpointBBM[];
}

interface CheckpointBBM {
  id: string;
  jenis: string;
  uang?: string;
  liter?: string;
  image: string;
  created_at: string;
}


export default function Home() {

  const setLoading = useLoadingStore((state) => state.setLoading);

  const [isLoading, setIsLoading] = useState(false);
  const [reservasi, setReservasi] = useState(false);
  const [dataListPemakaian, setDataListPemakaian] = useState<DataKendaraan[]>([]);
  const [dataAktif, setDataAktif] = useState<DataAktif>();

  const [refreshing, setRefreshing] = useState(false);
  const [camera, setCamera] = useState(false);
  const [selectedID, setSelectedID] = useState('');

  const [date, setDate] = useState(new Date);
  const [inputDate, setInputDate] = useState<string>();

  useFocusEffect(
    useCallback(() => {
      // Refresh logic here
      fetchDataAktif();
      fetchDataList('');
    }, [])
  );

  const fetchDataAktif = async () => {
    setIsLoading(true);
    setLoading(true);
    try {
      const res = await secureApi.get(`reservasi/aktif`);
      // console.log('res data aktif ', res.data);

      if (res.status === true) {
        setReservasi(true);
        setDataAktif(res.data);
      }
    } catch (error: any) {
      // console.error("Error fetching data:", error);
      console.log("Error /reservasi/aktif", JSON.stringify(error.response?.data?.message));
      setReservasi(false);

    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  const fetchDataList = async (tanggal: any) => {
    setIsLoading(true)
    setLoading(true);
    console.log('tanggal', tanggal);

    try {
      const response = await secureApi.get(`reservasi/list`, {
        params: {
          tanggal: tanggal,
        },
      });
      // console.log(response);
      // console.log(response.data.items);
      setDataListPemakaian(response.data)
      // setTodos(response.data);
    } catch (error: any) {

      console.log(JSON.stringify("Error reservasi/list ", error));
      setDataListPemakaian([])
      // Alert.alert('Error', 'Failed to fetch todos');
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };


  const onRefresh = () => {
    fetchDataList('');
    setInterval(() => {
      setRefreshing(false);

    }, 1000);
  };

  const [row, setRow] = useState<Checkpoint[]>();

  const fetchData = async (reservasi_id: string) => {
    setLoading(true)
    try {
      const response = await secureApi.get(`/checkpoint/reservasi`, {
        params: {
          id: reservasi_id,
        },
      });
      if (response.status === true) {
        const data = response.data
        setRow(data)
      }
    } catch (error) {
      setRow([])
    } finally {
      setLoading(false)
    }

  };

  const animationConfigs = useBottomSheetSpringConfigs({
    damping: 80,
    overshootClamping: true,
    restDisplacementThreshold: 0.1,
    restSpeedThreshold: 0.1,
    stiffness: 500,
  });

  const snapPoints = useMemo(() => ['100%', '50%'], []);

  // ref
  const bottomSheetRef = useRef<BottomSheet>(null);
  const bottomSheetDetailRef = useRef<BottomSheet>(null);


  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      console.log('BottomSheet closed with swipe down.');
      // Lakukan aksi lain jika ditutup
      setCamera(false);
    }
  }, []);

  const handleSheetDetailChanges = useCallback((index: number) => {
    if (index === -1) {
      console.log('BottomSheet closed with swipe down.');
      // Lakukan aksi lain jika ditutup
      setCamera(false);
    }
  }, []);

  const handleSnapPress = useCallback((value: any, id: any) => {

    setCamera(true);
    bottomSheetRef.current?.expand();
  }, []);
  const handleSnapPressDetail = useCallback(async (id: any) => {
    await fetchData(id);
    bottomSheetDetailRef.current?.expand();
  }, []);


  const handleScan = async (data: string) => {
    console.log('Scanned data:', data);

    try {
      const res = await secureApi.get(`reservasi/qrcode`, {
        params: {
          uniqued_id: data,
        },
      });
      if (res.status === true) {
        setCamera(false);
        Alert.alert('Scan Successfully', 'Tekan OK untuk menlanjutkan proses..', [
          {
            text: 'Cancel',
            onPress: () => null,
            style: 'cancel',
          },
          {
            text: 'OK', onPress: () => {
              router.push({
                pathname: '/(protected)/detail',
                params: { uuid: data },
              });
            }
          },
        ]);
      }
    } catch (error: any) {
      // console.log('Error fetching data:', error);
      // toast.info(error.response.data.message);
      const message = error.response.data.message;
      Alert.alert('Perhatian!', message, [
        {
          text: 'Cancel',
          onPress: () => null,
          style: 'cancel',
        },
        {
          text: 'OK', onPress: () => null
        },
      ]);
    } finally {
      
      bottomSheetRef.current?.close();
    }

  };

  const onChange = (event: any, selectedDate: any) => {
    const dateTimestamp = event.nativeEvent.timestamp;
    // console.log(dayjs(selectedDate).format('YYYY-MM-DD'));

    fetchDataList(dayjs(selectedDate).format('YYYY-MM-DD'));
    const currentDate = selectedDate;
    setDate(currentDate);
    setInputDate(dayjs(selectedDate).format('dddd ,DD MMMM YYYY'));
  };

  const toggleResetDate = () => {
    setInputDate('');
    fetchDataList('');
  }

  const showMode = (currentMode: any) => {
    DateTimePickerAndroid.open({
      value: date,
      onChange,
      mode: currentMode,
      is24Hour: true,
    });
  };

  return (
    <SafeAreaView noTop>
      <View className="flex-1 bg-slate-300">
        <View className='absolute w-full bg-[#205781] h-44 rounded-br-[50]  rounded-bl-[50]' />
        <View className='px-4'>

          <View className="mb-5">
            {isLoading ? (
              <SkeletonItem />
            ) : reservasi ? (
              <View className="bg-white p-4 rounded-lg">
                <TouchableOpacity onPress={fetchDataAktif} className='absolute top-0 right-0'>
                  <Ionicons name='reload-circle' size={32} />
                </TouchableOpacity>
                <Text className='text-center'>Kendaraan yang sedang digunakan</Text>
                <Text className='text-center font-bold text-3xl'>{dataAktif?.name}</Text>
                <Text className='text-center font-semibold'>{dataAktif?.no_polisi}</Text>
                <TouchableOpacity onPress={() => router.push('/perjalanan')}
                  className={`flex-row items-center justify-center ${colors.warning} py-3 px-6 my-4 rounded-lg`}
                >
                  <FontAwesome5 name="location-arrow" size={24} color="white" />
                  <Text className="text-white font-bold ml-2">Detail Pemakaian</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View className='mb-4 '>
                  <Text className="text-2xl font-bold text-center text-white">Scan Barcode Here</Text>
                  <Text className="text-sm text-center text-white">Silahkan scan qrcode yang ada pada masing-masing kendaraan</Text>

                </View>
                <TouchableOpacity onPress={() => handleSnapPress('barcode', '')}
                  className={`flex-row items-center justify-center ${colors.primary} py-3 px-6 rounded-lg`}
                >
                  <MaterialIcons name="qr-code-scanner" size={24} color="white" />
                  <Text className="text-white font-bold ml-2">Scan Barcode</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          <FlatList
            data={dataListPemakaian}
            keyExtractor={(item) => item.id.toString()}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['grey']}
                progressBackgroundColor={'black'} />
            }
            stickyHeaderIndices={[0]}
            contentContainerStyle={{ paddingBottom: 200 }}
            ListHeaderComponent={
              <Pressable className='p-2 bg-white mb-2 rounded-lg' onPress={showMode}>
                <Fontisto className='absolute z-10 left-6 top-5' name="date" size={24} color={'black'} />
                <TextInput className='border border-gray-300 rounded-md bg-gray-100 py-4 ps-14'
                  placeholder="Select Date"
                  editable={false}
                  value={inputDate}
                />
                {inputDate && <Entypo className='absolute right-5 top-5' name='circle-with-cross' size={28} color={'black'} onPress={toggleResetDate} />}
              </Pressable>
            }
            renderItem={({ item }) => (
              <CardListPemakaian props={item} onPress={() => handleSnapPressDetail(item?.id)} />
            )}
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center bg-white p-5 rounded-lg">
                <Text>Belum ada pemakaian kendaraan</Text>
              </View>
            }
          />
        </View>
      </View>
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={['100%']}
        index={-1}
        enablePanDownToClose={true}
        animationConfigs={animationConfigs}
        onChange={handleSheetChanges}
      >
        <BottomSheetView className='flex-1 items-center bg-slate-300 justify-center'>
          {camera && <BarcodeScanner onScan={handleScan} />}
        </BottomSheetView>
      </BottomSheet>
      <BottomSheet
        ref={bottomSheetDetailRef}
        snapPoints={snapPoints}
        index={-1}
        enablePanDownToClose
        animationConfigs={animationConfigs}
        onChange={handleSheetDetailChanges}
      >

        <BottomSheetSectionList
          style={{ height: 300 }}
          sections={(row || []).map((checkpoint) => ({
            ...checkpoint,
            data: checkpoint.bbm || [],
          }))}
          keyExtractor={(item, index) => index.toString()}
          stickySectionHeadersEnabled={true}
          contentContainerStyle={{ paddingBottom: 80 }}
          renderItem={({ item, index }) => (
            <View className='px-4'>
              <View className="p-2 bg-slate-200 rounded-lg mb-3">
                <View className='flex-row justify-between items-center'>
                  <Text>{index + 1}. Pengisiian BBM</Text>
                  <Text>{dayjs(item.created_at).format('dddd ,DD MMMM YYYY | HH:ss')}</Text>

                </View>
                <View className="flex-row ms-4">
                  <Text>{item.jenis}</Text>
                  <Text>{item.jenis == 'Voucher' ? ` : ${item.liter} Liter` : ` : Nominal Rp.${parseFloat(Number(item.uang).toFixed(2)).toLocaleString()}`}</Text>
                </View>
                <View className='p-4'>
                  <Image className='w-full aspect-[3/4] rounded-lg' source={{ uri: item.image }} />
                </View>
              </View>
            </View>

          )}
          renderSectionHeader={({ section: { checkpoint_in, created_at } }) => (
            <View className="mx-4 p-4 bg-[#F2E5BF] my-3 rounded-lg flex-row items-center justify-between">
              <Text className='font-bold'>Proses Pengisian BBM,</Text>
              <Text>{dayjs(checkpoint_in).format('dddd ,DD MMMM YYYY')}</Text>
            </View>
          )}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center bg-white p-5 rounded-lg">
              <Text>Tidak ada data pengambilan BBM</Text>
            </View>
          }
        />
      </BottomSheet>
    </SafeAreaView>
  );
}
