import { Checkpoint } from '@/types/types';
import { BottomSheetSectionList } from '@gorhom/bottom-sheet';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { TextInput, Text, View, Image, Pressable } from 'react-native';
import ModalPreviewImage from './ModalPreviewImage';
import SkeletonList from './SkeletonList';
import { useQuery } from '@tanstack/react-query';
import secureApi from '@/services/service';

interface itemsProps {
    reservasiID: string
}

const fetchData = async (reservasi_id: string) => {
    try {
        const response = await secureApi.get(`/checkpoint/pemakaian`, {
            params: {
                reservasi_id: reservasi_id,
            },
        });
        return response.data
    } catch (error) {
        return []
    }

};

export default function ListDetailSectionSheet({ reservasiID }: itemsProps) {

    const { data, isLoading, isError, error, refetch } = useQuery<Checkpoint[]>({
        queryKey: ['dataReservasi', reservasiID],
        queryFn: async () => await fetchData(reservasiID),
        enabled: !!reservasiID
    })

    const [modalImageVisible, setModalImageVisible] = useState(false);
    const [urlImageModal, setUrlImageModale] = useState<string>('');

    const handleModalPrevieImage = (uri: any) => {
        setUrlImageModale(uri)
        setModalImageVisible(true)
    }


    const handleCloseModalPrevieImage = () => {
        setUrlImageModale('')
        setModalImageVisible(false)
    }

    return (
        <BottomSheetSectionList
            style={{ height: 300 }}
            sections={data || []}
            keyExtractor={(item, index) => index.toString()}
            stickySectionHeadersEnabled={true}
            contentContainerStyle={{ paddingBottom: 80 }}
            renderItem={({ item, index }) => (
                <View className='px-4'>
                    <View className="p-2 bg-slate-200 rounded-lg mb-3">
                        <View className='flex-row justify-between items-center'>
                            <Text>{index + 1}. Pengisiian BBM </Text>
                            <Text>{dayjs(item.created_at).format('dddd ,DD MMMM YYYY | HH:ss')}</Text>
                        </View>
                        <View className="flex-row ms-4">
                            <Text>{item.jenis}</Text>
                            <Text>{item.jenis == 'Voucher' ? ` : ${item.liter} Liter` : ` : Nominal Rp.${parseFloat(Number(item.uang).toFixed(2)).toLocaleString()}`}</Text>
                        </View>
                        <View className='p-4'>
                            <Image className='w-full aspect-[3/4] rounded-lg' source={{ uri: item.image }} />
                        </View>
                    </View>
                </View>

            )}
            renderSectionHeader={({ section: { checkpoint_in, image } }) => (
                <View className="mx-4 p-4 bg-[#F2E5BF] my-3 rounded-lg flex-row items-center justify-between">
                    <View>
                        <Text className='font-bold'>Proses Pengisian BBM,</Text>
                        <Text>{dayjs(checkpoint_in).format('dddd ,DD MMMM YYYY')}</Text>
                    </View>
                    <View className='p-4'>
                        <Pressable onPress={() => handleModalPrevieImage(image)}>
                            <Image className='size-32 rounded-lg' source={{ uri: image }} />
                            <Text className='absolute bg-white/75 p-1 rounded-md top-1/3 left-4'>Clik to show</Text>
                        </Pressable>
                    </View>
                    <ModalPreviewImage title='Gambar Proses Pengisian BBM' visible={modalImageVisible} imgUrl={urlImageModal} onPress={() => handleCloseModalPrevieImage()} />
                </View>
            )}

            ListEmptyComponent={
                isLoading ? <SkeletonList loop={10} /> : (
                    <View className="flex-1 justify-center items-center bg-white p-5 rounded-lg">
                        <Text>Tidak ada data pengambilan BBM</Text>
                    </View>
                )
            }
        />
    )
}
