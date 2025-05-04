import { View, Text, FlatList, TouchableOpacity, Alert, RefreshControl, Modal, TextInput, StyleSheet, Dimensions, Pressable } from 'react-native';
import { useAuthStore } from '@/stores/authStore';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Entypo, FontAwesome5, Fontisto, MaterialIcons } from '@expo/vector-icons';
import { ModalRN } from '@/components/ModalRN';
import BottomSheet, { BottomSheetView, useBottomSheetSpringConfigs } from '@gorhom/bottom-sheet';
import BarcodeScanner from '@/components/BarcodeScanner';
import { router, useFocusEffect, useNavigation } from 'expo-router';
import { dataPemakaian } from '@/data/Example';
import SafeAreaView from '@/components/SafeAreaView';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { colors } from '@/constants/colors';
import dayjs from 'dayjs';
import secureApi from '@/services/service';
import SkeletonItem from '@/components/SkeletonItem';

import {ALERT_TYPE, Dialog, Toast} from 'react-native-alert-notification';

interface Todo {
  id: string;
  title: string;
  completed: boolean;
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
}

export default function Home() {

  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [reservasi, setReservasi] = useState(false);
  const [dataPemakaian, setDataPemakaian] = useState<DataKendaraan[]>([]);


  useEffect(() => {
    fetchDataAktif();
    fetchDataList('');
  }, []);

  const fetchDataAktif = async () => {
    setLoading(true);
    try {
      const res = await secureApi.get(`reservasi/aktif`);
      console.log('res data aktif ', res);

      if (res.status === true) {
        setReservasi(true);
        setDataPemakaian(res.data);
      }
    } catch (error: any) {
      // console.error("Error fetching data:", error);
      console.log("Error /reservasi/aktif", JSON.stringify(error.response?.data?.message));
      setReservasi(false);

    } finally {
      setLoading(false);
    }
  };

  const fetchDataList = async (tanggal: any) => {
    setLoading(true)

    console.log('tanggal', tanggal);

    try {
      const response = await secureApi.get(`reservasi/list`, {
        params: {
          tanggal: tanggal,
        },
      });
      console.log(response);
      console.log(response.data.items);
      // setTodos(response.data);
    } catch (error: any) {

      console.log(JSON.stringify("Error reservasi/list :",error.response?.data?.message));

      // Alert.alert('Error', 'Failed to fetch todos');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    // Callback should be wrapped in `React.useCallback` to avoid running the effect too often.
    useCallback(() => {
      // Invoked whenever the route is focused.

      // Return function is invoked whenever the route gets out of focus.
      return () => {
        bottomSheetRef.current?.close();
      };
    }, [])
  )

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    // dataPemakaian.push({
    //   id: '12',
    //   vehicleName: '12 Toyota Avanza',
    //   userName: 'Ahmad Sani',
    //   departureTime: '08:00',
    //   returnTime: '17:00',
    //   date: '2025-04-28',
    // },)
    setInterval(() => {
      setRefreshing(false);

    }, 1000);
  };
  const [camera, setCamera] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const animationConfigs = useBottomSheetSpringConfigs({
    damping: 80,
    overshootClamping: true,
    restDisplacementThreshold: 0.1,
    restSpeedThreshold: 0.1,
    stiffness: 500,
  });

  // ref
  const bottomSheetRef = useRef<BottomSheet>(null);

  // callbacks
  const handleClosePress = useCallback(() => {
    bottomSheetRef.current?.close();
    setCamera(false);

  }, []);

  const handleSnapPress = useCallback(() => {
    setCamera(true);
    bottomSheetRef.current?.expand();
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
        // toast.success('Barcode Scan Success')

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
    }finally{
      setCamera(false);
      bottomSheetRef.current?.close();
    }

  };

  const [date, setDate] = useState(new Date);
  const [inputDate, setInputDate] = useState<string>();

  const onChange = (event: any, selectedDate: any) => {
    const dateTimestamp = event.nativeEvent.timestamp;
    fetchDataList(dateTimestamp);
    const currentDate = selectedDate;
    setDate(currentDate);
    setInputDate(dayjs(selectedDate).format('dddd ,DD MMMM YYYY'));
  };

  const toggleResetDate = () => {
    setInputDate('');
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
            {loading ? (
              <SkeletonItem />
            ) : reservasi ? (
              <View className="p-5">
                <View className="flex justify-between items-center mb-3">
                  <Text className="section-title">Aktif Pemakaian</Text>
                  <TouchableOpacity>
                    <FontAwesome5 name="location-arrow" size={24} color="black" /> <Text>Reservasi</Text>
                  </TouchableOpacity>
                </View>
                <View className="py-2" />
                <View className="text-center">
                  <Text>nama kendaraan</Text>
                  <Text className="text-sm text-gray-950">no polisi</Text>
                  <Text className="text-sm text-gray-500">
                    date
                  </Text>
                </View>
              </View>
            ) : (
              <>
                <View className='mb-4 '>
                  <Text className="text-2xl font-bold text-center text-white">Scan Barcode Here</Text>
                  <Text className="text-sm text-center text-white">Silahkan scan qrcode yang ada pada masing-masing kendaraan</Text>

                </View>
                <TouchableOpacity onPress={handleSnapPress}
                  className={`flex-row items-center justify-center ${colors.primary} py-3 px-6 rounded-lg`}
                >
                  <MaterialIcons name="qr-code-scanner" size={24} color="white" />
                  <Text className="text-white font-bold ml-2">Scan Barcode</Text>
                </TouchableOpacity>
              </>
            )}
          </View>


          <FlatList
            data={dataPemakaian}
            style={{ marginTop: 20 }}
            keyExtractor={(item) => item.id.toString()}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            stickyHeaderIndices={[0]}
            contentContainerStyle={{ paddingBottom: 185 }}
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
              <View className="bg-white p-4 rounded-lg shadow mb-2">
                <View className='flex-row items-center justify-between'>
                  <Text className={`text-2xl font-bold text-black`}>
                    {item.model}
                  </Text>
                  <Text className='text-secondary text-sm'>
                    {item.no_polisi}
                  </Text>
                </View>
                <Text className='font-medium text-lg'>
                  {item.kegiatan}
                </Text>
                <View className='flex-row items-center justify-around mt-4'>
                  <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <Text className="text-black bg-blue-300 p-2 rounded-lg">Jam Berangkat: {item.reservasi_in}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Text className="text-black bg-amber-300 p-2 rounded-lg">Jam Pulang: {item.reservasi_out}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center bg-white p-5 rounded-lg">
                <Text>Belum ada pemakaian kendaraan</Text>
              </View>
            }
          />
        </View>

        <ModalRN
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
        >
          <ModalRN.Header><Text className='font-bold'>Title</Text></ModalRN.Header>
          <ModalRN.Content><Text>Content</Text></ModalRN.Content>
          <ModalRN.Footer>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text className={`py-2 px-4 ${colors.warning} items-center rounded-lg text-white`}>Close</Text>
            </TouchableOpacity>
          </ModalRN.Footer>
        </ModalRN>

      </View>
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={['100%']}
        index={-1}
        enablePanDownToClose={true}
        animationConfigs={animationConfigs}
      >
        <BottomSheetView className='flex-1 items-center bg-slate-300 justify-center'>
          {camera && <BarcodeScanner
            onScan={handleScan}
            onClose={() => handleClosePress()}
          />}

        </BottomSheetView>
      </BottomSheet>
    </SafeAreaView>
  );
}
