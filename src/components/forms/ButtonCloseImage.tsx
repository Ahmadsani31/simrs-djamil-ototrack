import { AntDesign } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

export default function ButtonCloseImage({
  onPress,
  loading,
}: {
  onPress: () => void;
  loading: boolean;
}) {
  return (
    <TouchableOpacity
      className="absolute right-1 top-1 rounded-full bg-white p-1"
      disabled={loading}
      onPress={onPress}>
      <AntDesign name="close-circle" size={24} color="red" />
    </TouchableOpacity>
  );
}
