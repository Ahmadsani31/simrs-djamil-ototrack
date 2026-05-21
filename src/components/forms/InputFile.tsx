import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { File } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { ActivityIndicator, Text, View, TouchableOpacity } from 'react-native';
import { Toast } from 'toastify-react-native';

import { logger } from '@/utils/logger';

interface InputProps {
  label?: string;
  placeholder: string;
  onChangeFile: (text: string) => void;
  error?: string;
}

export default function InputFile({ label, onChangeFile, placeholder, error }: InputProps) {
  const [fileName, setFileName] = useState<string | null>('');
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setFileName(result.assets[0].fileName ?? '');

      try {
        setLoading(true);
        logger.log('Mulai kompresi...');
        const context = ImageManipulator.manipulate(imageUri);
        context.resize({ width: 1600 });
        const image = await context.renderAsync();
        const compressedImage = await image.saveAsync({
          compress: 0.8,
          format: SaveFormat.JPEG,
        });

        // SDK 55: pakai File class baru, bukan getInfoAsync (deprecated).
        // `File.size` mengembalikan null kalau file tidak ada / tidak bisa dibaca.
        const fileRef = new File(compressedImage.uri);
        const compressedSize = fileRef.exists ? (fileRef.size ?? 0) : 0;
        logger.log('Compressed size (bytes):', compressedSize);

        onChangeFile(compressedImage?.uri);
      } catch (err) {
        logger.error('Proses gagal:', err);
        Toast.show({
          position: 'center',
          type: 'error',
          text1: 'Perhatian!',
          text2: 'Terjadi kesalahan saat memproses gambar, silahkan ambil ulang',
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
      {label ? <Text className="mb-1 text-sm font-semibold text-gray-700">{label}</Text> : null}
      <TouchableOpacity
        activeOpacity={0.7}
        disabled={loading}
        onPress={pickImage}
        className={`flex-row items-center gap-2 rounded-xl border bg-slate-200 p-3 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}>
        {loading ? (
          <>
            <ActivityIndicator size="small" color="#205781" />
            <Text className="font-medium text-gray-600">Memproses gambar...</Text>
          </>
        ) : (
          <>
            <MaterialCommunityIcons
              name={fileName ? 'file-check-outline' : 'file-upload-outline'}
              size={20}
              color={fileName ? '#10b981' : '#64748b'}
            />
            <Text className="flex-1 font-medium text-gray-700" numberOfLines={1}>
              {fileName ? fileName : placeholder}
            </Text>
            {fileName ? <Feather name="check-circle" size={14} color="#10b981" /> : null}
          </>
        )}
      </TouchableOpacity>
      {error ? <Text className="mt-1 text-xs text-red-500">{error}</Text> : null}
    </View>
  );
}
