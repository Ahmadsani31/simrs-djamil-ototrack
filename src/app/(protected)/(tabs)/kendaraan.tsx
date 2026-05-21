import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Text, View, RefreshControl, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import SkeletonList from '@/components/feedback/SkeletonList';
import secureApi from '@/services/service';
import { Kendaraan } from '@/types/types';

const fetchData = async () => {
  try {
    const response = await secureApi.get(`/kendaraan`);
    return response.data;
  } catch {
    return [];
  }
};

export default function KendaraanScreen() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');

  const { data, isLoading, refetch, isRefetching } = useQuery<Kendaraan[]>({
    queryKey: ['dataKendaraan'],
    queryFn: fetchData,
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  const filtered = useMemo(() => {
    if (!data) return [];
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter(
      (k) =>
        k.model.toLowerCase().includes(q) ||
        k.no_polisi.toLowerCase().includes(q) ||
        k.kondisi.toLowerCase().includes(q)
    );
  }, [data, search]);

  const kondisiBadge = (kondisi: string) => {
    const k = kondisi.toLowerCase();
    if (k === 'baik' || k === 'good') return { bg: 'bg-emerald-100', text: 'text-emerald-700' };
    if (k === 'rusak' || k === 'bad' || k === 'rusak ringan')
      return { bg: 'bg-red-100', text: 'text-red-700' };
    return { bg: 'bg-amber-100', text: 'text-amber-700' };
  };

  const renderItem = useCallback(({ item }: { item: Kendaraan }) => {
    const badge = kondisiBadge(item.kondisi);
    return (
      <View className="mx-4 mb-3 flex-row items-center rounded-2xl bg-white p-3 shadow-sm">
        <View className="mr-3 items-center justify-center rounded-xl bg-slate-100 p-2">
          <Image
            source={require('@asset/images/car.png')}
            style={{ width: 64, height: 64 }}
            contentFit="contain"
          />
        </View>
        <View className="flex-1">
          <Text className="text-base font-bold text-gray-800" numberOfLines={1}>
            {item.model}
          </Text>
          <View className="mt-1 flex-row items-center gap-1.5">
            <MaterialCommunityIcons name="card-text-outline" size={14} color="#64748b" />
            <Text className="text-sm text-gray-500">{item.no_polisi}</Text>
          </View>
        </View>
        <View className={`rounded-full px-3 py-1 ${badge.bg}`}>
          <Text className={`text-xs font-semibold ${badge.text}`}>{item.kondisi}</Text>
        </View>
      </View>
    );
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      {/* Header */}
      <View className="bg-brand px-4 pb-10" style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center gap-2">
          <MaterialCommunityIcons name="car-multiple" size={20} color="white" />
          <Text className="text-2xl font-bold text-white">Daftar Kendaraan</Text>
        </View>
        <Text className="mt-0.5 text-sm text-white/60">
          {data?.length ?? 0} kendaraan terdaftar
        </Text>
      </View>

      {/* Search */}
      <View className="mx-4 -mt-7 mb-3 flex-row items-center rounded-xl bg-white px-3 py-2 shadow-sm">
        <Feather name="search" size={18} color="#94a3b8" />
        <TextInput
          className="ml-2 flex-1 text-sm text-gray-800"
          placeholder="Cari model atau nomor polisi..."
          placeholderTextColor="#94a3b8"
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} hitSlop={8}>
            <Feather name="x-circle" size={18} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={isRefetching || isLoading} onRefresh={refetch} />
        }
        contentContainerStyle={{ paddingBottom: 80, paddingTop: 4 }}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={11}
        ListEmptyComponent={
          isLoading ? (
            <View className="mx-4">
              <SkeletonList loop={8} />
            </View>
          ) : (
            <View className="mx-4 mt-8 items-center rounded-2xl bg-white p-8">
              <MaterialCommunityIcons name="car-off" size={48} color="#cbd5e1" />
              <Text className="mt-3 text-center text-gray-400">
                {search ? 'Tidak ditemukan' : 'Belum ada kendaraan terdaftar'}
              </Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}
