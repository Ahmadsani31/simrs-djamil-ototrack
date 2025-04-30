import { View, Text, FlatList, TouchableOpacity, Alert, RefreshControl, Modal, TextInput, StyleSheet } from 'react-native';
import { useAuthStore } from '@/stores/authStore';
import { useCallback, useEffect, useRef, useState } from 'react';
import { todoService } from '@/services/api';
import { MaterialIcons } from '@expo/vector-icons';
import { ModalRN } from '@/components/ModalRN';
import BottomSheet, { BottomSheetView, useBottomSheetSpringConfigs } from '@gorhom/bottom-sheet';
import BarcodeScanner from '@/components/BarcodeScanner';
import { router, useFocusEffect, useNavigation } from 'expo-router';

interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

type VehicleData = {
  id: string;
  vehicleName: string;
  userName: string;
  departureTime: string;
  returnTime: string;
  date: string;
};

const sampleData: VehicleData[] = [
  {
    id: '1',
    vehicleName: 'Toyota Avanza',
    userName: 'Ahmad Sani',
    departureTime: '08:00',
    returnTime: '17:00',
    date: '2025-04-28',
  },
  {
    id: '2',
    vehicleName: 'Honda Brio',
    userName: 'Budi Santoso',
    departureTime: '09:00',
    returnTime: '16:30',
    date: '2025-04-28',
  },
  {
    id: '3',
    vehicleName: 'Suzuki Ertiga',
    userName: 'Citra Lestari',
    departureTime: '07:30',
    returnTime: '18:00',
    date: '2025-04-28',
  },
  {
    id: '4',
    vehicleName: 'Daihatsu Xenia',
    userName: 'Dewi Anggraini',
    departureTime: '10:00',
    returnTime: '15:30',
    date: '2025-04-28',
  },
  {
    id: '5',
    vehicleName: 'Mitsubishi Xpander',
    userName: 'Eko Prasetyo',
    departureTime: '06:45',
    returnTime: '17:15',
    date: '2025-04-28',
  },
  {
    id: '6',
    vehicleName: 'Nissan Livina',
    userName: 'Fitriani',
    departureTime: '08:30',
    returnTime: '17:45',
    date: '2025-04-28',
  },
  {
    id: '7',
    vehicleName: 'Kia Seltos',
    userName: 'Gilang Mahardika',
    departureTime: '09:15',
    returnTime: '18:00',
    date: '2025-04-28',
  },
  {
    id: '8',
    vehicleName: 'Hyundai Stargazer',
    userName: 'Hana Putri',
    departureTime: '07:00',
    returnTime: '16:00',
    date: '2025-04-28',
  },
  {
    id: '9',
    vehicleName: 'Wuling Almaz',
    userName: 'Irwan Saputra',
    departureTime: '08:15',
    returnTime: '17:30',
    date: '2025-04-28',
  },
  {
    id: '10',
    vehicleName: 'Mazda CX-5',
    userName: 'Joko Widodo',
    departureTime: '09:45',
    returnTime: '19:00',
    date: '2025-04-28',
  },
];



export default function Home() {
  const { logout } = useAuthStore();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const data = await todoService.getTodos();
        setTodos(data);
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch todos');
      } finally {
        setLoading(false);
      }
    };

    // fetchTodos();
  }, []);

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


  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading todos...</Text>
      </View>
    );
  }

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    sampleData.push({
      id: '12',
      vehicleName: '12 Toyota Avanza',
      userName: 'Ahmad Sani',
      departureTime: '08:00',
      returnTime: '17:00',
      date: '2025-04-28',
    },)
    setInterval(() => {
      setRefreshing(false);

    }, 1000);
  };
  const [camera, setCamera] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

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


  const handleScan = (data: string) => {
    console.log('Scanned data:', data);
    setCamera(false);
    bottomSheetRef.current?.close();

    // toast.success('Barcode Scan Success')
    Alert.alert('Scan Successfully', 'Tekan OK untuk menlanjutkan proses..', [
      {
        text: 'Cancel',
        onPress: () => null,
        style: 'cancel',
      },
      { text: 'OK', onPress: () => {
        router.push({
          pathname: '/(protected)/detail',
          params: { data: data },
        });
      } },
    ]);
  };

  const animationConfigs = useBottomSheetSpringConfigs({
    damping: 80,
    overshootClamping: true,
    restDisplacementThreshold: 0.1,
    restSpeedThreshold: 0.1,
    stiffness: 500,
  });

  return (
    <>
      <View className="flex-1 bg-slate-300">
        <View className='absolute w-full bg-[#60B5FF] h-44 rounded-br-[50]  rounded-bl-[50]' />
        <View className='p-2'>

          <View className='p-3'>
            <View className='mb-4'>
              <Text className="text-2xl font-bold text-center text-white">Scan Barcode Here</Text>
              <Text className="text-sm text-center text-white">Silahkan scan qrcode yang ada pada masing-masing kendaraan</Text>

            </View>
            <TouchableOpacity onPress={handleSnapPress}
              className="flex-row items-center justify-center bg-[#077A7D] py-3 px-6 rounded-lg"
            >
              <MaterialIcons name="qr-code-scanner" size={24} color="white" />
              <Text className="text-white font-bold ml-2">Scan Barcode</Text>
            </TouchableOpacity>
          </View>

        </View>
        <View className="flex-row justify-between items-center px-4 mt-5 mb-2">
          <Text className="text-lg font-bold">List Pemakaianan</Text>
        </View>

        <FlatList
          data={sampleData}
          style={{ flexGrow: 0, paddingLeft:15,paddingRight:15 }}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          stickyHeaderIndices={[0]}
          ListHeaderComponent={
            <View className='p-2 bg-blue-300 mb-2 rounded-lg'>
              <TextInput className='border border-gray-300 rounded-md bg-gray-200 p-4'
                placeholder="Search"
              />
            </View>
          }
          renderItem={({ item }) => (
            <View className="bg-white p-4 rounded-lg shadow mb-2">
              <View className='flex-row items-center justify-between'>
                <Text className={`text-2xl font-bold text-black`}>
                  {item.vehicleName}
                </Text>
                <Text className='text-secondary text-sm'>
                  {item.date}
                </Text>
              </View>
              <Text className='font-medium text-lg'>
                {item.userName}
              </Text>
              <View className='flex-row items-center justify-around mt-4'>
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                  <Text className="text-black bg-blue-300 p-2 rounded-lg">Jam Berangkat: {item.departureTime}</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text className="text-black bg-amber-300 p-2 rounded-lg">Jam Pulang: {item.returnTime}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center bg-white p-5 mt-8">
              <Text>No todos found</Text>
            </View>
          }
        />
        <View className='h-24' />
        <ModalRN
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
        >
          <ModalRN.Header><Text>Title</Text></ModalRN.Header>
          <ModalRN.Content><Text>Content</Text></ModalRN.Content>
          <ModalRN.Footer>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text className='bg-red-500 p-3 items-center rounded-lg text-white'>Close</Text>
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
    </>
  );
}
