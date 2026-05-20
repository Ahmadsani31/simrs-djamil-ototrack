// store/locationStore.ts
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
  coord: Coordinate | null;
  addToBatchCoordinate: (coord: Coordinate) => void;
  addToCoordinate: (coord: Coordinate) => void;
  clearCoordinates: () => void;
};

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      coords: [],
      coord: null,
      addToBatchCoordinate: (coord) => {
        set((state) => ({
          coords: [...state.coords, coord],
        }));
      },
      addToCoordinate: (coordinate) => {
        set({ coord: coordinate });
      },
      clearCoordinates: () =>
        set(() => ({
          coords: [],
        })),
    }),
    {
      name: 'tracking-data', // Key di AsyncStorage
      storage: createJSONStorage(() => AsyncStorage),
      // Hanya `coords` yang dipersist. Action functions otomatis
      // dipertahankan dari initializer saat rehydrate.
      partialize: (state) => ({ coords: state.coords }),
    }
  )
);
