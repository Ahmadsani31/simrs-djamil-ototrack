import { Button, Linking, Modal, StyleSheet, Text, TouchableHighlight, View } from 'react-native';
import Foundation from '@expo/vector-icons/Foundation';
import React, { useEffect, useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import * as Application from 'expo-application';
import semver from 'semver';
import { URL_PLAY_STORE, API_URL } from '@/utils/constants';
import axios from 'axios';

export default function NotifikasiNewVersion() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const cekNewVersion = async () => {
      const currentVersion = Application.nativeApplicationVersion ?? '1.0.0';

      try {
        const response = await axios.get(API_URL + '/auth/version_new_android');
        if (semver.lt(currentVersion, response.data.latest_version)) {
          setVisible(true);
        }
      } catch (error) {
        console.log('error', JSON.stringify(error));
      }
    };
    const timeout = setTimeout(() => {
      cekNewVersion(); // ganti warna setelah 2 detik
      // console.log('cek version');
    }, 5000);

    return () => clearTimeout(timeout);
    // call the function
  }, []);

  if (visible === false) {
    return null;
  }

  return (
    <Modal animationType="slide" transparent={true} visible={visible}>
      <View className="flex-1 items-center justify-end bg-black/50">
        <View className="w-full rounded-t-lg bg-white">
          <View className="rounded-t-lg bg-[#4F959D] p-5">
            <View className="flex-row gap-2">
              <Foundation name="alert" size={24} color={'#ff9966'} />
              <Text className="text-xl font-bold text-white">Wajib Update</Text>
            </View>
          </View>
          <View className="mb-10 gap-4 p-5">
            <Text>
              Versi terbaru aplikasi sudah tersedia dan dibutuhkan agar aplikasi tetap berjalan
              optimal. Silakan update untuk melanjutkan.
            </Text>
            <View className="my-5">
              <TouchableHighlight
                className="items-center rounded-3xl bg-[#205781] py-3"
                onPress={() => Linking.openURL(URL_PLAY_STORE)}>
                <View className="flex-row items-center gap-2">
                  <MaterialIcons name="system-security-update" size={20} color="white" />
                  <Text className="text-lg font-bold text-white">New Update</Text>
                </View>
              </TouchableHighlight>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({});
