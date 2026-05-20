import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';

import PageDailyListCheckpoint from '@/components/sections/PageDailyListCheckpoint';

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
      {/* Active vehicle banner */}
      <View className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <View className="bg-emerald-500 p-4">
          <View className="flex-row items-center gap-2">
            <View className="rounded-full bg-white/20 p-1.5">
              <MaterialCommunityIcons name="car-sports" size={16} color="white" />
            </View>
            <Text className="text-xs font-medium text-white/80">Pemakaian Aktif</Text>
          </View>
          <Text className="mt-2 text-3xl font-bold text-white">{item?.kendaraan}</Text>
          <Text className="text-sm text-white/80">{item?.no_polisi}</Text>
          <View className="mt-3 self-start rounded-full bg-white/20 px-3 py-1">
            <Text className="text-xs font-medium text-white">{item?.kegiatan}</Text>
          </View>
        </View>
      </View>

      {/* Action buttons */}
      <View className="mt-3 gap-3">
        <TouchableOpacity
          className="overflow-hidden rounded-2xl bg-white shadow-sm"
          onPress={() =>
            router.push({
              pathname: 'pengembalian',
              params: { reservasi_id: item?.id },
            })
          }
          activeOpacity={0.8}>
          <View className="flex-row items-center p-4">
            <View className="mr-3 rounded-xl bg-blue-50 p-2">
              <Image
                style={{ width: 48, height: 48 }}
                source={require('@asset/images/return-car.png')}
                contentFit="contain"
              />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-gray-800">Pengembalian Kendaraan</Text>
              <Text className="text-xs text-gray-400">Selesaikan pemakaian kendaraan</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#cbd5e1" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          className="overflow-hidden rounded-2xl bg-white shadow-sm"
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}>
          <View className="flex-row items-center p-4">
            <View className="mr-3 rounded-xl bg-amber-50 p-2">
              <Image
                style={{ width: 48, height: 48 }}
                source={require('@asset/images/gas-station1.png')}
                contentFit="contain"
              />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-gray-800">Pengisian BBM</Text>
              <Text className="text-xs text-gray-400">Catat pengisian bahan bakar</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#cbd5e1" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Checkpoint logs */}
      <PageDailyListCheckpoint id={item.id} />

      {/* BBM Selection Modal */}
      <Modal
        animationType="fade"
        transparent
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View className="flex-1 items-center justify-center bg-black/60 px-5">
          <View className="w-full max-w-md overflow-hidden rounded-3xl bg-white">
            <View className="bg-brand p-5">
              <View className="mb-1 flex-row items-center gap-2">
                <MaterialCommunityIcons name="gas-station" size={20} color="white" />
                <Text className="text-base font-bold text-white">Pengisian BBM</Text>
              </View>
              <Text className="text-xs text-white/70">Pilih metode pembayaran pengisian BBM</Text>
            </View>

            <View className="p-5">
              <View className="flex-row gap-3">
                <TouchableOpacity
                  className="flex-1 items-center rounded-2xl bg-emerald-50 p-4"
                  onPress={() => {
                    router.push({
                      pathname: '/(protected)/bbm-uang',
                      params: {
                        kendaraan_id: item?.kendaraan_id,
                        reservasi_id: item?.id,
                      },
                    });
                    setModalVisible(false);
                  }}
                  activeOpacity={0.8}>
                  <View className="mb-2 rounded-full bg-emerald-100 p-2">
                    <Image
                      style={{ width: 56, height: 56 }}
                      source={require('@asset/images/money.png')}
                      contentFit="contain"
                    />
                  </View>
                  <Text className="text-sm font-bold text-emerald-700">Uang Tunai</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 items-center rounded-2xl bg-amber-50 p-4"
                  onPress={() => {
                    router.push({
                      pathname: '/(protected)/bbm-voucher',
                      params: {
                        kendaraan_id: item?.kendaraan_id,
                        reservasi_id: item?.id,
                      },
                    });
                    setModalVisible(false);
                  }}
                  activeOpacity={0.8}>
                  <View className="mb-2 rounded-full bg-amber-100 p-2">
                    <Image
                      style={{ width: 56, height: 56 }}
                      source={require('@asset/images/voucher.png')}
                      contentFit="contain"
                    />
                  </View>
                  <Text className="text-sm font-bold text-amber-700">Voucher</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="mt-4 rounded-xl bg-slate-100 py-3"
                activeOpacity={0.8}>
                <Text className="text-center text-sm font-semibold text-gray-600">Batal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default PageDaily;
