// store/locationStore.ts
import { create } from 'zustand';

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

export const useLocationStore = create<LocationState>((set) => ({
  coords: [],
  coord: null,
  addToBatchCoordinate: (coord) => {
    // console.log('coord di locationStore ', JSON.stringify(coord));

    set((state) => ({
      coords: [...state.coords, coord],
    }));
  },
  addToCoordinate: (coordinate) => {
    // console.log('coord di locationStore single', JSON.stringify(coordinate));
    set({ coord: coordinate });
  },
  clearCoordinates: () =>
    set(() => ({
      coords: [],
    })),
}));
