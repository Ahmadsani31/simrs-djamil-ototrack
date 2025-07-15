import { View, Alert, TouchableOpacity, Text } from 'react-native';
import { useCallback, useMemo, useRef, useState } from 'react';
import BottomSheet, { BottomSheetView, useBottomSheetSpringConfigs } from '@gorhom/bottom-sheet';
import BarcodeScanner from '@/components/BarcodeScanner';
import { Redirect, router } from 'expo-router';
import SafeAreaView from '@/components/SafeAreaView';
import secureApi from '@/services/service';
import ScreenListPemakaian from '@/components/ScreenListPemakaian';
import ScreenPemakaianAktif from '@/components/ScreenPemakaianAktif';
import ListDetailSectionSheet from '@/components/ListDetailSectionSheet';
import { useAuthStore } from '@/stores/authStore';

// import * as Location from 'expo-location';

// const LOCATION_TASK_NAME = 'background-location-task';

export default function IndexScreen() {

  const [reservasiID, setReservasiID] = useState(undefined);

  const [camera, setCamera] = useState(false);

  // useFocusEffect(
  //   useCallback(() => {
  //     // Refresh logic here
  //   }, [])
  // );

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
  const bottomSheetDetailRef = useRef<BottomSheet>(null);


  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      // console.log('BottomSheet closed with swipe down.');
      // Lakukan aksi lain jika ditutup
      setCamera(false);
    }
  }, []);

  const handleSnapPress = useCallback(() => {

    setCamera(true);
    bottomSheetRef.current?.expand();
  }, []);

  const handleSnapPressDetail = useCallback((id: any) => {
    setReservasiID(id);
    bottomSheetDetailRef.current?.expand();
  }, []);


  const handleScan = async (data: string) => {
    // console.log('Scanned data:', data);

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
      if (error.response && error.response.data) {
        const msg = error.response.data.message || "Terjadi kesalahan.";
        Alert.alert("Warning!", msg, [{ text: "Tutup", style: "cancel" }]);
      } else if (error.request) {
        Alert.alert("Network Error", "Tidak bisa terhubung ke server. Cek koneksi kamu.");
      } else {
        Alert.alert("Error", error.message);
      }

    } finally {

      bottomSheetRef.current?.close();
    }

  };

  return (
    <SafeAreaView noTop>
      <View className="flex-1 bg-slate-300">
        <View className='absolute w-full bg-[#205781] h-44 rounded-br-[50]  rounded-bl-[50]' />
        <View className='px-4'>
          <View className='mb-5'>
            <ScreenPemakaianAktif onPress={() => handleSnapPress()} />
          </View>
          <TouchableOpacity className={`flex-row gap-2 p-3 my-2 rounded-lg justify-center items-center bg-black`} onPress={() => router.push({
            pathname: 'detail',
            params: {
              uuid: 'ce87741a-f197-4dc4-ac42-0a368ced8a0a',
            }
          })}>
            <Text className='text-white font-bold'>Bypass Qrcode</Text>
          </TouchableOpacity>
          <ScreenListPemakaian onPress={(id) => handleSnapPressDetail(id)} />
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
      >
        <ListDetailSectionSheet reservasiID={reservasiID ?? ''} />
      </BottomSheet>

    </SafeAreaView>
  );
}


