import { Text, View, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { useState } from 'react';

interface InputProps {
  label?: string;
  placeholder: string;
  onChangeFile: (text: string) => void;
  error?: string;
}

export default function InputFile({ label, onChangeFile, placeholder, error }: InputProps) {
  const [fileName, setFileName] = useState<string | null>('');

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      // allowsEditing: true,
      // aspect: [3, 4],
      quality: 1,
    });

    // console.log(result.assets[0].fileName);

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setFileName(result.assets[0].fileName ?? '');
      onChangeFile(result.assets[0].uri);

      try {
        // 2. Mengompres gambar yang dipilih
        console.log('Mulai kompresi...');
        const compressedImage = await manipulateAsync(imageUri, [], {
          compress: 0.6, // Kompresi 60% (keseimbangan baik antara ukuran & kualitas)
          format: SaveFormat.JPEG,
        });
        console.log('Kompresi selesai, URI baru:', compressedImage.uri);

        // 3. Mengunggah gambar yang sudah dikompres
        console.log('Mulai upload...');
        // await uploadImageAsync(compressedImage);
      } catch (error) {
        console.error('Proses gagal:', error);
        // Alert.alert('Error', 'Terjadi kesalahan saat memproses gambar.');
      } finally {
        // setIsUploading(false); // Sembunyikan loading indicator
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
