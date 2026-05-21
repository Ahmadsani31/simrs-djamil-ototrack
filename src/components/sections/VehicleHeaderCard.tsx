import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { colors } from '@/constants/colors';

type Variant = 'pemakaian' | 'pemeliharaan' | 'pengembalian' | 'bbm';

const variantConfig: Record<
  Variant,
  { icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string; accent: string }
> = {
  pemakaian: { icon: 'car-sports', label: 'Pemakaian Kendaraan', accent: 'bg-emerald-500' },
  pemeliharaan: { icon: 'car-cog', label: 'Pemeliharaan', accent: 'bg-amber-500' },
  pengembalian: { icon: 'car-arrow-right', label: 'Pengembalian', accent: 'bg-sky-500' },
  bbm: { icon: 'gas-station', label: 'Pengisian BBM', accent: 'bg-orange-500' },
};

interface Props {
  variant: Variant;
  /** Override default label (e.g. "Pemakaian Manual") */
  label?: string;
  /** Vehicle name (e.g. Toyota Avanza) */
  name?: string;
  /** Plate number */
  noPolisi?: string;
  /** Optional sub line below plate (e.g. activity, location) */
  subtitle?: string;
}

/**
 * Brand-coloured card showing the active vehicle context. Used as the first
 * card on every stack screen (detail, service, pengembalian, bbm-*).
 */
export default function VehicleHeaderCard({ variant, label, name, noPolisi, subtitle }: Props) {
  const cfg = variantConfig[variant];

  return (
    <View className="mx-4 mb-3 mt-2 overflow-hidden rounded-2xl bg-white shadow-sm">
      <View className="px-4 py-4">
        <Text className="text-2xl font-bold text-gray-800">{name || '-'}</Text>
        <View className="mt-1 flex-row items-center gap-2">
          <View className={`rounded-md px-2 py-0.5 ${cfg.accent}`}>
            <Text className="text-xs font-bold uppercase tracking-wider text-white">
              {noPolisi || '-'}
            </Text>
          </View>
          {subtitle ? (
            <View className="flex-1 flex-row items-center gap-1">
              <Feather name="info" size={11} color="#94a3b8" />
              <Text className="flex-1 text-xs text-gray-500" numberOfLines={2}>
                {subtitle}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}
