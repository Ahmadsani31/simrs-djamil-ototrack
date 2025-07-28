import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { useState } from 'react';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import PageDailyListCheckpoint from './PageDailyListCheckpoint';

type rawData = {
  item: {
    id: number;
    name: string;
    kendaraan: string;
    kendaraan_id: string;
    no_polisi: string;
    kegiatan: string;
    created_at: string;
  };
};

const PageDaily = ({ item }: rawData) => {
  const [isModalVisible, setModalVisible] = useState(false);

  return (
    <>
      <View className="my-2 rounded-lg bg-teal-500 p-4">
        <Text className="mb-3 text-center text-2xl font-bold">Daily Pemakaian</Text>
        <Text className="text-center">Kendaraan</Text>
        <Text className="text-center text-4xl font-bold">{item?.kendaraan}</Text>
        <Text className="mb-2 text-center text-xl font-medium">{item?.no_polisi}</Text>
        <View className=" rounded-lg bg-white p-1 px-3">
          <Text className="text-center font-medium">{item?.kegiatan}</Text>
        </View>
      </View>
      <View className="rounded-lg bg-white p-4">
        <View className="flex items-center justify-center gap-4 rounded-lg bg-white">
          <TouchableOpacity
            className="w-full rounded-lg bg-slate-500 p-2"
            onPress={() =>
              router.push({
                pathname: 'pengembalian',
                params: {
                  reservasi_id: item?.id,
                },
              })
            }>
            <View className="w-full flex-row items-center gap-5">
              <Image
                style={{ width: 60, height: 60 }}
                source={require('@asset/images/return-car.png')}
              />
              <View className="w-72 text-wrap">
                <Text className="text-xl font-bold text-white">Pengembalian Kendaraan</Text>
                <Text className="text-sm">Klik disini untuk mengembalikan kendaraan</Text>
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            className="w-full rounded-lg bg-red-400 p-2"
            onPress={() => setModalVisible(true)}>
            <View className="w-full flex-row items-center gap-5">
              <Image
                style={{ width: 60, height: 60 }}
                source={require('@asset/images/gas-station1.png')}
              />
              <View className="w-72 text-wrap">
                <Text className="text-xl font-bold text-white">Pengisian BBM Kendaraan</Text>
                <Text className="text-sm">Klik disini untuk proses isi BBM ke SPBU</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <PageDailyListCheckpoint id={item.id} />
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View className="flex-1 items-center justify-center bg-[#205781]/75">
          <View className="w-11/12 max-w-md rounded-2xl bg-white p-6">
            <Text className="text-center text-2xl font-bold">Scan Barcode Berhasil</Text>
            <Text className="text-center  text-lg">
              Silahkan Pilih salah satu pemakaian kendaraan yang diiginkan.
            </Text>
            <View className="my-5 flex-row items-center justify-center gap-4">
              <TouchableOpacity
                className="size-44 items-center justify-center gap-2 rounded-lg bg-green-300 p-2"
                onPress={() => {
                  router.push({
                    pathname: '/(protected)/bbm-uang',
                    params: {
                      kendaraan_id: item?.kendaraan_id,
                      reservasi_id: item?.id,
                    },
                  });
                  setModalVisible(false);
                }}>
                <Image
                  style={{ flex: 1, width: '100%' }}
                  source={require('@asset/images/money.png')}
                  contentFit="contain"
                  transition={500}
                />
                <Text className="font-bold">Dengan Uang</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="size-44 items-center justify-center gap-2 rounded-lg bg-amber-300 p-2"
                onPress={() => {
                  router.push({
                    pathname: '/(protected)/bbm-voucher',
                    params: {
                      kendaraan_id: item?.kendaraan_id,
                      reservasi_id: item?.id,
                    },
                  });
                  setModalVisible(false);
                }}>
                <Image
                  style={{ flex: 1, width: '100%' }}
                  source={require('@asset/images/voucher.png')}
                  contentFit="contain"
                  transition={500}
                />
                <Text className="font-bold">Dengan Voucher</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className={`my-2 flex-row items-center justify-center gap-2 rounded-lg bg-black p-3`}>
              <Text className="font-bold' text-white">Tutup / Batal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default PageDaily;
