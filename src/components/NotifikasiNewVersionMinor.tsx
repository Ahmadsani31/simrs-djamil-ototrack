import { Modal, StyleSheet, Text, TouchableHighlight, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import * as Updates from 'expo-updates';

export default function NotifikasiNewVersionMinor() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const cekNewVersion = async () => {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          setVisible(true);
        }
      } catch (e) {
        console.warn('Error cek pembaruan minor :', JSON.stringify(e));
      }
    };
    // call the function
    cekNewVersion();
  }, []);

  const handleUpdate = async () => {
    await Updates.fetchUpdateAsync();
    await Updates.reloadAsync(); // Restart dengan update
  };

  return (
    visible && (
      <Modal animationType="slide" transparent={true} visible={visible}>
        <View className="flex-1 items-center justify-end bg-black/50">
          <View className="w-full rounded-t-lg bg-white">
            <View className="rounded-t-lg bg-gray-200 p-5">
              <View className="flex-row gap-2">
                <AntDesign name="exclamationcircle" size={24} color="black" />
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
                  className="items-center rounded-xl bg-[#205781] py-3"
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
    )
  );
}

const styles = StyleSheet.create({});
