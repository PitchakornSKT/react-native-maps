import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { Place } from './types';

export default function SavedPlacesScreen() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const stored = await AsyncStorage.getItem('places');
      if (stored) setPlaces(JSON.parse(stored));
    };
    load();
  }, []);

  const clearSelection = () => setSelectedPlace(null);

  return (
    <View style={{ flex: 1 }}>
      {selectedPlace ? (
        <>
          <MapView
            style={{ flex: 1 }}
            initialRegion={{
              latitude: selectedPlace.latitude,
              longitude: selectedPlace.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker
              coordinate={{
                latitude: selectedPlace.latitude,
                longitude: selectedPlace.longitude,
              }}
              title={selectedPlace.name}
              description={selectedPlace.description}
            />
          </MapView>
          <Button title="กลับไปยังรายการ" onPress={clearSelection} />
        </>
      ) : (
        <FlatList
          data={places}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => setSelectedPlace(item)}
            >
              <Text style={styles.title}>{item.name}</Text>
              <Text>{item.description}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 20 }}>
              ยังไม่มีสถานที่ที่บันทึกไว้
            </Text>
          }
        />
      )}

      <View style={styles.backButton}>
        <Button title="กลับไปหน้าแผนที่" onPress={() => router.back()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  title: {
    fontWeight: 'bold',
  },
  backButton: {
    padding: 10,
  },
});
