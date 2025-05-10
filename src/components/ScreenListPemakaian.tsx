import React, { useEffect, useState } from 'react';
import { FlatList, Image, Pressable, RefreshControl, Text, TextInput, TouchableOpacity, View } from 'react-native';
import ButtonCostum from './ButtonCostum';
import dayjs from 'dayjs';
import { ModalRN } from './ModalRN';
import secureApi from '@/services/service';
import { useLoadingStore } from '@/stores/loadingStore';
import { useQuery } from '@tanstack/react-query';
import { DataKendaraan } from '@/types/types';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Fontisto } from '@expo/vector-icons';
import SkeletonList from './SkeletonList';

const fetchData = async (tanggal: any) => {

    const formattedDate = tanggal.toISOString().split('T')[0];

    try {
        const response = await secureApi.get(`reservasi/list`, {
            params: {
                tanggal: formattedDate,
            },
        });
        return response.data;
    } catch (error) {
        return [];
    }

};


interface cardProps {
    onPress: (value: any) => void
}

export default function ScreenListPemakaian({ onPress }: cardProps) {

    // useEffect(() => {
    //     refetch()
    // }, [])

    const [date, setDate] = useState(new Date);



    const { data, isLoading, isError, error, refetch } = useQuery<DataKendaraan[]>({
        queryKey: ['dataList', date],
        queryFn: () => fetchData(date),
        staleTime: 1000 * 60, // agar cache tetap fresh selama 1 menit
        enabled: !!date,
    })

    const [modalVisible, setModalVisible] = useState(false);
    const [imgBase64, setImgBase64] = useState<Base64URLString>();

    const setLoading = useLoadingStore((state) => state.setLoading);

    const handleModalImageShow = async (id: any, type: any) => {
        // console.log('show image modal');

        setLoading(true);
        try {
            const res = await secureApi.get(`/reservasi/image`, {
                params: {
                    id: id,
                    type: type,
                },
            });
            // console.log(res.data.data);

            if (res.status === true) {
                setImgBase64(res.data);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
            setModalVisible(true)

        }

    }


    const showMode = (currentMode: any) => {
        DateTimePickerAndroid.open({
            value: date,
            onChange,
            mode: currentMode,
            is24Hour: true,
        });
    };

    const onChange = (event: any, selectedDate: any) => {
        console.log(dayjs(selectedDate).format('dddd ,DD MMMM YYYY'));

        const currentDate = selectedDate;
        setDate(currentDate);
        // setInputDate(dayjs(selectedDate).format('dddd ,DD MMMM YYYY'));
        refetch()

    };

    // const toggleResetDate = () => {
    //     setInputDate('');
    //     refetch()
    // }

    const [refreshing, setRefreshing] = useState(false);
    const onRefresh = () => {
        refetch()
        setInterval(() => {
            setRefreshing(false);

        }, 1000);
    };

    const handleCloseModal = () => {

    }


    if (isLoading) {
        return <SkeletonList loop={8} />
    }

    return (
        <>
            <FlatList
                data={data}
                keyExtractor={(item) => item.id.toString()}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['grey']}
                        progressBackgroundColor={'black'} />
                }
                stickyHeaderIndices={[0]}
                contentContainerStyle={{ paddingBottom: 200 }}
                ListHeaderComponent={
                    <Pressable className='p-2 bg-white mb-2 rounded-lg' onPress={showMode}>
                        <Fontisto className='absolute z-10 left-6 top-5' name="date" size={24} color={'black'} />
                        <TextInput className='border border-gray-300 rounded-md bg-gray-100 py-4 ps-14'
                            placeholder="Select Date"
                            editable={false}
                            value={dayjs(date).format('dddd ,DD MMMM YYYY')}
                        />
                        {/* {date && <Entypo className='absolute right-5 top-5' name='circle-with-cross' size={28} color={'black'} onPress={toggleResetDate} />} */}
                    </Pressable>
                }
                renderItem={({ item }) => (
                    <>
                        <View className='flex-row items-center bg-[#F2E5BF] justify-between px-4 rounded-t-lg'>
                            <Text className={` text-black`}>
                                {dayjs(item.created_at).format("dddd ,DD MMMM YYYY | HH:ss")}
                            </Text>
                            <ButtonCostum classname='bg-black' title='Detail' onPress={() => onPress(item.id)} />
                        </View>
                        <View className="bg-white p-4 rounded-b-lg shadow mb-2">
                            <View className='items-center'>
                                <Text className={`text-xl font-bold text-black`}>
                                    {item.model}
                                </Text>
                                <Text className='text-secondary text-sm'>
                                    {item.no_polisi}
                                </Text>
                            </View>
                            <View className='mt-2 bg-slate-200 rounded-lg p-1'>
                                <Text className='font-medium text-center'>
                                    {item.kegiatan}
                                </Text>
                            </View>
                            <View className='mt-2 bg-slate-200 rounded-lg p-1 flex-row justify-around items-center'>
                                <View className='items-center'>
                                    <Text>Total Perjalanan</Text>
                                    <Text className='font-bold'>{item.total_spidometer} Km</Text>
                                </View>
                                <View className='items-center'>
                                    <Text>Lama Perjalanan</Text>
                                    <Text className='font-bold'>{item.selisih_waktu} Menit</Text>
                                </View>
                            </View>
                            <View className='flex gap-2 justify-center mt-2'>
                                <TouchableOpacity onPress={() => handleModalImageShow(item.id, 'in')}>
                                    <View className='flex-row items-center bg-blue-300 p-2 rounded-lg'>
                                        <View className='w-1/3'>
                                            <Text className='font-bold text-center text-2xl mx-5'>Pergi</Text>
                                        </View>
                                        <View>
                                            <Text className="text-black font-bold">{dayjs(item.reservasi_in).format("dddd ,DD MMMM YYYY")}</Text>
                                            <Text className="text-black ">Jam {dayjs(item.reservasi_in).format("HH:mm")}</Text>
                                            <Text className="text-black ">Spidometer {item.spidometer_in}</Text>
                                        </View>

                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleModalImageShow(item.id, 'out')}>
                                    <View className='flex-row items-center bg-amber-300 p-2 rounded-lg'>
                                        <View className='w-1/3'>
                                            <Text className='font-bold text-center text-2xl mx-5'>Pulang</Text>
                                        </View>

                                        <View>
                                            <Text className="text-black font-bold">{dayjs(item.reservasi_out).format("dddd ,DD MMMM YYYY")}</Text>
                                            <Text className="text-black ">Jam {dayjs(item.reservasi_out).format("HH:mm")}</Text>
                                            <Text className="text-black ">Spidometer {item.spidometer_out}</Text>
                                        </View>

                                    </View>
                                </TouchableOpacity>

                            </View>
                        </View>
                    </>
                )}
                ListEmptyComponent={
                    <View className="flex-1 justify-center items-center bg-white p-5 rounded-lg">
                        <Text>Belum ada pemakaian kendaraan</Text>
                    </View>
                }
            />

            <ModalRN
                visible={modalVisible}
                onClose={() => {
                    setModalVisible(!modalVisible);
                }}>
                <ModalRN.Header>
                    <Text>Tampil gambar spidometer</Text>
                </ModalRN.Header>
                <ModalRN.Content>
                    <Image
                        className='w-full aspect-[3/4] rounded-lg'
                        source={{
                            uri: imgBase64
                        }} />
                </ModalRN.Content>
                <ModalRN.Footer>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>

                        <Text className={`py-2 px-4 bg-red-500 items-center rounded-lg text-white`}>Close</Text>
                    </TouchableOpacity>
                </ModalRN.Footer>
            </ModalRN>
        </>
    );
}
