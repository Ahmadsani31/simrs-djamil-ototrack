import { View, Text, TouchableOpacity, Platform, KeyboardAvoidingView, Alert, ScrollView } from 'react-native';

import { useLoadingStore } from '@/stores/loadingStore';
import { useCallback, useRef, useState } from 'react';
import secureApi from '@/services/service';
import { router, useFocusEffect } from 'expo-router';
import SkeletonList from '@/components/SkeletonList';
import PerjalananScreen from './partial/perjalanan';
import CheckpointScreen from './partial/checkpoint';

interface dataAktif {
    id: number;
    name: string;
    no_polisi: string;
    kegiatan: string;
    created_at: string
}

export default function IndexScreen() {
    const keyboardVerticalOffset = Platform.OS === 'ios' ? 40 : 0
    const keyboardBehavior = Platform.OS === 'ios' ? 'padding' : 'height'

    const setLoading = useLoadingStore((state) => state.setLoading);

    const [kendaraanAktif, setKendaraanAktif] = useState(false);
    const [checkpointAktif, setCheckpointAktif] = useState(false);

    const [isLoadingAktif, setIsLoadingAktif] = useState<boolean>(false)
    const [isLoadingCheckpoint, setIsLoadingCheckpoint] = useState<boolean>(false)

    const [dataAktif, setDataAktif] = useState<dataAktif>();
    const [checkpointID, setCheckpointID] = useState<string | null>();

    useFocusEffect(
        useCallback(() => {
            fetchData()
        }, [])
    );

    const fetchData = async () => {
        setIsLoadingAktif(true)
        try {

            const response1 = await secureApi.get(`reservasi/aktif`);
            if (response1.status == true) {
                setDataAktif(response1.data)
                setKendaraanAktif(true);
            }

            const response2 = await secureApi.get(`checkpoint/aktif`, {
                params: {
                    reservasi_id: dataAktif?.id,
                },
            });
            if (response2.status == true) {
                setCheckpointID(response2.data.checkpoint_id);
                setCheckpointAktif(true);
            }
        } catch (error: any) {
            console.log('Terjadi error:', JSON.stringify(error.response.data.message));
        } finally {
            setIsLoadingAktif(false)
        }
    };

    return (
        <View className="flex-1 bg-slate-300">
            <View className='absolute w-full bg-[#205781] h-44 rounded-br-[50]  rounded-bl-[50]' />
            <View className='px-4'>
                <KeyboardAvoidingView behavior={keyboardBehavior} keyboardVerticalOffset={keyboardVerticalOffset}>
                    <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
                        {isLoadingAktif ? <SkeletonList loop={5} /> :
                            kendaraanAktif ?
                                (
                                    <>
                                        <View className="bg-[#F2E5BF] rounded-lg">
                                            <View className="items-center mb-3 py-2">
                                                <Text className="text-xl text-center text-teal-500 font-bold">Kendaraan Aktif</Text>
                                                <Text className="text-xl text-center font-bold">{dataAktif?.name}</Text>
                                                <View className="border border-b-2 w-full my-2" />

                                                <Text className="font-medium text-sm text-center">{dataAktif?.no_polisi}</Text>
                                                <View className=' bg-white rounded-lg p-1 w-full'>
                                                    <Text className='font-medium text-center'>
                                                        {dataAktif?.kegiatan}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                        <View className='px-4'>
                                            {
                                                checkpointAktif ?
                                                    <CheckpointScreen checkpoint_id={checkpointID} reservasi_id={dataAktif?.id} /> :
                                                    <PerjalananScreen items={dataAktif} />
                                            }
                                        </View>
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
                                )
                        }
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </View>
    );
}