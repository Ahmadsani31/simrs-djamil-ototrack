import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native'

export default function DialogHasilScanQRCode({ visible }: { visible: boolean }) {
    const [isModalVisible, setModalVisible] = useState(visible);
    return (
        <View>
            <Modal
                animationType="fade"
                visible={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 bg-black/50 justify-center items-center">
                    <View className="bg-white p-6 rounded-2xl w-11/12 max-w-md">
                        <Text className="text-lg mb-4">This is a modal!</Text>
                        <TouchableOpacity className={`flex-row gap-2 p-3 my-2 rounded-lg justify-center items-center bg-teal-500`} onPress={() => router.push({
                            pathname: 'detail',
                            params: {
                                uuid: 'ce87741a-f197-4dc4-ac42-0a368ced8a0a',
                            }
                        })}>
                            <Text className='text-white font-bold'>Aktifitas Harian</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className={`flex-row gap-2 p-3 my-2 rounded-lg justify-center items-center bg-teal-500`} onPress={() => router.push({
                            pathname: 'detail',
                            params: {
                                uuid: 'ce87741a-f197-4dc4-ac42-0a368ced8a0a',
                            }
                        })}>
                            <Text className='text-white font-bold'>Aktifitas Harian</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setModalVisible(false)} className="mt-2">
                            <Text className="text-blue-600">Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    )
}