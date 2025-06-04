import { View, Text, KeyboardAvoidingView, ScrollView, Platform, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLoadingStore } from '@/stores/loadingStore';
import ScreenPartialPemakaian from '@/components/ScreenPartialPemakaian';
import { dataAktif } from '@/types/types';
import { RefreshControl } from 'react-native-gesture-handler';
import { useQueryClient } from '@tanstack/react-query';
import secureApi from '@/services/service';

export default function PemakaianScreen() {

    const keyboardVerticalOffset = Platform.OS === 'ios' ? 40 : 0
    const keyboardBehavior = Platform.OS === 'ios' ? 'padding' : 'height'

    const queryClient = useQueryClient()

    const setLoading = useLoadingStore((state) => state.setLoading);

    const [rowAktif, setRowAktif] = useState<dataAktif>()

    useEffect(() => {
        fetchData()
    }, [])


    const fetchData = async () => {
        setLoading(true)
        try {
            const response = await secureApi.get(`reservasi/aktif`);
            if (response.status === true) {
                setRowAktif(response.data)
            } else {
                setRowAktif(undefined)
            }

        } catch (error: any) {
            setRowAktif(undefined)
            if (error.request) {
                Alert.alert("Network Error", "Tidak bisa terhubung ke server. Cek koneksi kamu.");
            }
        } finally {
            setLoading(false)
        }
    };

    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = () => {
        fetchData();
        queryClient.invalidateQueries({ queryKey: ['dataAllBbm'] });
        queryClient.invalidateQueries({ queryKey: ['dataBbm'] });
        setInterval(() => {
            setRefreshing(false);
        }, 1000);
    };

    return (
        <View className="flex-1 bg-slate-300">
            <View className='absolute w-full bg-[#205781] h-44 rounded-br-[50]  rounded-bl-[50]' />
            <View className='px-4'>
                <KeyboardAvoidingView behavior={keyboardBehavior} keyboardVerticalOffset={keyboardVerticalOffset}>
                    <ScrollView
                        contentContainerStyle={{ paddingBottom: 70 }}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['grey']}
                                progressBackgroundColor={'black'} />
                        }
                    >
                        {rowAktif ?
                            (
                                <>
                                    <View className="bg-teal-300 rounded-lg mb-3">
                                        <View className="items-center mb-3 py-3">
                                            <Text className="text-center">Kendaraan Aktif</Text>
                                            <Text className="text-3xl text-center font-bold">{rowAktif?.name}</Text>
                                            {/* <View className="border border-b-2 w-full my-2" /> */}

                                            <Text className="font-medium text-sm text-center mb-2">{rowAktif?.no_polisi}</Text>
                                            <View className=' bg-white rounded-lg p-1 px-3'>
                                                <Text className='font-medium text-center'>
                                                    {rowAktif?.kegiatan}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                    <ScreenPartialPemakaian items={rowAktif} />
                                </>
                            )
                            :
                            (
                                <View className="bg-white rounded-lg">
                                    <View className="items-center mb-3 py-2">
                                        <Text className="text-red-500 text-center font-bold">No Active</Text>
                                        <Text className="text-xl text-center">Tidak ada kendaraan terpakai</Text>
                                    </View>
                                </View>
                            )}

                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </View>
    )
}