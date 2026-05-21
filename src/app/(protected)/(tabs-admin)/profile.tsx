import { AntDesign, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { Image } from 'expo-image';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, Alert } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import SkeletonList from '@/components/feedback/SkeletonList';
import { colors } from '@/constants/colors';
import secureApi from '@/services/service';
import { useAuthStore } from '@/stores/authStore';

type PieItem = {
  value: number;
  color: string;
  gradientCenterColor: string;
  focused?: boolean;
  label?: string;
};

export default function Profile() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [pieData, setPieData] = useState<PieItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await secureApi.get(`dashboard/kendaraan_terpakai_admin`);

      const raw: PieItem[] = response.data ?? [];

      // Cari index item dengan value terbesar — itu yang akan di-`focused`.
      // Server kadang kirim `focused: true` di item pertama, override supaya
      // pie chart men-highlight item dengan pemakaian terbanyak.
      let maxIdx = -1;
      let maxVal = -Infinity;
      raw.forEach((item, idx) => {
        if (item.value > maxVal) {
          maxVal = item.value;
          maxIdx = idx;
        }
      });

      const chart: PieItem[] = raw.map((item, idx) => ({
        value: item.value,
        color: item.color,
        gradientCenterColor: item.gradientCenterColor,
        focused: idx === maxIdx,
        label: item.label ?? '',
      }));
      setPieData(chart);
    } catch {
      setPieData([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert('Konfirmasi', 'Apakah Anda yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  // Chart calculations
  const total = pieData.reduce((sum, d) => sum + d.value, 0);
  const focusedItem = pieData.find((d) => d.focused) ?? pieData[0];
  const focusedPct = total > 0 && focusedItem ? Math.round((focusedItem.value / total) * 100) : 0;

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <ScrollView
        className="flex-1 bg-slate-200"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}>
        {/* Header Card */}
        <View className="bg-brand px-4 pb-14" style={{ paddingTop: insets.top + 4 * 4 }}>
          <View className="flex-row items-center rounded-2xl bg-white/15 p-4">
            <View className="mr-4 rounded-full border-2 border-white/40 p-1">
              <Image
                style={{ borderRadius: 100, width: 72, height: 72 }}
                source={require('@asset/images/profile.png')}
              />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-white">{user?.name || '-'}</Text>
              <View className="mt-1 flex-row items-center gap-1">
                <Feather name="mail" size={13} color="rgba(255,255,255,0.7)" />
                <Text className="text-sm text-white/70">{user?.email || '-'}</Text>
              </View>
              <View className="mt-2 self-start rounded-full bg-white/20 px-3 py-1">
                <Text className="text-xs font-semibold uppercase tracking-wider text-white">
                  {user?.role || '-'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Chart Card (overlaps header) */}
        <View className="mx-4 -mt-8 rounded-2xl bg-white p-5 shadow-sm">
          <View className="mb-3 flex-row items-center gap-2">
            <MaterialCommunityIcons name="chart-donut" size={20} color={colors.brand} />
            <Text className="text-base font-bold text-gray-800">Pemakaian Kendaraan</Text>
          </View>

          {loading ? (
            <SkeletonList loop={3} />
          ) : pieData.length > 0 ? (
            <View className="items-center">
              <PieChart
                data={pieData}
                donut
                showGradient
                sectionAutoFocus
                radius={100}
                innerRadius={50}
                innerCircleColor={colors.brand}
                centerLabelComponent={() => (
                  <View className="items-center justify-center">
                    <Text style={{ fontSize: 24, color: 'white', fontWeight: 'bold' }}>
                      {focusedPct}%
                    </Text>
                    <Text
                      style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}
                      numberOfLines={1}>
                      {focusedItem?.label || ''}
                    </Text>
                  </View>
                )}
              />
              {/* Legend */}
              <View className="mt-4 w-full flex-row flex-wrap justify-center gap-x-4 gap-y-2">
                {pieData.map((item, idx) => {
                  const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                  return (
                    <View key={idx} className="flex-row items-center gap-2">
                      <View
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: item.gradientCenterColor || item.color,
                        }}
                      />
                      <Text className="text-xs text-gray-600">
                        {item.label || `Item ${idx + 1}`} ({pct}%)
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          ) : (
            <View className="items-center py-8">
              <MaterialCommunityIcons name="chart-arc" size={48} color="#cbd5e1" />
              <Text className="mt-2 text-sm text-gray-400">Belum ada data</Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View className="mx-4 mt-4">
          <TouchableOpacity
            onPress={handleLogout}
            className="flex-row items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3.5"
            activeOpacity={0.8}>
            <AntDesign name="logout" size={18} color="white" />
            <Text className="font-bold text-white">Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="mt-8 items-center pb-6">
          <Text className="text-xs text-gray-400">Pencatatan Kendaraan Operasional</Text>
          <Text className="mt-0.5 text-sm font-bold text-gray-500">RSUP DR. M. DJAMIL PADANG</Text>
          <Text className="mt-3 text-[10px] text-gray-300">
            Version {Constants.expoConfig?.version}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
