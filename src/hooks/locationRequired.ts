import * as Location from 'expo-location';
import { Alert } from 'react-native';

export const reLocation = {
  enable: async () => {
    let enabled = await Location.hasServicesEnabledAsync(); //returns true or false
    // console.log('enable coordinate ', enabled);
    if (!enabled) {
      //if not enable
      Alert.alert('Location not enabled', 'Please enable your Location', [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        { text: 'OK', onPress: () => console.log('OK Pressed') },
      ]);
    }

    return enabled;
  },
  getCoordinate: async () => {
    let location = await Location.getLastKnownPositionAsync();

    if (!location) {
      location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 10000,
        distanceInterval: 10,
      });
    }
    //get current position lat and long
    // console.log('location ', JSON.stringify(location));

    const { latitude, longitude } = location.coords;

    return {
      lat: latitude,
      long: longitude,
    };
  },
};
