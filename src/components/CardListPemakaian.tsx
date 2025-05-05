import React, { useState } from 'react';
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ButtonCostum from './ButtonCostum';
import dayjs from 'dayjs';
import { ModalRN } from './ModalRN';
import { colors } from '@/constants/colors';
import secureApi from '@/services/service';
import LoadingIndikator from './LoadingIndikator';

interface cardProps {
    props: any;
}

export default function CardListPemakaian({ props }: cardProps) {
    const [modalVisible, setModalVisible] = useState(false);
    const [imgBase64, setImgBase64] = useState<Base64URLString>();
    const [loading, setLoading] = useState(false);


    const handleModalImageShow = async (id: any, type: any) => {
        console.log('show image modal');

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
                setImgBase64(res.data.data);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
            setModalVisible(true)

        }

    }

    return (
        <>
      
            <View className='flex-row items-center bg-[#F2E5BF] justify-between px-4 rounded-t-lg'>
                <Text className={` text-black`}>
                    {dayjs(props.created_at).format("dddd ,DD MMMM YYYY")}
                </Text>
                <ButtonCostum classname='bg-black' title='Detail' />
            </View>
            <View className="bg-white p-4 rounded-b-lg shadow mb-2">

                <View className='items-center'>
                    <Text className={`text-2xl font-bold text-black`}>
                        {props.model}
                    </Text>
                    <Text className='text-secondary text-sm'>
                        {props.no_polisi}
                    </Text>
                </View>
                <Text className='font-medium text-lg text-center'>
                    {props.kegiatan}
                </Text>
                <View className='flex gap-2 justify-center mt-4'>
                    <TouchableOpacity onPress={() => handleModalImageShow(props.id, 'in')}>
                        <View className='flex-row items-center bg-blue-300 p-2 rounded-lg'>
                            <View className='w-1/4'>
                                <Text className='font-bold text-center text-2xl mx-5'>IN</Text>
                            </View>
                            <View>
                                <Text className="text-black ">{dayjs(props.reservasi_in).format("dddd ,DD MMMM YYYY")}</Text>
                                <Text className="text-black ">Jam {dayjs(props.reservasi_in).format("HH:mm")}</Text>
                                <Text className="text-black ">Spidometer {props.spidometer_in}</Text>
                            </View>

                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleModalImageShow(props.id, 'out')}>
                        <View className='flex-row items-center bg-amber-300 p-2 rounded-lg'>
                            <View className='w-1/4'>
                                <Text className='font-bold text-center text-2xl mx-5'>OUT</Text>
                            </View>

                            <View>
                                <Text className="text-black ">{dayjs(props.reservasi_out).format("dddd ,DD MMMM YYYY")}</Text>
                                <Text className="text-black ">Jam {dayjs(props.reservasi_out).format("HH:mm")}</Text>
                                <Text className="text-black ">Spidometer {props.spidometer_out}</Text>
                            </View>

                        </View>
                    </TouchableOpacity>
                </View>
            </View>
            {loading ? <LoadingIndikator/> : (
            <Modal
               animationType="fade"
               transparent={true}
               className='bg-black/50'
               visible={modalVisible}
               
               onRequestClose={() => {
                 setModalVisible(!modalVisible);
               }}>
                <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Image
                        className='w-96 h-96 mb-3 object-contain'
                        source={{
                            uri: imgBase64
                        }} />
                          <TouchableOpacity onPress={() => setModalVisible(false)}>
                        <Text className={`py-2 px-4 ${colors.warning} items-center rounded-lg text-white`}>Close</Text>
                    </TouchableOpacity>
                </View>
                </View>
            </Modal>
            )}
        </>
    );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    margin: 10,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});
