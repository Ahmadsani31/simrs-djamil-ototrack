import React, { useEffect, useState } from 'react';
import { TextInput, Text, View, ScrollView, FlatList, Image, TouchableOpacity } from 'react-native';
import ButtonCostum from './ButtonCostum';
import { colors } from '@/constants/colors';
import { useLoadingStore } from '@/stores/loadingStore';
import secureApi from '@/services/service';
import { ModalRN } from './ModalRN';
import ModalCamera from './ModalCamera';
import { AntDesign } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

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
};

export default function CheckpointScreen({ reservasiID }: Props) {

    const setLoading = useLoadingStore((state) => state.setLoading);

    const [dialogCamera, setDialogCamera] = useState(false);
    const [dialogExit, setDialogExit] = useState(false);

    const [uri, setUri] = useState<string | null>(null);

    const [row, setRow] = useState<Checkpoint[]>([])

    useEffect(() => {
        fetchPengisianBBM();
    }, []);

    const fetchPengisianBBM = async () => {
        setLoading(true);
        try {
            const res = await secureApi.get(`checkpoint/bbm`, {
                params: {
                    reservasi_id: reservasiID,
                },
            });

            console.log('res data aktif ', res.data);

            if (res.status === true) {
                setRow(res.data)
            }
        } catch (error: any) {
            // console.error("Error fetching data:", error);
            console.log("Error /checkpoint/list ", JSON.stringify(error.response?.data?.message));
            setRow([])
        } finally {
            setLoading(false);
        }
    };


    const handleDialogExit = () => {
        setDialogExit(false);
        setUri(null)
    }

    const [selectedLanguage, setSelectedLanguage] = useState();

    return (
        <>
            <View className='px-4'>
                <FlatList
                    data={row}
                    keyExtractor={(row) => row.id.toString()}
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
                    <Picker
                        selectedValue={selectedLanguage}
                        onValueChange={(itemValue, itemIndex) =>
                            setSelectedLanguage(itemValue)
                        }>
                        <Picker.Item label="Java" value="java" />
                        <Picker.Item label="JavaScript" value="js" />
                    </Picker>
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
                        {uri && <ButtonCostum classname={colors.primary} title="Submit" />}

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