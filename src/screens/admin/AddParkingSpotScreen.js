// src/screens/admin/AddParkingSpotScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import firestore from '@react-native-firebase/firestore';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import AppHeader from '../../components/common/AppHeader';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const AddParkingSpotScreen = ({ route, navigation }) => {
  const isEditing = route.params?.isEditing || false;
  const existingSpot = route.params?.parkingSpot;
  
  const [name, setName] = useState(existingSpot?.name || '');
  const [location, setLocation] = useState(existingSpot?.location || '');
  const [price, setPrice] = useState(existingSpot?.price?.toString() || '');
  const [isAvailable, setIsAvailable] = useState(existingSpot?.isAvailable ?? true);
  const [coordinates, setCoordinates] = useState(
    existingSpot?.coordinates || {
      latitude: 37.7749,
      longitude: -122.4194,
    }
  );
  const [capacity, setCapacity] = useState(existingSpot?.capacity?.toString() || '1');
  const [description, setDescription] = useState(existingSpot?.description || '');
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  
  // Validate inputs
  const validate = () => {
    let newErrors = {};
    let isValid = true;
    
    if (!name) {
      newErrors.name = 'Parking spot name is required';
      isValid = false;
    }
    
    if (!location) {
      newErrors.location = 'Location description is required';
      isValid = false;
    }
    
    if (!price) {
      newErrors.price = 'Price is required';
      isValid = false;
    } else if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      newErrors.price = 'Price must be a positive number';
      isValid = false;
    }
    
    if (!capacity) {
      newErrors.capacity = 'Capacity is required';
      isValid = false;
    } else if (isNaN(parseInt(capacity)) || parseInt(capacity) <= 0) {
      newErrors.capacity = 'Capacity must be a positive number';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!validate()) return;
    
    setLoading(true);
    
    try {
      const parkingSpotData = {
        name,
        location,
        price: parseFloat(price),
        isAvailable,
        coordinates,
        capacity: parseInt(capacity),
        description,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      };
      
      if (isEditing && existingSpot) {
        // Update existing parking spot
        await firestore()
          .collection('parkingSpots')
          .doc(existingSpot.id)
          .update(parkingSpotData);
        
        Alert.alert('Success', 'Parking spot updated successfully');
      } else {
        // Create new parking spot
        parkingSpotData.createdAt = firestore.FieldValue.serverTimestamp();
        
        await firestore()
          .collection('parkingSpots')
          .add(parkingSpotData);
        
        Alert.alert('Success', 'Parking spot added successfully');
      }
      
      navigation.goBack();
    } catch (error) {
      console.error('Error saving parking spot:', error);
      Alert.alert('Error', 'Failed to save parking spot. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle map marker drag
  const handleMarkerDrag = (e) => {
    setCoordinates({
      latitude: e.nativeEvent.coordinate.latitude,
      longitude: e.nativeEvent.coordinate.longitude,
    });
  };
  
  // Handle map press to place marker
  const handleMapPress = (e) => {
    setCoordinates({
      latitude: e.nativeEvent.coordinate.latitude,
      longitude: e.nativeEvent.coordinate.longitude,
    });
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader 
        title={isEditing ? 'Edit Parking Spot' : 'Add Parking Spot'} 
        showBackButton
        onBackPress={() => navigation.goBack()}
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.formContainer}>
            <Input
              label="Parking Spot Name"
              placeholder="Enter name (e.g., 'Zone A - 12')"
              value={name}
              onChangeText={setName}
              icon="local-parking"
              error={errors.name}
            />
            
            <Input
              label="Location"
              placeholder="Enter location (e.g., 'Engineering Building')"
              value={location}
              onChangeText={setLocation}
              icon="location-on"
              error={errors.location}
            />
            
            <View style={styles.rowInputs}>
              <Input
                label="Price per Hour ($)"
                placeholder="0.00"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                icon="attach-money"
                style={{ flex: 1, marginRight: 8 }}
                error={errors.price}
              />
              
              <Input
                label="Capacity"
                placeholder="1"
                value={capacity}
                onChangeText={setCapacity}
                keyboardType="numeric"
                icon="directions-car"
                style={{ flex: 1, marginLeft: 8 }}
                error={errors.capacity}
              />
            </View>
            
            <Input
              label="Description (Optional)"
              placeholder="Enter additional details"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              style={{ textAlignVertical: 'top' }}
            />
            
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Available for Booking:</Text>
              <Switch
                value={isAvailable}
                onValueChange={setIsAvailable}
                trackColor={{ false: '#E0E0E0', true: '#B3CCFF' }}
                thumbColor={isAvailable ? '#4A80F0' : '#F5F5F5'}
              />
            </View>
            
            <Text style={styles.sectionTitle}>Parking Location</Text>
            <Text style={styles.sectionDescription}>
              Drag the marker or tap on the map to set the exact parking location
            </Text>
            
            <View style={styles.mapContainer}>
              <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={{
                  latitude: coordinates.latitude,
                  longitude: coordinates.longitude,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }}
                onPress={handleMapPress}
                onMapReady={() => setMapReady(true)}
              >
                {mapReady && (
                  <Marker
                    coordinate={coordinates}
                    draggable
                    onDragEnd={handleMarkerDrag}
                    title={name || 'Parking Spot'}
                    description={location || 'Location'}
                  />
                )}
              </MapView>
            </View>
            
            <View style={styles.coordinatesContainer}>
              <Text style={styles.coordinatesText}>
                Latitude: {coordinates.latitude.toFixed(6)}
              </Text>
              <Text style={styles.coordinatesText}>
                Longitude: {coordinates.longitude.toFixed(6)}
              </Text>
            </View>
            
            <Button
              title={isEditing ? 'Update Parking Spot' : 'Add Parking Spot'}
              onPress={handleSubmit}
              loading={loading}
              style={styles.submitButton}
            />
            
            <Button
              title="Cancel"
              onPress={() => navigation.goBack()}
              variant="outline"
              style={styles.cancelButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  formContainer: {
    width: '100%',
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  mapContainer: {
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  coordinatesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  coordinatesText: {
    fontSize: 14,
    color: '#666',
  },
  submitButton: {
    marginBottom: 12,
  },
  cancelButton: {},
});

export default AddParkingSpotScreen;