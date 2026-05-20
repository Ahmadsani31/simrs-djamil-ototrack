import { Feather } from '@expo/vector-icons';
import { Image, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  /** Field label, e.g. "Foto Spidometer Awal". */
  label: string;
  /** Optional helper text under the label. */
  helper?: string;
  /** Current photo URI (or empty string when nothing captured yet). */
  value: string;
  /** Called when user taps the empty state to open the camera. */
  onCapture: () => void;
  /** Called when user taps the trash button on a captured photo. */
  onClear: () => void;
  /** Called when user taps the captured photo (full-screen preview). */
  onPreview?: () => void;
  /** Validation error message (optional). */
  error?: string;
  /** Disable interactions (during submit). */
  disabled?: boolean;
}

/**
 * Unified photo-capture / preview / clear UI used across stack screens.
 *
 * Three visual states:
 * 1. Empty: dashed border + camera icon + label.
 * 2. Filled: thumbnail + filename + clear button.
 * 3. Error: red border on the empty state.
 */
export default function PhotoCaptureField({
  label,
  helper,
  value,
  onCapture,
  onClear,
  onPreview,
  error,
  disabled,
}: Props) {
  const showError = !!error;

  return (
    <View className="mb-4">
      <Text className="mb-1 text-sm font-semibold text-gray-700">{label}</Text>
      {helper ? <Text className="mb-2 text-xs text-gray-400">{helper}</Text> : null}

      {!value ? (
        <TouchableOpacity
          activeOpacity={0.7}
          disabled={disabled}
          onPress={onCapture}
          className={`flex-row items-center justify-center gap-2 rounded-xl border-2 border-dashed py-5 ${
            showError ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-slate-50'
          }`}>
          <View className={`rounded-full p-2 ${showError ? 'bg-red-100' : 'bg-white'}`}>
            <Feather name="camera" size={20} color={showError ? '#ef4444' : '#205781'} />
          </View>
          <Text className={`text-sm font-medium ${showError ? 'text-red-500' : 'text-gray-600'}`}>
            Ketuk untuk ambil foto
          </Text>
        </TouchableOpacity>
      ) : (
        <View className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onPreview}
            disabled={disabled || !onPreview}>
            <Image source={{ uri: value }} className="aspect-[4/3] w-full" resizeMode="cover" />
          </TouchableOpacity>
          <View className="flex-row items-center justify-between border-t border-gray-100 bg-slate-50 px-3 py-2">
            <View className="flex-row items-center gap-2">
              <Feather name="check-circle" size={14} color="#10b981" />
              <Text className="text-xs font-medium text-emerald-600">Foto siap dikirim</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              disabled={disabled}
              onPress={onClear}
              className="flex-row items-center gap-1 rounded-md bg-red-50 px-2 py-1">
              <Feather name="trash-2" size={12} color="#ef4444" />
              <Text className="text-xs font-medium text-red-500">Ulangi</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {showError ? <Text className="mt-1 text-xs text-red-500">{error}</Text> : null}
    </View>
  );
}
