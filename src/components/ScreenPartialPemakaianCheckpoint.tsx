import { Alert, Image, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View } from "react-native";
import { useState } from "react";
import ButtonCostum from "@/components/ButtonCostum";

import { colors } from "@/constants/colors";
import { ModalRN } from "@/components/ModalRN";
import { AntDesign, Entypo, MaterialCommunityIcons } from '@expo/vector-icons';
import ModalCamera from "@/components/ModalCamera";
import { reLocation } from "@/hooks/locationRequired";
import secureApi from "@/services/service";
import SkeletonList from "@/components/SkeletonList";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import SelectDropdown from "react-native-select-dropdown";
import Input from "@/components/Input";
import dayjs from "dayjs";
import { Checkpoint } from "@/types/types";
import CustomNumberInput from "./CustomNumberInput";
import ModalPreviewImage from "./ModalPreviewImage";

const fetchData = async (reservasi_id: string, checkpoint_id: string) => {
    try {
        const response = await secureApi.get(`/checkpoint/pemakaian`, {
            params: {
                reservasi_id: reservasi_id,
                checkpoint_id: checkpoint_id
            },
        });
        return response.data
    } catch (error) {
        return []
    }

};


export default function ScreenPartialPemakaianCheckpoint({ checkpoint_id, reservasi_id, reload }: any) {

    const { data: dataBbm, isLoading, isError, error, refetch } = useQuery<Checkpoint[]>({
        queryKey: ['dataBbm', reservasi_id, checkpoint_id],
        queryFn: async () => await fetchData(reservasi_id, checkpoint_id),
        enabled: !!checkpoint_id
    })

    const DataDropwdown = [
        'Voucher',
        'Uang',
    ];

    // console.log(JSON.stringify(bbm));

    const [dialogCamera, setDialogCamera] = useState(false);
    const [loading, setLoading] = useState(false);
    const [dialogBbm, setDialogBbm] = useState(false);
    const [dialogExit, setDialogExit] = useState(false);

    const [jenis, setJenis] = useState('');
    const [liter, setLiter] = useState('');
    const [uang, setUang] = useState('');
    const [titleModalImage, setTitleModalImage] = useState('');

    const [uri, setUri] = useState<string | null>(null);

    const handleExitCheckpoint = async () => {
        console.log('exit');

        setLoading(true)
        const coordinate = await reLocation.getCoordinate()

        if (!coordinate?.lat && coordinate?.long) {
            Alert.alert('Peringatan!', 'Error device location', [
                { text: 'Tutup', onPress: () => null },
            ]);
            return
        }

        const formData = new FormData();

        formData.append('checkpoint_id', checkpoint_id);
        formData.append('latitude', coordinate?.lat?.toString() || '');
        formData.append('longitude', coordinate?.long.toString() || '');

        try {
            await secureApi.postForm(`/checkpoint/exit`, formData)
            setDialogExit(false)
            reload()
        } catch (error: any) {
            console.log('error exit ', JSON.stringify(error.response.data.message));

            Alert.alert('Perhatian!', error.response.data.message, [
                { text: 'Tutup', onPress: () => null },
            ]);
        } finally {
            setLoading(false)
        }

    }

    const handleDialogBBM = () => {
        setDialogBbm(false);
        setUri('')
        setJenis('')
        setLiter('')
        setUang('')
    }

    const handleSubmitProsesBBM = async () => {
        setLoading(true)
        const coordinate = await reLocation.getCoordinate()

        if (!coordinate?.lat && coordinate?.long) {
            Alert.alert('Peringatan!', 'Error device location', [
                { text: 'Tutup', onPress: () => null },
            ]);
            return
        }

        const formData = new FormData();

        formData.append('latitude', coordinate?.lat?.toString() || '');
        formData.append('longitude', coordinate?.long.toString() || '');
        formData.append('checkpoint_id', checkpoint_id);
        formData.append('reservasi_id', reservasi_id);
        formData.append('jenis', jenis);
        formData.append('uang', uang);
        formData.append('liter', liter);
        formData.append('fileImage', {
            uri: uri,
            name: 'spidometer-capture.jpg',
            type: 'image/jpeg',
        } as any);

        // console.log('formData', formData);

        try {
            const response = await secureApi.postForm('/checkpoint/save_fuel', formData)
            if (response.status == true) {
                handleDialogBBM()
            }
            refetch();
        } catch (error: any) {
            console.log('response checkpoint', JSON.stringify(error.response.data));
            Alert.alert('Warning!', error.response.data.message, [
                { text: 'Tutup', onPress: () => null },
            ]);

        } finally {
            setLoading(false)
        }

    }

    const [modalVisible, setModalVisible] = useState(false);
    const [imgUrl, setImgUrl] = useState<string>();

    const handleShowImage = (url: string, title: string) => {
        setTitleModalImage(title)
        setImgUrl(url)
        setModalVisible(true)

    }

    const handleCloseImage = () => {
        setModalVisible(false)
        setImgUrl('')
    }

    return (
        <>
            <View className="p-4 bg-white rounded-lg">
                <View className="my-4">
                    <Text className="text-center bg-red-400 rounded-lg font-medium text-lg">Dalam Proses Pengisian BBM</Text>
                </View>
                <TouchableOpacity className={`flex-row gap-2 p-3 my-2 rounded-lg justify-center items-center bg-indigo-500`} onPress={() => setDialogBbm(true)} >
                    <MaterialCommunityIcons name='gas-station' size={22} color='white' />
                    <Text className='text-white font-bold'>Pengisiaan BBM</Text>
                </TouchableOpacity>
                <TouchableOpacity className={`flex-row gap-2 p-3 my-2 rounded-lg justify-center items-center ${colors.warning}`} onPress={() => setDialogExit(true)}>
                    <Text className='text-white font-bold'>Keluar Dari Proses Pengisian BBM</Text>
                    <MaterialCommunityIcons name='exit-to-app' size={22} color='white' />
                </TouchableOpacity>
            </View>
            <Text className="font-bold mx-2 my-3">Log Pengisian BBM</Text>
            {isLoading && <SkeletonList loop={5} />}
            {dataBbm?.map((item) => item.data.length > 0 ?
                (
                    <View key={item.id} className="p-4 bg-[#F2E5BF] mb-2 rounded-lg">
                        <View className="flex-row rounded-lg mb-1 justify-between items-center">
                            <View>
                                <Text className="font-bold">{item.checkpoint_name}</Text>
                                <Text>{dayjs(item.checkpoint_in).format('dddd ,DD MMMM YYYY')}</Text>
                                <Text>Jam : {dayjs(item.checkpoint_in).format('HH:ss')}</Text>
                            </View>
                            <TouchableHighlight onPress={() => handleShowImage(item.image, 'Foto proses pengisian BBM')} className='p-1 bg-gray-300 rounded-lg '>
                                <View className='flex-row items-center justify-center'>
                                    <Entypo name="images" size={24} color="black" />
                                    <Text className='ms-2 text-center'>gambar pengisian</Text>
                                </View>
                            </TouchableHighlight>
                        </View>
                        {item.data.map((itx, ii) => (
                            <View className="p-4 gap-2 bg-white rounded-lg mb-3" key={itx.id}>
                                <View className="flex-row">
                                    <Text className="font-bold">Dengan {itx.jenis}</Text>
                                    <Text>{itx.jenis == 'Voucher' ? ` : ${itx.liter} Liter` : ` : Nominal Rp.${parseFloat(Number(itx.uang).toFixed(2)).toLocaleString()}`}</Text>
                                </View>
                                <View>
                                    <TouchableHighlight onPress={() => handleShowImage(itx.image, 'Foto Bon / Struck pembelian BBM')} className='p-1 bg-gray-300 rounded-lg '>
                                        <View className='flex-row items-center'>
                                            <Entypo name="images" size={24} color="black" />
                                            <Text className='ms-2 text-center'>gambar struk / bon</Text>
                                        </View>
                                    </TouchableHighlight>
                                </View>
                            </View>
                        ))}
                    </View>
                )
                : (
                    <View key={item.id} className="p-4 bg-white mb-2 rounded-lg justify-between items-center">
                        <Text className="text-center ">-----</Text>
                    </View>
                ))}

            <ModalRN
                visible={dialogExit}
                onClose={() => setDialogExit(false)}
            >
                <ModalRN.Header>
                    <Text className='font-bold text-2xl text-center'>Perhatian!</Text>
                </ModalRN.Header>
                <ModalRN.Content>
                    <Text>Apakah kamu yakin ingin keluar dari proses pengisian BBM?</Text>
                </ModalRN.Content>
                <ModalRN.Footer>
                    <View className="gap-2 flex-row">
                        <ButtonCostum classname={colors.warning} title="Batal" loading={loading} onPress={() => setDialogExit(false)} />
                        <ButtonCostum classname="bg-red-500" title="Keluar" loading={loading} onPress={handleExitCheckpoint} />
                    </View>
                </ModalRN.Footer>
            </ModalRN>
            <ModalRN
                visible={dialogBbm}
                onClose={handleDialogBBM}
            >
                <ModalRN.Header>
                    <Text className='font-bold text-xl text-center'>Pengisian BBM Kendaraan</Text>
                    <Text className="text-center">Silahkan foto struck atau bon pembelian BBM Kendaraan sebagai bukti
                    </Text>
                </ModalRN.Header>
                <ModalRN.Content>
                    <View className="my-3">
                        <SelectDropdown
                            data={DataDropwdown}
                            defaultValue={jenis}
                            onSelect={(selectedItem, index) => {
                                setJenis(selectedItem);
                            }}
                            renderButton={(selectedItem, isOpen) => {
                                return (
                                    <View className="items-center justify-center bg-gray-200 border border-gray-300 py-3 rounded-lg">
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
                                        <Text>{item}</Text>
                                    </View>
                                );
                            }}
                            dropdownStyle={styles.dropdownMenuStyle}
                        />
                    </View>
                    {jenis === 'Voucher' && (
                        <Input
                            className="bg-gray-50"
                            label="Liter"
                            placeholder="Liter"
                            inputMode={'numeric'}
                            value={liter || ''}
                            onChangeText={setLiter}
                        />
                    )}
                    {jenis === 'Uang' && (
                        <CustomNumberInput
                            className="bg-gray-50"
                            placeholder="Masukan nominal"
                            label="Uang"
                            onFormattedValue={(raw, formatted) => {
                                setUang(raw)
                                // console.log('Raw:', raw);
                                // console.log('Formatted:', formatted);
                            }}
                        />
                    )}
                    {!uri ? (
                        <>
                            <TouchableOpacity className="p-2 my-2 rounded-lg items-center justify-center flex-row bg-indigo-500" onPress={() => setDialogCamera(true)}>
                                <AntDesign name="camera" size={28} />
                                <Text className="font-bold text-white ms-2">Foto struk pengisian BBM</Text>
                            </TouchableOpacity>
                        </>
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
                        <ButtonCostum classname={colors.warning} title="Exit" loading={loading} onPress={handleDialogBBM} />
                        {uri && <ButtonCostum classname={colors.primary} title="Submit" loading={loading} onPress={handleSubmitProsesBBM} />}

                    </View>
                </ModalRN.Footer>
            </ModalRN>
            <ModalPreviewImage title={titleModalImage} imgUrl={imgUrl || ''} visible={modalVisible} onPress={() => handleCloseImage()} />
            <ModalCamera visible={dialogCamera} onClose={() => setDialogCamera(false)} setUriImage={(e) => setUri(e)} />
        </>
    );
}

const styles = StyleSheet.create({

    dropdownMenuStyle: {
        backgroundColor: '#eee',
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
    }
});