// store/locationStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      name: 'tracking-data', // Key di SecureStore
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        coords: state.coords, // Hanya coords yang disimpan
        coord: null,
        addToBatchCoordinate: () => {},
        addToCoordinate: () => {},
        clearCoordinates: () => {},
      }),
    }
  )
);
