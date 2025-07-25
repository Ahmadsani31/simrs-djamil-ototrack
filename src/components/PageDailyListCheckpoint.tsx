import secureApi from '@/services/service';
import { useQuery } from '@tanstack/react-query';
import { View, Text, TouchableHighlight, FlatList, ScrollView, RefreshControl } from 'react-native';
import { Checkpoint } from '@/types/types';
import { Entypo } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { useState } from 'react';
import ModalPreviewImage from './ModalPreviewImage';

const fetchDataLog = async (reservasi_id: number) => {
  try {
    const response = await secureApi.get(`/checkpoint/pemakaian`, {
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
  const {
    data: fetch_checkpoint,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Checkpoint[]>({
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
    console.error('Error fetching checkpoint data:', error);
  }

  return (
    <>
      {fetch_checkpoint && fetch_checkpoint.length > 0 ? (
        <View className="my-2 rounded-lg bg-white p-4">
          <Text className="mb-3 text-xl font-bold">Log Pemakaian</Text>
          <FlatList
            data={fetch_checkpoint}
            refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
            renderItem={({ item }) => (
              <View className="mb-2 rounded-lg bg-[#F2E5BF] p-4">
                <View className="mb-1 flex-row items-center justify-between rounded-lg">
                  <View>
                    <Text className="font-bold">{item.checkpoint_name}</Text>
                    <Text>{dayjs(item.checkpoint_in).format('dddd ,DD MMMM YYYY')}</Text>
                    <Text>Jam : {dayjs(item.checkpoint_in).format('HH:ss')}</Text>
                  </View>
                  <TouchableHighlight
                    onPress={() => handleShowImage(item.image, 'Foto proses pengisian BBM')}
                    className="rounded-lg bg-gray-300 p-1 ">
                    <View className="flex-row items-center">
                      <Entypo name="images" size={24} color="black" />
                      <Text className="ms-5 text-center">gambar pengisian</Text>
                    </View>
                  </TouchableHighlight>
                </View>
                {item.data.map((bbm, index) => (
                  <View className="mb-3 gap-2 rounded-lg bg-white p-4" key={index}>
                    <View className="flex-row">
                      <Text className="font-bold">Dengan {bbm.jenis}</Text>
                      <Text>
                        {bbm.jenis == 'Voucher'
                          ? ` : ${bbm.liter} Liter`
                          : ` : Nominal Rp.${parseFloat(Number(bbm.uang).toFixed(2)).toLocaleString()}`}
                      </Text>
                    </View>
                    <View>
                      <TouchableHighlight
                        onPress={() =>
                          handleShowImage(bbm.image, 'Foto Bon / Struck pembelian BBM')
                        }
                        className="rounded-lg bg-gray-300 p-1 ">
                        <View className="flex-row items-center">
                          <Entypo name="images" size={24} color="black" />
                          <Text className="ms-5 text-center">gambar struk / bon</Text>
                        </View>
                      </TouchableHighlight>
                    </View>
                  </View>
                ))}
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
