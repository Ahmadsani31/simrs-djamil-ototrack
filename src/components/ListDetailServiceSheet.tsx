import { Checkpoint } from '@/types/types';
import { BottomSheetFlatList, BottomSheetSectionList } from '@gorhom/bottom-sheet';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { TextInput, Text, View, Image, Pressable } from 'react-native';
import ModalPreviewImage from './ModalPreviewImage';
import SkeletonList from './SkeletonList';
import { useQuery } from '@tanstack/react-query';
import secureApi from '@/services/service';

type itemsProps = {
  id: number;
  file_image: string;
  keterangan: string;
  created_at: string;
};

export default function ListDetailServiceSheet({ items }: { items: itemsProps[] }) {
  return (
    <View>
      <BottomSheetFlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <View className="w-full flex-1 px-4 " key={index}>
            <Text className="text-sm text-gray-500">
              {dayjs(item.created_at).format('dddd, DD MMMM YYYY | HH:mm')}
            </Text>
            <View className="mb-3 rounded-lg bg-slate-200 p-2">
              <View className="w-full flex-1 flex-row items-start gap-5">
                {item.file_image && (
                  <Image
                    source={{ uri: item.file_image }}
                    className="object-contain"
                    style={{ width: 200, height: 250, borderRadius: 8 }}
                  />
                )}
                <View className="flex-1">
                  <Text className="text-wrap">{item.keterangan}</Text>
                </View>
              </View>
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}
