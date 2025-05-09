import secureApi from '@/services/service';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { TextInput, Text, View, ScrollView } from 'react-native';
import SkeletonList from './SkeletonList';

const fetchData = async (reservasi_id: string) => {
    const response = await secureApi.get(`/checkpoint/reservasi`, {
        params: {
            id: reservasi_id,
        },
    });
    return response.data
};

interface Checkpoint {
    id: string;
    image: string;
    checkpoint_in: string;
    created_at: string;
    bbm: CheckpointBBM[];
}

interface CheckpointBBM {
    id: string;
    jenis: string;
    uang?: string;
    liter?: string;
    image: string;
    created_at: string;
}


export default function DetailListScreen({ selectedID }: any) {

    const [row, setRow] = useState<Checkpoint[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        fetchData(selectedID)
    }, [selectedID]);

    const fetchData = async (reservasi_id: string) => {
        setIsLoading(true)
        try {
            const response = await secureApi.get(`/checkpoint/reservasi`, {
                params: {
                    id: reservasi_id,
                },
            });
            if (response.status === true) {
                const data = response.data
                setRow(data)
            }
        } catch (error) {
            setRow([])
        } finally {
            setIsLoading(false)
        }

    };


    if (isLoading) {
        return (
            <View className='flex-1 bg-white w-full'>
                <SkeletonList loop={10} />
            </View>
        )
    }
    if (row.length == 0) {
        return (
            <View className='flex-1 bg-white w-full'>
                <View className="flex-1 justify-center items-center bg-white p-5 rounded-lg">
                    <Text>Belum ada pemakaian kendaraan</Text>
                </View>
            </View>
        )
    }

    return (
        <View className='flex-1 bg-white w-full'>

            <BottomSheetFlatList
                style={{ width: '100%', flex: 1, height: '100%' }}
                data={row}
                keyExtractor={(item, i) => i.toString()}
                renderItem={({ item, index }) => (
                    <View className='p-4'>
                        <View className='flex-row justify-between bg-slate-200 p-2'>
                            <Text>{index + 1}. Proses Pengisian BBM,</Text>
                            <Text>{dayjs(item.created_at).format("dddd ,DD MMMM YYYY")}</Text>
                        </View>
                    </View>

                )}
                contentContainerStyle={styles.contentContainer}
            />
        </View>

    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 200,
    },
    contentContainer: {
        backgroundColor: "white",
    },
    itemContainer: {
        padding: 6,
        margin: 6,
        backgroundColor: "#eee",
    },
});