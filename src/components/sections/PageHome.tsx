import { View, Text, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { BarChart } from 'react-native-gifted-charts';
import { Image } from 'expo-image';
import secureApi from '@/services/service';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import SkeletonList from '@/components/feedback/SkeletonList';
import { colors } from '@/constants/colors';

type propsBar = {
  value: number;
  label: string;
  frontColor: string;
};

export default function PageHome({ onPress }: { onPress: (e: string) => void }) {
  const [loading, setLoading] = useState(false);
  const [barData, setBarData] = useState<propsBar[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await secureApi.get(`user/chart_kendaraan`);
      const chart = response.data.map((item: propsBar) => ({
        value: item.value,
        label: item.label,
        frontColor: item.frontColor,
        topLabelComponent: () => (
          <Text className="text-[10px] font-semibold text-gray-600">{item.value}</Text>
        ),
      }));
      setBarData(chart);
    } catch {
      setBarData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      {/* Selection cards */}
      <View className="rounded-2xl bg-white p-4 shadow-sm">
        <Text className="mb-1 text-base font-bold text-gray-800">Mulai Pencatatan</Text>
        <Text className="mb-4 text-xs text-gray-400">
          Pilih jenis penggunaan, lalu scan QR code kendaraan
        </Text>
        <View className="flex-row gap-3">
          <TouchableOpacity
            className="flex-1 items-center rounded-xl bg-blue-50 p-4"
            onPress={() => onPress('daily')}
            activeOpacity={0.8}>
            <View className="mb-2 rounded-full bg-blue-100 p-3">
              <Image
                style={{ width: 56, height: 56 }}
                source={require('@asset/images/daily-use.png')}
                contentFit="contain"
                transition={300}
              />
            </View>
            <Text className="text-sm font-bold text-blue-700">Aktivitas Harian</Text>
            <Text className="mt-0.5 text-[10px] text-blue-500">Scan untuk memulai</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 items-center rounded-xl bg-amber-50 p-4"
            onPress={() => onPress('service')}
            activeOpacity={0.8}>
            <View className="mb-2 rounded-full bg-amber-100 p-3">
              <Image
                style={{ width: 56, height: 56 }}
                source={require('@asset/images/maintenance.png')}
                contentFit="contain"
                transition={300}
              />
            </View>
            <Text className="text-sm font-bold text-amber-700">Service Kendaraan</Text>
            <Text className="mt-0.5 text-[10px] text-amber-500">Scan untuk memulai</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Chart */}
      <View className="mt-3 rounded-2xl bg-white p-4 shadow-sm">
        <View className="mb-3 flex-row items-center gap-2">
          <View className="rounded-full bg-slate-100 p-1.5">
            <MaterialCommunityIcons name="chart-bar" size={16} color={colors.brand} />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-bold text-gray-800">Kendaraan Sering Digunakan</Text>
            <Text className="text-[10px] text-gray-400">Statistik pemakaian</Text>
          </View>
        </View>

        {loading ? (
          <SkeletonList loop={2} />
        ) : barData.length === 0 ? (
          <View className="items-center py-8">
            <Feather name="bar-chart-2" size={36} color="#cbd5e1" />
            <Text className="mt-2 text-xs text-gray-400">Belum ada data</Text>
          </View>
        ) : (
          <View className="items-center">
            <BarChart
              showYAxisIndices
              noOfSections={5}
              maxValue={100}
              data={barData}
              barWidth={32}
              sideWidth={12}
              barBorderRadius={6}
              xAxisThickness={0}
              yAxisThickness={0}
              spacing={28}
              initialSpacing={10}
              yAxisTextStyle={{ color: '#94a3b8', fontSize: 10 }}
              xAxisLabelTextStyle={{ color: '#64748b', fontSize: 10 }}
            />
          </View>
        )}
      </View>
    </View>
  );
}
