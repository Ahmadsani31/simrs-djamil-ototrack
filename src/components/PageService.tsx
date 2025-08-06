import { View, Text, TouchableOpacity, Image as ImageLocal, ScrollView, Alert } from 'react-native';
import React, { useState } from 'react';
import { Image } from 'expo-image';
import { Link, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import secureApi from '@/services/service';
import { AntDesign, Entypo, FontAwesome6, MaterialCommunityIcons } from '@expo/vector-icons';
import { ModalRN } from './ModalRN';
import ButtonCostum from './ButtonCostum';
import { colors } from '@/constants/colors';
import ModalCamera from './ModalCamera';
import InputArea from './InputArea';
import { reLocation } from '@/hooks/locationRequired';
import { Toast } from 'toastify-react-native';
import PageServiceListImage from './PageServiceListImage';
import ModalPreviewImage from './ModalPreviewImage';

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

const PageService = ({ item }: rawData) => {
  // console.log('PageService item:', item);

  const [loading, setLoading] = useState(false);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [dialogCamera, setDialogCamera] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [note, setNote] = useState('');

  const [previewImage, setPreviewImage] = useState(false);
  const [imgPreviewUrl, setImgPreviewUrl] = useState<string | null>(null);

  const handleDialogBBM = () => {
    setModalVisible(false);
    setImgUrl(null);
    setNote('');
  };

  return (
    <>
      {item.map((itx, i) => (
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: '/(pemiliharaan)/pemiliharaan-nested',
              params: {
                name: itx?.kendaraan,
                service_id: itx?.id,
              },
            })
          }
          key={i}>
          <View className="my-2 rounded-lg bg-white p-4">
            <View className="flex-row items-center justify-end gap-3">
              <Text>Klik untuk detail</Text>
              <FontAwesome6 name="square-arrow-up-right" size={24} color="black" />
            </View>
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-4xl font-bold">{itx?.kendaraan}</Text>
                <Text className="mb-2 text-xl font-medium">{itx?.no_polisi}</Text>
              </View>
              <View className="rounded-lg bg-amber-500 p-2 text-center">
                <Text className=" text-xl font-bold text-white">{itx?.jenis_kerusakan}</Text>
              </View>
            </View>

            <View className=" rounded-lg bg-gray-200 p-1 px-3">
              <Text className="text-center font-medium">{itx?.keterangan}</Text>
              <Text className="text-center font-medium">{itx?.lokasi}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </>
  );
};

export default PageService;
