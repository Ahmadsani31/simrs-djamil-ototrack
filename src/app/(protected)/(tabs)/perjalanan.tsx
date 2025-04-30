import { Alert, Button, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { useContext, useEffect, useRef, useState } from "react";
import Input from "@/components/Input";
import InputArea from "@/components/InputArea";
import ButtonCostum from "@/components/ButtonCostum";
import { CameraMode, CameraView } from "expo-camera";
import { AntDesign, FontAwesome6 } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location'

export default function PerjalananScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationArray, setLocationArray] = useState<Location.LocationObjectCoords[]>([]);
  const [watcher, setWatcher] = useState<Location.LocationSubscription | null>(null);

  const [displayCurrentAddress, setDisplayCurrentAddress] = useState('Location Loading.....');
  const [locationServicesEnabled, setLocationServicesEnabled] = useState(false)

  useEffect(() => {
    checkIfLocationEnabled();
    getCurrentLocation();
  }, [])

  //check if location is enable or not
  const checkIfLocationEnabled = async () => {
    let enabled = await Location.hasServicesEnabledAsync();       //returns true or false
    if (!enabled) {                     //if not enable 
      Alert.alert('Location not enabled', 'Please enable your Location', [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        { text: 'OK', onPress: () => console.log('OK Pressed') },
      ]);
    } else {
      setLocationServicesEnabled(enabled)         //store true into state
    }
  }

  //get current location
  const getCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();  //used for the pop up box where we give permission to use location 
    console.log(status);
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

    console.log('coords', coords)

    if (coords) {
      const { latitude, longitude } = coords;
      console.log(latitude, longitude);

      //provide lat and long to get the the actual address
      let responce = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });
      console.log('responce', responce);
      //loop on the responce to get the actual result
      for (let item of responce) {
        let address = `(${item.postalCode}), ${item.formattedAddress}, ${item.district},  ${item.city},${item.subregion},${item.region}`
        setDisplayCurrentAddress(address)
      }
    }
  }



  const startTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Izin lokasi ditolak');
      return;
    }

    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 3000,
        distanceInterval: 1,
      },
      (loc) => {
        console.log('Lokasi diperbarui:', loc.coords);
        setLocationArray((prev) => [...prev, loc.coords]);
        setLocation(loc);
      }
    );

    setWatcher(subscription);
  };

  const stopTracking = () => {
    if (watcher) {
      watcher.remove();
      setWatcher(null);
      console.log('Tracking dihentikan');
    }
  };

  const keyboardVerticalOffset = Platform.OS === 'ios' ? 40 : 0
  const keyboardBehavior = Platform.OS === 'ios' ? 'padding' : 'height'
  return (

    <View className="flex-1 bg-slate-300">
      <View className='absolute w-full bg-[#60B5FF] h-44 rounded-br-[50]  rounded-bl-[50]' />
      <KeyboardAvoidingView className="flex-1" behavior={keyboardBehavior} keyboardVerticalOffset={keyboardVerticalOffset}>
        <ScrollView style={{ marginBottom: 80 }}>
          <View className="m-4 p-4 bg-white rounded-lg">
            <View className="items-center text-center mb-3">
              <Text className="text-3xl font-bold">Live Location Tracking</Text>
            </View>
            <View className="p-2 items-center">
              <Text className="text-center">{displayCurrentAddress}</Text>
            </View>
            <ButtonCostum classname="bg-indigo-500" title="Start Tracking" onPress={startTracking} />
            <ButtonCostum classname="bg-red-500" title="Stop Tracking" onPress={stopTracking} />

            {locationArray.length === 0 ? (
              <Text style={{ textAlign: 'center' }}>Belum ada lokasi.</Text>
            ) : (
              <ScrollView style={{ height: 100 }}>
                {locationArray.map((coord, index) => (
                  <View key={index} style={styles.coordItem}>
                    <Text style={styles.coordText}>
                      #{index + 1}: Lat {coord.latitude.toFixed(6)}, Lng {coord.longitude.toFixed(6)}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            )}

          </View>
          {location && (
            <View className="flex-1 h-96">
              <MapView
                scrollEnabled={true}   // nonaktifkan drag
                zoomEnabled={true}     // nonaktifkan zoom
                rotateEnabled={true}   // nonaktifkan rotasi
                pitchEnabled={true}    // nonaktifkan 3D
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                  }}
                  title="Your Position"
                />
              </MapView>

            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </View>

  );
}
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  buttonContainer: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  coordsBox: {
    marginTop: 10,
    padding: 16,
    backgroundColor: '#eee',
    borderRadius: 10,
    alignItems: 'center',
  },
  coordText: { fontSize: 16, fontWeight: '500' },
  coordItem: { paddingVertical: 6, borderBottomWidth: 1, borderColor: '#ccc' },
  map: { marginTop: 20, width: '100%', height: '100%' },
  controls: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});