import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { Toast } from 'toastify-react-native';

import { useLoadingStore } from '@/stores/loadingStore';
import { logger } from '@/utils/logger';

interface InputProps {
  label?: string;
  placeholder: string;
  onChangeFile: (text: string) => void;
  error?: string;
}

export default function InputFile({ label, onChangeFile, placeholder, error }: InputProps) {
  const setLoading = useLoadingStore((state) => state.setLoading);

  const [fileName, setFileName] = useState<string | null>('');

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      // allowsEditing: true,
      // aspect: [3, 4],
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setFileName(result.assets[0].fileName ?? '');
      // onChangeFile(result.assets[0].uri);

      try {
        setLoading(true);
        // 2. Mengompres gambar yang dipilih
        logger.log('Mulai kompresi...');
        const context = ImageManipulator.manipulate(imageUri);
        context.resize({ width: 1600 });
        const image = await context.renderAsync();
        const compressedImage = await image.saveAsync({
          compress: 0.8,
          format: SaveFormat.JPEG,
        });

        const fileInfo = await FileSystem.getInfoAsync(compressedImage.uri);
        const compressedSize = fileInfo.exists ? (fileInfo.size ?? 0) : 0;
        logger.log('Compressed size (bytes):', compressedSize);

        onChangeFile(compressedImage?.uri);
      } catch (error) {
        logger.error('Proses gagal:', error);
        Toast.show({
          position: 'center',
          type: 'error',
          text1: 'Perhatian!',
          text2: 'Terjadi kesalahan saat memproses gambar, Silahkan ambil ulang',
          backgroundColor: '#000',
          textColor: '#fff',
          visibilityTime: 5000,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <View className="mb-3">
      <Text className="mb-1 font-bold text-gray-700">{label}</Text>
      <TouchableOpacity
        className={`flex-row items-center gap-2 rounded-lg border ${error ? 'border-red-500' : 'border-gray-500'} bg-slate-200 p-3`}
        onPress={pickImage}>
        <MaterialCommunityIcons name="file" size={20} />
        <Text className="font-bold">{fileName ? fileName : placeholder}</Text>
      </TouchableOpacity>
      {error && <Text className="mt-1 text-xs text-red-500">{error}</Text>}
    </View>
  );
}
