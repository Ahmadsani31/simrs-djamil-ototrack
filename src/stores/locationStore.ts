import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type Coordinate = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: string | null; // Speed in km/h
  timestamp: number;
};

type LocationState = {
  coords: Coordinate[];
  addToBatchCoordinate: (coord: Coordinate) => void;
  clearCoordinates: () => void;
};

/**
 * Persisted store of GPS coordinates collected while a vehicle trip is active.
 *
 * Coordinates are produced by the background TaskManager
 * (see `utils/backgroundLocationTask.ts`) and consumed at the end of a trip
 * via `getStoredCoords()` in `lib/secureStorage.ts`, which reads the AsyncStorage
 * key `tracking-data` directly. The store value here is the same data, just
 * surfaced for components that want a live React-aware view.
 */
export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      coords: [],
      addToBatchCoordinate: (coord) => {
        set((state) => ({
          coords: [...state.coords, coord],
        }));
      },
      clearCoordinates: () =>
        set(() => ({
          coords: [],
        })),
    }),
    {
      name: 'tracking-data',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist the array. Action functions are restored from the
      // initializer on rehydrate (Zustand handles this automatically).
      partialize: (state) => ({ coords: state.coords }),
    }
  )
);
