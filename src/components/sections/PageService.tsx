import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

type rawData = {
  item: {
    id: number;
    name: string;
    kendaraan: string;
    kendaraan_id: string;
    no_polisi: string;
    kegiatan: string;
    created_at: string;
    keterangan: string;
    jenis_kerusakan: string;
    lokasi: string;
  }[];
};

const PageService = ({ item }: rawData) => {
  return (
    <View className="gap-3">
      {item.map((itx, i) => (
        <TouchableOpacity
          key={i}
          onPress={() =>
            router.push({
              pathname: '/(pemiliharaan)/pemiliharaan-nested',
              params: {
                name: itx?.kendaraan,
                service_id: itx?.id,
              },
            })
          }
          className="overflow-hidden rounded-2xl bg-white shadow-sm"
          activeOpacity={0.8}>
          {/* Header bar */}
          <View className="flex-row items-center justify-between bg-amber-100 px-4 py-2.5">
            <View className="flex-row items-center gap-1.5">
              <View className="h-2 w-2 rounded-full bg-amber-500" />
              <Text className="text-xs font-medium text-gray-600">Pemeliharaan Aktif</Text>
            </View>
            <Feather name="chevron-right" size={16} color="#94a3b8" />
          </View>

          <View className="p-4">
            {/* Vehicle + jenis kerusakan */}
            <View className="mb-3 flex-row items-start justify-between">
              <View className="flex-1">
                <Text className="text-lg font-bold text-gray-800" numberOfLines={1}>
                  {itx?.kendaraan}
                </Text>
                <View className="mt-0.5 flex-row items-center gap-1">
                  <MaterialCommunityIcons name="card-text-outline" size={13} color="#94a3b8" />
                  <Text className="text-xs text-gray-400">{itx?.no_polisi}</Text>
                </View>
              </View>
              <View className="rounded-lg bg-amber-50 px-3 py-1.5">
                <Text className="text-[10px] text-amber-500">Jenis</Text>
                <Text className="text-xs font-bold text-amber-700">{itx?.jenis_kerusakan}</Text>
              </View>
            </View>

            {/* Description */}
            <View className="rounded-lg bg-slate-50 p-2.5">
              <Text className="text-xs text-gray-600">{itx?.keterangan}</Text>
              {itx?.lokasi && (
                <View className="mt-1 flex-row items-center gap-1">
                  <Feather name="map-pin" size={11} color="#94a3b8" />
                  <Text className="text-[11px] text-gray-400">{itx?.lokasi}</Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default PageService;
