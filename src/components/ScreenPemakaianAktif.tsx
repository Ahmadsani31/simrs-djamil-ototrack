import { View, Text, TouchableOpacity } from 'react-native'
import React, { useEffect } from 'react'
import SkeletonItem from './SkeletonItem'
import { useQuery } from '@tanstack/react-query'
import secureApi from '@/services/service';
import { router } from 'expo-router';
import { colors } from '@/constants/colors';
import { Entypo, FontAwesome5, Fontisto, Ionicons, MaterialIcons } from '@expo/vector-icons';
import SkeletonList from './SkeletonList';

const fetchData = async () => {
    const response = await secureApi.get(`reservasi/aktif`);
    return response.data
};

interface PemakaianAktif {
    name: string;
    no_polisi: string;
}


export default function ScreenPemakaianAktif({ onPress }: { onPress: () => void }) {

    const { data, isLoading, isError, error, refetch, isFetching } = useQuery<PemakaianAktif>({
        queryKey: ['dataAktif'],
        queryFn: fetchData,
    })

    if (isLoading) {
        return <SkeletonList loop={1} />
    }

    if (isError) {
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
            <TouchableOpacity onPress={() => refetch()} className='absolute top-0 right-0'>
                <Ionicons name='reload-circle' size={32} />
            </TouchableOpacity>
            <Text className='text-center'>Kendaraan yang sedang digunakan</Text>
            <Text className='text-center font-bold text-3xl'>{data?.name}</Text>
            <Text className='text-center font-semibold'>{data?.no_polisi}</Text>
            <TouchableOpacity onPress={() => router.push('/perjalanan')}
                className={`flex-row items-center justify-center ${colors.warning} py-3 px-6 my-4 rounded-lg`}
            >
                <FontAwesome5 name="location-arrow" size={24} color="white" />
                <Text className="text-white font-bold ml-2">Detail Pemakaian</Text>
            </TouchableOpacity>
        </View>

    )
}