import { View, Text, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { BarChart } from 'react-native-gifted-charts';
import { Image } from 'expo-image';
import { useLoadingStore } from '@/stores/loadingStore';
import secureApi from '@/services/service';
import FontAwesome from '@expo/vector-icons/FontAwesome';

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
      const chart = response.data.map((item: propsBar) => {
        const newBar = {
          value: item.value,
          label: item.label,
          frontColor: item.frontColor,
          topLabelComponent: () => <Text>{item.value}</Text>,
        };
        return newBar;
      });

      setBarData(chart);
    } catch (error: any) {
      console.log('response', error.response.data);
      setBarData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <View className="my-10 ">
        <Text className="text-center text-2xl font-bold text-white">Pilih Jenis Penggunaan</Text>
        <Text className="text-center text-sm text-white">
          Silahkan pilih jenis penggunaan dan scan qrcode yang ada pada masing-masing kendaraan
        </Text>
      </View>
      <View className="mt-10">
        <View className="flex-row items-center justify-center gap-4 rounded-lg bg-white p-5">
          <TouchableOpacity
            className="size-48 items-center justify-center gap-2 rounded-lg bg-green-300 p-2"
            onPress={() => onPress('daily')}>
            <Image
              style={{ flex: 1, width: '100%' }}
              source={require('@asset/images/daily-use.png')}
              contentFit="contain"
              transition={500}
            />
            <Text className="font-bold">Aktifitas Harian</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="size-48 items-center justify-center gap-2 rounded-lg bg-amber-300 p-2 shadow"
            onPress={() => onPress('service')}>
            <Image
              style={{ flex: 1, width: '100%' }}
              source={require('@asset/images/maintenance.png')}
              contentFit="contain"
              transition={500}
            />
            <Text className="font-bold">Service Kendaraan</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View className="mt-5 gap-2 rounded-md bg-white p-4">
        <View className="flex-row items-center gap-2">
          <FontAwesome name="bar-chart" size={18} color="black" />
          <Text>Kendaraan yang sering digunakan</Text>
        </View>

        <View className="border-1 my-1 h-px bg-black dark:bg-gray-700"></View>
        <BarChart
          showYAxisIndices
          // hideRules
          noOfSections={4}
          maxValue={100}
          data={barData}
          barWidth={40}
          sideWidth={15}
          // yAxisThickness={0}
          barBorderRadius={4}
          xAxisThickness={0}
          spacing={40}
          initialSpacing={10}
          // isThreeD
          // side="right"
        />
      </View>
    </View>
  );
}
