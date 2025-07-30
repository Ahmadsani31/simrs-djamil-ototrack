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

export default function InputDate({ label, value, onChangeDate, onResetDate, error }: InputProps) {
  const showMode = () => {
    DateTimePickerAndroid.open({
      value: new Date(),
      display: 'spinner',
      onChange,
      mode: 'date',
      is24Hour: true,
      maximumDate: new Date(),
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
      <Text className="mb-1 font-bold text-gray-700">{label}</Text>
      <Pressable className="rounded-lg bg-white" onPress={showMode}>
        <Fontisto className="absolute left-4 top-2.5 z-10" name="date" size={24} color={'black'} />
        <TextInput
          className={`border ${error ? 'border-red-500' : 'border-gray-500'} rounded-lg bg-gray-100 py-3 ps-14`}
          placeholder="Select Date"
          editable={false}
          value={value ? dayjs(value).format('dddd ,DD MMMM YYYY') : ''}
        />
        {value && (
          <TouchableOpacity onPress={onResetDate} className="absolute right-3 top-2.5">
            <Entypo name="circle-with-cross" size={28} color="black" />
          </TouchableOpacity>
        )}
      </Pressable>
      {error && <Text className="mt-1 text-xs text-red-500">{error}</Text>}
    </View>
  );
}
