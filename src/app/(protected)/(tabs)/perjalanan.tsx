import { ActivityIndicator, Alert, Button, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useContext, useEffect, useRef, useState } from "react";
import ButtonCostum from "@/components/ButtonCostum";
import * as Location from 'expo-location'
import { useLocationStore } from "@/stores/locationStore";

import * as SecureStore from 'expo-secure-store';
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";

const BACKGROUND_TASK = 'background-location-task';

export default function PerjalananScreen() {

  const { coord, coords } = useLocationStore();

  const [displayCurrentAddress, setDisplayCurrentAddress] = useState('Location Loading.....');
  const [isTracking, setIsTracking] = useState(false);


  useEffect(() => {
    checkIfLocationEnabled();
    getCurrentLocation();
    checkTrackingLive()
  }, [])

  const checkTrackingLive = async () => {
    const tracking = await SecureStore.getItemAsync('liveTracking');
    if (tracking == 'true') {
      setIsTracking(true)
    } else {
      setIsTracking(false)
    }
  }

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

    // console.log('coords', coords)

    if (coords) {
      const { latitude, longitude } = coords;
      // console.log(latitude, longitude);

      //provide lat and long to get the the actual address
      let responce = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });
      // console.log('responce', responce);
      //loop on the responce to get the actual result
      for (let item of responce) {
        let address = `${item.formattedAddress},( ${item.postalCode}, ${item.district},  ${item.city},${item.subregion},${item.region})`
        setDisplayCurrentAddress(address)
      }
    }
  }



  const startTracking = async () => {
    console.log('Tracking start');

    const { status: fg } = await Location.requestForegroundPermissionsAsync();
    const { status: bg } = await Location.requestBackgroundPermissionsAsync();

    if (fg !== 'granted' || bg !== 'granted') {
      return Alert.alert('Permission required for background tracking');
    }

    const hasStarted = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_TASK);
    if (!hasStarted) {

      await SecureStore.setItemAsync('liveTracking', 'true');

      await Location.startLocationUpdatesAsync(BACKGROUND_TASK, {
        accuracy: Location.Accuracy.Highest,
        timeInterval: 5000,
        distanceInterval: 5,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: 'Tracking location',
          notificationBody: 'We are tracking your location in background',
        },
      });
      setIsTracking(true);
    }
  };

  const stopTracking = async () => {
    await SecureStore.setItemAsync('liveTracking', 'false');
    const isRunning = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_TASK);
    if (isRunning) {
      await Location.stopLocationUpdatesAsync(BACKGROUND_TASK);
      setIsTracking(false);
    }
  };


  const [webViewContent, setWebViewContent] = useState<string | null>(null);
  useEffect(() => {
    let isMounted = true;

    const loadHtml = async () => {
      try {
        const path = require("@asset/leaflet.html");
        const asset = Asset.fromModule(path);
        await asset.downloadAsync();
        const htmlContent = await FileSystem.readAsStringAsync(asset.localUri!);

        if (isMounted) {
          setWebViewContent(htmlContent);
        }
      } catch (error) {
        Alert.alert('Error loading HTML', JSON.stringify(error));
        console.error('Error loading HTML:', error);
      }
    };

    loadHtml();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!webViewContent) {
    return <ActivityIndicator size="large" />
  }



  const keyboardVerticalOffset = Platform.OS === 'ios' ? 40 : 0
  const keyboardBehavior = Platform.OS === 'ios' ? 'padding' : 'height'
  return (

    <View className="flex-1 bg-slate-300">
      <View className='absolute w-full bg-[#205781] h-44 rounded-br-[50]  rounded-bl-[50]' />
      <KeyboardAvoidingView className="flex-1" behavior={keyboardBehavior} keyboardVerticalOffset={keyboardVerticalOffset}>
        <ScrollView style={{ marginBottom: 80 }}>
          <View className="m-4 p-4 bg-white rounded-lg">
            <View className="items-center text-center mb-3">
              <Text className="text-3xl font-bold">Live Location Tracking</Text>
            </View>
            <View className="p-2 items-center">
              <Text className="text-center">{displayCurrentAddress}</Text>
            </View>
            <ButtonCostum classname="bg-[#FD8B51]" title={isTracking ? 'Tracking' : 'Start Tracking'} onPress={startTracking} />
            <ButtonCostum classname="bg-[#273F4F]" title="Stop Tracking" onPress={stopTracking} />
            {coords.length === 0 ? (
              <Text style={{ textAlign: 'center' }}>Belum ada lokasi.</Text>
            ) : (
              <ScrollView style={{ height: 300 }}>
                {coords.map((coord, index) => (
                  <View key={index} style={styles.coordItem}>
                    <Text style={styles.coordText}>
                      #{index + 1}: Lat {coord.latitude.toFixed(6)}, Lng {coord.longitude.toFixed(6)}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            )}

          </View>



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