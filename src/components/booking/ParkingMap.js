// src/components/booking/ParkingMap.js
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ParkingMap = ({ parkingLot }) => {
  // Default location (use the parking lot location or a default)
  const initialRegion = {
    latitude: parkingLot?.latitude || 37.78825,
    longitude: parkingLot?.longitude || -122.4324,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
      >
        <Marker
          coordinate={{
            latitude: parkingLot?.latitude || 37.78825,
            longitude: parkingLot?.longitude || -122.4324,
          }}
          title={parkingLot?.name || 'Parking Lot'}
          description={parkingLot?.location || ''}
        >
          <Icon name="parking" size={30} color="#4285F4" />
        </Marker>
      </MapView>
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>{parkingLot?.name || 'Parking Lot'}</Text>
        <Text style={styles.infoAddress}>{parkingLot?.location || ''}</Text>
        <View style={styles.infoDetails}>
          <View style={styles.infoItem}>
            <Icon name="car-multiple" size={16} color="#4285F4" />
            <Text style={styles.infoText}>{parkingLot?.totalSpots || 0} spots</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="currency-usd" size={16} color="#4285F4" />
            <Text style={styles.infoText}>${parkingLot?.hourlyRate || 0}/hour</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width - 40,
    height: 250,
    borderRadius: 8,
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  infoAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  infoDetails: {
    flexDirection: 'row',
    marginTop: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 6,
  },
});

export default ParkingMap;