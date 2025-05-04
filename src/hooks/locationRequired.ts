import * as Location from 'expo-location';
import { Alert } from 'react-native';

export const reLocation = {
  enable: async () => {
    let enabled = await Location.hasServicesEnabledAsync(); //returns true or false
    console.log('enable coordinate ',enabled);
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
    let { status } = await Location.requestForegroundPermissionsAsync(); //used for the pop up box where we give permission to use location
    console.log('get coordinate ',status);
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Allow the app to use the location services', [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        { text: 'OK', onPress: () => console.log('OK Pressed') },
      ]);
    }
    //get current position lat and long
    const { coords } = await Location.getCurrentPositionAsync();

    if (coords) {
      const { latitude, longitude } = coords;

      return {
       lat: latitude,
       long : longitude,
      };
    }
  },
};
