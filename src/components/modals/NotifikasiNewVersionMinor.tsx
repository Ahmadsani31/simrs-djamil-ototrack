import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import * as Updates from 'expo-updates';
import React, { useEffect, useState } from 'react';
import { Modal, Text, TouchableHighlight, View } from 'react-native';

import { logger } from '@/utils/logger';

export default function NotifikasiNewVersionMinor() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // expo-updates API tidak tersedia di development build — skip pengecekan.
    if (__DEV__) return;

    const cekNewVersion = async () => {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          setVisible(true);
        }
      } catch (e) {
        logger.warn('Error cek pembaruan minor :', e);
      }
    };
    cekNewVersion();
  }, []);

  const handleUpdate = async () => {
    await Updates.fetchUpdateAsync();
    await Updates.reloadAsync(); // Restart dengan update
  };

  if (visible === false) {
    return null;
  }

  return (
    <Modal animationType="slide" transparent visible={visible}>
      <View className="flex-1 items-center justify-end bg-black/50">
        <View className="w-full rounded-t-lg bg-white">
          <View className="rounded-t-lg bg-gray-200 p-5">
            <View className="flex-row gap-2">
              <AntDesign name="exclamation-circle" size={24} color="black" />
              <Text className="text-xl font-bold">Minor Update</Text>
            </View>
          </View>
          <View className="gap-4 p-5">
            <Text>
              Kami baru saja merilis pembaruan kecil untuk meningkatkan stabilitas dan kenyamanan
              penggunaan. Silakan update!
            </Text>
            <View className="my-7">
              <TouchableHighlight
                className="items-center rounded-xl bg-brand py-3"
                onPress={() => handleUpdate()}>
                <View className="flex-row items-center gap-2">
                  <MaterialIcons name="system-security-update" size={20} color="white" />
                  <Text className="text-lg font-bold text-white">Update</Text>
                </View>
              </TouchableHighlight>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
