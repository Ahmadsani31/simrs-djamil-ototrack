import React, { useEffect, useState } from 'react';
import { TextInput, Text, View, ScrollView, FlatList, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import ButtonCostum from './ButtonCostum';
import { colors } from '@/constants/colors';
import { useLoadingStore } from '@/stores/loadingStore';
import secureApi from '@/services/service';
import { ModalRN } from './ModalRN';
import ModalCamera from './ModalCamera';
import { AntDesign } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import SelectDropdown from 'react-native-select-dropdown'
import Input from './Input';
import { reLocation } from '@/hooks/locationRequired';
import { router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface Checkpoint {
    id: number;
    checkpoint_name: string;
    created_at: string;
    data: Bbm[];
}

interface Bbm {
    id: number;
    reservasi_id: string;
    checkpoint_id: string;
    checkpoint_name: string;
    jenis: string;
    uang: string;
    liter: string;
    image: string;
    created_at: string;
}

type Props = {
    reservasiID: string;
    checkpointID: string;
};

const fetchPengisianBBM = async (reservasi_id: string) => {
    const response = await secureApi.get(`checkpoint/bbm`, {
        params: {
            reservasi_id: reservasi_id,
        },
    });

    return response.data

};

export default function CheckpointScreen({ reservasiID, checkpointID }: Props) {

    const queryClient = useQueryClient()

    const setLoading = useLoadingStore((state) => state.setLoading);

    const [dialogCamera, setDialogCamera] = useState(false);

    const [dialogExit, setDialogExit] = useState(false);

    const [jenis, setJenis] = useState("");

    const [liter, setLiter] = useState<string>("");
    const [uang, setUang] = useState<string>("");


    const [errors, setErrors] = useState({ jenis: '', liter: '', uang: '', img: '' });


    const [uangActive, setUangActive] = useState<boolean>(false);
    const [selectedId, setSelectedId] = useState<string>("");

    const [uri, setUri] = useState<string | null>(null);

    const [row, setRow] = useState<Checkpoint[]>([])

    useEffect(() => {
        // fetchPengisianBBM();
    }, []);


    const { data: dataBbm, isLoading: loadingBbm, error: erroBbm, } = useQuery({
        queryKey: ['dataBbm'],
        queryFn:()=> fetchPengisianBBM(reservasiID),
        enabled:!!reservasiID
    });

    // const fetchPengisianBBM = async () => {
    //     setLoading(true);
    //     try {
    //         const res = await secureApi.get(`checkpoint/bbm`, {
    //             params: {
    //                 reservasi_id: reservasiID,
    //             },
    //         });

    //         console.log('res data aktif ', res.data);

    //         if (res.status === true) {
    //             setRow(res.data)
    //         }
    //     } catch (error: any) {
    //         // console.error("Error fetching data:", error);
    //         console.log("Error /checkpoint/list ", JSON.stringify(error.response?.data?.message));
    //         setRow([])
    //     } finally {
    //         setLoading(false);
    //     }
    // };


    const handleDialogExit = () => {
        setDialogExit(false);
        setUri(null)
        setJenis("")
    }


    const Pengisian = [
        'Voucher',
        'Uang',

    ];

    const submitPengisiianBBM = async () => {

        if (!validateForm()) return;

        const coordinate = await reLocation.getCoordinate()

        if (!coordinate?.lat && coordinate?.long) {
            Alert.alert('Peringatan!', 'Error device location', [
                { text: 'Tutup', onPress: () => null },
            ]);
            return
        }


        const formData = new FormData();

        formData.append('reservasi_id', reservasiID);
        formData.append('checkpoint_id', checkpointID);
        formData.append('latitude', coordinate?.lat?.toString() || '');
        formData.append('longitude', coordinate?.long.toString() || '');
        formData.append('jenis', jenis);
        formData.append('uang', uang);
        formData.append('liter', liter);
        formData.append('fileImage', {
            uri: uri,
            name: 'bon-capture.jpg',
            type: 'image/jpeg',
        } as any);

        try {
            const response = await secureApi.postForm(`/checkpoint/save_fuel`, formData)
            if (response.status === true) {
                router.reload();
                setUri(null)
            }
        } catch (error: any) {

            console.log('response checkpoint', JSON.stringify(error.response.data));
        } finally {
            setLoading(false);
        }


    }

    const validateForm = () => {
        const newErrors = { jenis: '', liter: '', uang: '', img: '' };
        let isValid = true;

        if (!jenis) {
            newErrors.jenis = 'Jenis wajib diisi';
            isValid = false;
        }

        if (selectedId === 'Voucher') {
            if (!liter) {
                newErrors.liter = 'Liter wajib diisi';
                isValid = false;
            }
        } else {
            if (!uang) {
                newErrors.uang = 'Nominal wajib diisi';
                isValid = false;
            }
        }

        if (!uri) {
            newErrors.img = 'Image';
            isValid = false;
        }

        setErrors(newErrors);

        return isValid;
    };


    return (
        <>
            <View className='px-4'>
                <FlatList
                    data={dataBbm}
                    keyExtractor={(items,index) => index.toString()}
                    stickyHeaderIndices={[0]}
                    ListHeaderComponent={
                        <>
                            <View className="p-4 mb-3 bg-white rounded-lg">
                                <Text className='text-center font-bold text-2xl'>Checkpoint Aktif</Text>
                                <View className="border border-b-2 w-full my-4" />
                                <ButtonCostum classname={colors.secondary} title="Keluar Checkpoint" />
                                <ButtonCostum classname={colors.primary} onPress={() => setDialogExit(true)} title="Isi BBM" />
                            </View>
                            <View className="flex-1  mb-3 justify-center bg-[#F2E5BF] p-2 rounded-lg">
                                <Text>Log Pengisiian BBM</Text>
                            </View>
                        </>
                    }
                    renderItem={CheckpointItem}
                    ListEmptyComponent={
                        <View className="flex-1 justify-center items-center bg-white p-5 rounded-lg">
                            <Text>Belum ada pemakaian kendaraan</Text>
                        </View>
                    }
                />
            </View>
            <ModalRN
                visible={dialogExit}
                onClose={handleDialogExit}
            >
                <ModalRN.Header>
                    <Text className='font-bold text-center'>Proses Pengisian BBM Kendaraan</Text>
                    <Text className="text-center">Silahkan foto kondisi terkini saat melakukan proses pengisian BBM
                        Kendaraan</Text>
                </ModalRN.Header>
                <ModalRN.Content>
                    <View>
                        {errors.jenis && <Text className='text-red-500'>Jenis Required</Text>}
                        {errors.img && <Text className='text-red-500'>Img Required</Text>}
                    </View>
                    <View className='mb-3'>
                        <SelectDropdown
                            data={Pengisian}
                            onSelect={(selectedItem, index) => {
                                setJenis(selectedItem);
                            }}
                            // defaultValueByIndex={8} // use default value by index or default value
                            // defaultValue={'kiss'} // use default value by index or default value
                            renderButton={(selectedItem, isOpen) => {
                                return (
                                    <View className='flex-row items-center justify-center border border-gray-300 rounded-lg p-3 bg-gray-300'>
                                        <Text>{selectedItem || 'Pilih Jenis Pengisian'}</Text>
                                    </View>
                                );
                            }}
                            renderItem={(item, index, isSelected) => {
                                return (
                                    <View
                                        style={{
                                            ...styles.dropdownItemStyle,
                                            ...(isSelected && { backgroundColor: '#D2D9DF' }),
                                        }}>
                                        <Text style={styles.dropdownItemTxtStyle}>{item}</Text>
                                    </View>
                                );
                            }}
                            dropdownStyle={styles.dropdownMenuStyle}
                        />
                    </View>
                    {jenis === 'Voucher' ? <Input
                        label="Liter"
                        placeholder="Liter"
                        value={liter}
                        inputMode={'numeric'}
                        error={errors.uang && 'Jumlah voucher required'}
                        onChangeText={setLiter}
                        className='bg-gray-200'
                    /> : null}
                    {jenis === 'Uang' ? <Input
                        label="Nominal"
                        placeholder="Nominal"
                        value={uang}
                        inputMode={'numeric'}
                        error={errors.uang && 'Nominal uang required'}
                        onChangeText={setUang}
                        className='bg-gray-200'
                    /> : null}

                    {!uri ? (
                        <TouchableOpacity className="py-1 px-3 my-3 rounded-lg items-center justify-center flex-row bg-indigo-500" onPress={() => setDialogCamera(true)}>
                            <AntDesign name="camera" size={32} />
                            <Text className="font-bold text-white ms-2">Open Camera</Text>
                        </TouchableOpacity>
                    ) : (
                        <View className="w-full rounded-lg bg-black">
                            <Image
                                source={{ uri: uri || undefined }}
                                className='w-full aspect-[3/4] rounded-lg'
                            />
                            <TouchableOpacity className="absolute right-2 top-2" onPress={() => setUri(null)}>
                                <AntDesign name="closecircleo" size={32} color="red" />
                            </TouchableOpacity>
                        </View>
                    )}
                </ModalRN.Content>
                <ModalRN.Footer>
                    <View className="gap-2 flex-row">
                        <ButtonCostum classname={colors.warning} title="Exit" onPress={handleDialogExit} />
                        {uri && <ButtonCostum classname={colors.primary} title="Submit" onPress={submitPengisiianBBM} />}

                    </View>
                </ModalRN.Footer>
            </ModalRN>
            <ModalCamera visible={dialogCamera} onClose={() => setDialogCamera(false)} setUriImage={(e) => setUri(e)} />

        </>
    )
}


const CheckpointItem = ({ item }: { item: Checkpoint }) => {
    return (
        <View className="p-4 my-2 bg-white rounded-lg">
            <View className="flex-1 flex-row w-full items-center">
                <View>
                </View>
                <View className="ms-2 w-full">
                    <Text className="font-bold text-xl">{item.checkpoint_name}</Text>
                    <View className="border border-b-2 w-72" />
                    <Text>Nomor Polisi : {item.id}</Text>
                    <Text>Kondisi : {item.id}</Text>
                </View>
                {item?.data.length > 0 ?

                    item.data.map((itm, i) => (
                        <View key={i}>
                            <Text>{i + 1}. Pengisiian BBM</Text>
                        </View>
                    ))
                    :
                    (
                        <View>
                            <Text>Kosong</Text>
                        </View>
                    )
                }
            </View>

        </View>

    );
};

const styles = StyleSheet.create({

    dropdownMenuStyle: {
        backgroundColor: '#E9ECEF',
        borderRadius: 8,
    },
    dropdownItemStyle: {
        width: '100%',
        flexDirection: 'row',
        paddingHorizontal: 12,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#B1BDC8',
    },
    dropdownItemTxtStyle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '500',
        color: '#151E26',
        textAlign: 'center',
    },
    dropdownItemIconStyle: {
        fontSize: 28,
        marginRight: 8,
    },
    ////////////// dropdown1
});