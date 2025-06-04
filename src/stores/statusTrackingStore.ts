import { create } from 'zustand';

interface TrackingState {
  trackingStatus: boolean;
  setTrackingStatus: (value: boolean) => void;
}

export const statusTrackingStore = create<TrackingState>((set) => ({
  trackingStatus: false,
  setTrackingStatus: (value) => set({ trackingStatus: value }),
}));
