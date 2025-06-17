import { TextInput, Text, View, Pressable, TouchableOpacity } from 'react-native';
import { Entypo, Fontisto } from '@expo/vector-icons';
import { DateTimePickerAndroid, DateTimePickerEvent } from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';

interface InputProps {
    label?: string;
    value?: string;
    onChangeDate: (text: string) => void;
    onResetDate: () => void;
    error?: string;
}

export default function InputDate({
    label,
    value,
    onChangeDate,
    onResetDate,
    error,
}: InputProps) {

    const showMode = () => {
        DateTimePickerAndroid.open({
            value: new Date(),
            display: 'spinner',
            onChange,
            mode: 'date',
            is24Hour: true,
            maximumDate: new Date()
        });


    };

    const onChange = (event: any, selectedDate: any) => {
        if (event.type == 'set') {
            onChangeDate(selectedDate);

        }
        // console.log(dayjs(selectedDate).format('dddd ,DD MMMM YYYY'));
    };



    return (
        <View className="mb-4">
            <Text className="text-gray-700 mb-1 font-bold">{label}</Text>
            <Pressable className='bg-white rounded-lg' onPress={showMode}>
                <Fontisto className='absolute z-10 left-4 top-2.5' name="date" size={24} color={'black'} />
                <TextInput className='border border-gray-500 rounded-md bg-gray-200 py-3 ps-14'
                    placeholder="Select Date"
                    editable={false}
                    value={value ? dayjs(value).format('dddd ,DD MMMM YYYY') : ''}
                />
                {value && (
                    <TouchableOpacity onPress={onResetDate} className='absolute top-2.5 right-3'>
                        <Entypo name="circle-with-cross" size={28} color="black" />
                    </TouchableOpacity>
                )}

            </Pressable>
            {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}
        </View>
    )
}
