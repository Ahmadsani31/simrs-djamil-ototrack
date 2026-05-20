import * as Location from 'expo-location';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { LOCATION_TASK_NAME } from '@/utils/backgroundLocationTask';
import { logger } from '@/utils/logger';

export type TrackingHealth = {
  /** True jika TaskManager task untuk lokasi sedang berjalan. */
  isRunning: boolean;
  /** True jika foreground location permission masih di-grant. */
  hasForegroundPermission: boolean;
  /** True jika background location permission masih di-grant. */
  hasBackgroundPermission: boolean;
  /**
   * True jika tracking *seharusnya* sedang berjalan (task running) tapi
   * permission tidak lengkap. Saat ini, OS akan diam-diam stop tracking,
   * jadi UI perlu kasih tahu user.
   */
  needsAttention: boolean;
};

/**
 * Periksa kesehatan tracking lokasi setiap kali screen focus.
 *
 * Pakai di home tab driver untuk menampilkan banner peringatan kalau
 * user tidak sengaja mencabut izin lokasi saat trip aktif.
 */
export function useTrackingHealth(): TrackingHealth {
  const [health, setHealth] = useState<TrackingHealth>({
    isRunning: false,
    hasForegroundPermission: true,
    hasBackgroundPermission: true,
    needsAttention: false,
  });

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      const probe = async () => {
        try {
          const isRunning = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
          const fg = await Location.getForegroundPermissionsAsync();
          const bg = await Location.getBackgroundPermissionsAsync();
          if (cancelled) return;

          const hasForegroundPermission = fg.status === 'granted';
          const hasBackgroundPermission = bg.status === 'granted';
          const needsAttention =
            isRunning && (!hasForegroundPermission || !hasBackgroundPermission);

          setHealth({
            isRunning,
            hasForegroundPermission,
            hasBackgroundPermission,
            needsAttention,
          });
        } catch (err) {
          logger.error('Tracking health probe failed:', err);
        }
      };

      probe();
      return () => {
        cancelled = true;
      };
    }, [])
  );

  return health;
}
