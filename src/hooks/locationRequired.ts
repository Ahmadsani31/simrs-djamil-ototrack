import * as Location from 'expo-location';
import { Alert } from 'react-native';

export const reLocation = {
  enable: async () => {
    const enabled = await Location.hasServicesEnabledAsync();
    if (!enabled) {
      Alert.alert('Location not enabled', 'Please enable your Location', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK' },
      ]);
    }

    return enabled;
  },
  getCoordinate: async () => {
    let location = await Location.getLastKnownPositionAsync();

    if (!location) {
      location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 1000,
        distanceInterval: 0,
      });
    }

    const { latitude, longitude } = location.coords;

    return {
      lat: latitude,
      long: longitude,
    };
  },
};
