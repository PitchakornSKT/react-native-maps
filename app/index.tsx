import React, { useEffect, useState, useRef } from 'react';
import { View, Button, TextInput, Alert, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Place } from './types';

export default function MapScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // ขอสิทธิ์เข้าถึงตำแหน่ง
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('ต้องอนุญาตให้เข้าถึงตำแหน่งก่อนใช้งาน');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    })();
  }, []);

  const goToMyLocation = async () => {
    const loc = await Location.getCurrentPositionAsync({});
    setLocation(loc);
    mapRef.current?.animateToRegion({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  const saveLocation = async () => {
    if (!location) return Alert.alert('ยังไม่ได้ระบุตำแหน่ง');
    if (!name.trim()) return Alert.alert('กรุณากรอกชื่อสถานที่');

    const newPlace: Place = {
      id: Date.now().toString(),
      name,
      description,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };

    const existing = await AsyncStorage.getItem('places');
    const places: Place[] = existing ? JSON.parse(existing) : [];
    places.push(newPlace);

    await AsyncStorage.setItem('places', JSON.stringify(places));
    Alert.alert('บันทึกสำเร็จ');
    setName('');
    setDescription('');
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={{
          latitude: 13.736717,
          longitude: 100.523186,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="ตำแหน่งของฉัน"
          />
        )}
      </MapView>

      <View style={styles.controlPanel}>
        <Button title="ตำแหน่งของฉัน" onPress={goToMyLocation} />
        <TextInput
          style={styles.input}
          placeholder="ชื่อสถานที่"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="คำบรรยาย"
          value={description}
          onChangeText={setDescription}
        />
        <Button title="บันทึกสถานที่" onPress={saveLocation} />
        <Button title="ดูรายการที่บันทึก" onPress={() => router.push('/saved-places')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  controlPanel: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 12,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginVertical: 5,
    padding: 8,
    borderRadius: 8,
  },
});
