import secureApi from '@/services/service';
import { useQuery } from '@tanstack/react-query';
import { View, Text, TouchableHighlight, FlatList, RefreshControl } from 'react-native';
import { Entypo, MaterialCommunityIcons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { useCallback, useState } from 'react';
import ModalPreviewImage from '@/components/modals/ModalPreviewImage';
import { useFocusEffect } from 'expo-router';
import { logger } from '@/utils/logger';

interface propsBbm {
  id: number;
  jenis: string;
  uang: string;
  liter: string;
  bbm_date: string;
  created_at: string;
  spidometer: string;
  image_spidometer: string;
  image_struk: string;
  type_bbm: string;
}

const fetchDataLog = async (reservasi_id: number) => {
  try {
    const response = await secureApi.get(`/bbm/list_pengisian`, {
      params: {
        reservasi_id: reservasi_id,
      },
    });
    return response.data;
  } catch (error) {
    return [];
  }
};
export default function PageDailyCheckpoint({ id }: { id: number }) {
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  const {
    data: fetch_checkpoint,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<propsBbm[]>({
    queryKey: ['fetch_checkpoint', id],
    queryFn: async () => await fetchDataLog(id),
    enabled: !!id,
  });
  const [titleModalImage, setTitleModalImage] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [imgUrl, setImgUrl] = useState<string>();

  const handleShowImage = (url: string, title: string) => {
    setTitleModalImage(title);
    setImgUrl(url);
    setModalVisible(true);
  };

  const handleCloseImage = () => {
    setModalVisible(false);
    setImgUrl('');
  };

  if (isError) {
    logger.error('Error fetching checkpoint data:', error);
  }

  return (
    <>
      {fetch_checkpoint && fetch_checkpoint.length > 0 ? (
        <View className="my-2 rounded-lg bg-white p-4">
          <Text className="mb-3 text-xl font-bold">Log Pengisian BBM</Text>
          <FlatList
            data={fetch_checkpoint}
            refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
            renderItem={({ item }) => (
              <View className="mb-2 gap-2 rounded-lg bg-[#F2E5BF] p-4">
                <View className="flex-row items-center justify-between rounded-lg">
                  <View className="justify-center">
                    <Text>{dayjs(item.bbm_date).format('dddd ,DD MMMM YYYY')}</Text>
                    <Text>Jam : {dayjs(item.bbm_date).format('HH:mm')}</Text>
                  </View>
                  <TouchableHighlight
                    onPress={() =>
                      handleShowImage(item.image_spidometer, 'Foto proses pengisian BBM')
                    }
                    className="rounded-lg bg-gray-300 p-1">
                    <View className="flex-row items-center gap-2">
                      <Entypo name="images" size={24} color="black" />
                      <View>
                        <Text className="text-center text-xs">{item.spidometer} Km</Text>
                        <Text className="text-center text-xs">klik untuk detail</Text>
                      </View>
                    </View>
                  </TouchableHighlight>
                </View>
                <View className="mb-3 rounded-lg bg-white p-4">
                  <View className="flex-row items-center gap-2">
                    <MaterialCommunityIcons name="gas-station" size={24} color="black" />
                    <Text className="text-lg font-bold">{item.type_bbm}</Text>
                  </View>
                  <View className="flex-row">
                    <Text className="font-bold">Dengan {item.jenis}</Text>
                    <Text>
                      {item.jenis == 'Voucher'
                        ? ` : ${item.liter} Liter`
                        : ` : Nominal Rp.${parseFloat(Number(item.uang).toFixed(2)).toLocaleString()}`}
                    </Text>
                  </View>
                  <View>
                    <TouchableHighlight
                      onPress={() =>
                        handleShowImage(item.image_struk, 'Foto Bon / Struck pembelian BBM')
                      }
                      className="rounded-lg bg-gray-300 p-1 ">
                      <View className="flex-row items-center gap-2">
                        <Entypo name="images" size={24} color="black" />
                        <View>
                          <Text className="text-center">gambar struk / bon</Text>
                          <Text className="text-center text-xs">klik untuk melihat</Text>
                        </View>
                      </View>
                    </TouchableHighlight>
                  </View>
                </View>
              </View>
            )}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 820 }}
          />
          <ModalPreviewImage
            title={titleModalImage}
            imgUrl={imgUrl || ''}
            visible={modalVisible}
            onPress={() => handleCloseImage()}
          />
        </View>
      ) : null}
    </>
  );
}
