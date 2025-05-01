// store/locationStore.ts
import { create } from 'zustand';

type Coordinate = {
  latitude: number;
  longitude: number;
  timestamp: number;
};

type LocationState = {
  coords: Coordinate[];
  coord: Coordinate[];
  addToBatchCoordinate: (coord: Coordinate) => void;
  addToCoordinate: (coord: Coordinate) => void;
  clearCoordinates: () => void;
};

export const useLocationStore = create<LocationState>((set) => ({
  coords: [],
  coord: [],
  addToBatchCoordinate: (coord) => {
    console.log('coord di locationStore ', JSON.stringify(coord));

    set((state) => ({
      coords: [...state.coords, coord],
    }));
  },
  addToCoordinate: (coord) => {
    console.log('coord di locationStore single', JSON.stringify(coord));
    set({ coord: [coord] });
  },
  clearCoordinates: () =>
    set(() => ({
      coords: [],
    })),
}));
