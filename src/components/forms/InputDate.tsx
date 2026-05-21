import DateTimePicker from '@expo/ui/datetimepicker';
import { Entypo, Fontisto } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { TextInput, Text, View, Pressable, TouchableOpacity } from 'react-native';

import { useDatePicker } from '@/hooks/useDatePicker';

interface InputProps {
  label?: string;
  /** Date value or ISO/locale string. Anything `dayjs` can parse. */
  value?: Date | string;
  /** Called with the picked Date. Caller decides whether to keep it as Date or format. */
  onChangeDate: (date: Date) => void;
  onResetDate: () => void;
  error?: string;
}

export default function InputDate({ label, value, onChangeDate, onResetDate, error }: InputProps) {
  const picker = useDatePicker({ maximumDate: new Date() });

  return (
    <View className="mb-4">
      <Text className="mb-1 font-bold text-gray-700">{label}</Text>
      <Pressable
        className="rounded-lg bg-white"
        onPress={() => picker.openWithCallback('date', onChangeDate)}>
        <Fontisto className="absolute left-4 top-2.5 z-10" name="date" size={24} color="black" />
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
      {picker.visible && (
        <DateTimePicker
          value={picker.value}
          mode={picker.mode}
          presentation="dialog"
          display="default"
          is24Hour
          maximumDate={new Date()}
          onValueChange={picker.handleChange}
          onDismiss={picker.dismiss}
        />
      )}
    </View>
  );
}
