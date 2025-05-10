import { View, Text, Alert, Image } from 'react-native';
import { useCallback, useMemo, useRef, useState } from 'react';
import BottomSheet, { BottomSheetSectionList, BottomSheetView, useBottomSheetSpringConfigs } from '@gorhom/bottom-sheet';
import BarcodeScanner from '@/components/BarcodeScanner';
import { router, useFocusEffect } from 'expo-router';
import SafeAreaView from '@/components/SafeAreaView';
import dayjs from 'dayjs';
import secureApi from '@/services/service';
import ScreenListPemakaian from '@/components/ScreenListPemakaian';
import { useLoadingStore } from '@/stores/loadingStore';
import { Checkpoint } from '@/types/types';
import ScreenPemakaianAktif from '@/components/ScreenPemakaianAktif';


export default function Home() {

  const setLoading = useLoadingStore((state) => state.setLoading);

  const [camera, setCamera] = useState(false);

  useFocusEffect(
    useCallback(() => {
      // Refresh logic here
    }, [])
  );

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

  const handleSnapPress = useCallback(() => {

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
          text: 'Tutup', onPress: () => null, style: 'cancel'
        },
      ]);
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
