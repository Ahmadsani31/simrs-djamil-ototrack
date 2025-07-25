import {
  View,
  Text,
  TouchableOpacity,
  Image as ImageLocal,
  Pressable,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableHighlight,
} from 'react-native';
import React, { useState } from 'react';
import { Image } from 'expo-image';
import { Link, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import secureApi from '@/services/service';
import { Checkpoint } from '@/types/types';
import { AntDesign, Entypo, MaterialCommunityIcons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import PageDailyListCheckpoint from './PageDailyListCheckpoint';
import { ModalRN } from './ModalRN';
import ButtonCostum from './ButtonCostum';
import { colors } from '@/constants/colors';
import ModalCamera from './ModalCamera';
import InputArea from './InputArea';
import { reLocation } from '@/hooks/locationRequired';
import { Toast } from 'toastify-react-native';
import { FlatList } from 'react-native-gesture-handler';
import ModalPreviewImage from './ModalPreviewImage';

type propsUseQuery = {
  id: number;
  keterangan: string;
  file_image: string;
};

const fetchDataLog = async (service_id: number) => {
  try {
    const response = await secureApi.get(`/service/list_images`, {
      params: {
        service_id: service_id,
      },
    });
    return response.data;
  } catch (error) {
    return [];
  }
};

const [previewImage, setPreviewImage] = useState(false);
const [imgUrl, setImgUrl] = useState<string | null>(null);

const PageServiceListImage = ({ id, onPress }: { id: number; onPress: (e: string) => void }) => {
  const {
    data: fetch_service,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<propsUseQuery[]>({
    queryKey: ['fetch_service', id],
    queryFn: async () => await fetchDataLog(id),
    enabled: !!id,
  });

  const handleOpenPreviewImage = (e: string) => {
    setPreviewImage(true);
    setImgUrl(e);
  };

  const handleCloseImage = () => {
    setPreviewImage(false);
    setImgUrl('');
  };

  const renderItem = ({ item }: { item: propsUseQuery }) => {
    return (
      <View className="flex-row items-center justify-between rounded-lg bg-white">
        <View className="w-full rounded-lg bg-gray-300">
          <TouchableOpacity onPress={() => onPress(item.file_image)} className="p-4">
            <View className="w-full flex-row items-center gap-3">
              {item.file_image && (
                <ImageLocal
                  source={{ uri: item.file_image }}
                  style={{ width: 120, height: 120, borderRadius: 5 }}
                />
              )}
              <View className="flex-1">
                <Text className="text-wrap">{item.keterangan}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View className="rounded-lg bg-white p-4">
      <FlatList
        data={fetch_service}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 920, gap: 10 }}
      />
    </View>
  );
};

export default PageServiceListImage;
