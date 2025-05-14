import { View, Text, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { router } from 'expo-router';
import { colors } from '@/constants/colors';
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import SkeletonList from './SkeletonList';
import * as SecureStore from 'expo-secure-store';
import { dataAktif } from '@/types/types';

export default function ScreenPemakaianAktif({ onPress }: { onPress: () => void }) {

    const [rawData, setRawData] = useState<dataAktif>()
    const [isLoading, setIsLoading] = useState(false)


    useEffect(() => {

        loadUsername();
    }, []);

    const loadUsername = async () => {
        setIsLoading(true);
        try {
            const param = await SecureStore.getItemAsync('pemakaianAktif');
            console.log('====================================');
            console.log(param);
            console.log('====================================');
            // console.log('Check auth token:', token);
            if (param) {
                const data = JSON.parse(param)
                setRawData(data)
            }
        } catch (error) {
            console.error('Failed to load username:', error);
            setRawData(undefined)
        } finally {
            setIsLoading(false)
        }
    };


    if (isLoading) {
        return <SkeletonList loop={1} />
    }

    if (!rawData) {
        return (
            <View>
                <View className='mb-4 '>
                    <Text className="text-2xl font-bold text-center text-white">Scan Barcode Here</Text>
                    <Text className="text-sm text-center text-white">Silahkan scan qrcode yang ada pada masing-masing kendaraan</Text>

                </View>
                <TouchableOpacity onPress={onPress}
                    className={`flex-row items-center justify-center ${colors.primary} py-3 px-6 rounded-lg`}
                >
                    <MaterialIcons name="qr-code-scanner" size={24} color="white" />
                    <Text className="text-white font-bold ml-2">Scan Barcode</Text>
                </TouchableOpacity>
            </View>
        )
    }


    return (
        <View className="bg-white p-4 rounded-lg">
            <TouchableOpacity onPress={() => loadUsername()} className='absolute top-0 right-0'>
                <Ionicons name='reload-circle' size={32} />
            </TouchableOpacity>
            <Text className='text-center'>Kendaraan yang sedang digunakan</Text>
            <Text className='text-center font-bold text-3xl'>{rawData?.name}</Text>
            <Text className='text-center font-semibold'>{rawData?.no_polisi}</Text>
            <TouchableOpacity onPress={() => router.push('/(protected)/pemakaian')}
                className={`flex-row items-center justify-center ${colors.warning} py-3 px-6 my-4 rounded-lg`}
            >
                <FontAwesome5 name="location-arrow" size={24} color="white" />
                <Text className="text-white font-bold ml-2">Detail Pemakaian</Text>
            </TouchableOpacity>
        </View>

    )
}