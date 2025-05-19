import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';

import AppHeader from '../../components/common/AppHeader';
import auth from '@react-native-firebase/auth';


const MapScreen = ({ navigation }) => {
  const [parkingSpots, setParkingSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [activeBooking, setActiveBooking] = useState(null);
  
  // Default to a university campus location
  const [region, setRegion] = useState({
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  useEffect(() => {
    const fetchParkingSpots = async () => {
      try {
        const spotsSnapshot = await firestore()
          .collection('parkingSpots')
          .where('isActive', '==', true)
          .get();
        
        const spotsData = spotsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        setParkingSpots(spotsData);
      } catch (error) {
        console.error('Error fetching parking spots:', error);
        Alert.alert('Error', 'Failed to load parking spots. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchParkingSpots();
    
    // Check for active bookings
    const checkActiveBooking = async () => {
      try {
        const user = auth().currentUser;
        if (!user) return;
        
        const now = firestore.Timestamp.now();
        
        const bookingsSnapshot = await firestore()
          .collection('bookings')
          .where('userId', '==', user.uid)
          .where('status', '==', 'confirmed')
          .where('endTime', '>', now)
          .orderBy('endTime', 'asc')
          .limit(1)
          .get();
          
        if (!bookingsSnapshot.empty) {
          const bookingData = {
            id: bookingsSnapshot.docs[0].id,
            ...bookingsSnapshot.docs[0].data(),
          };
          setActiveBooking(bookingData);
        }
      } catch (error) {
        console.error('Error checking active bookings:', error);
      }
    };
    
    checkActiveBooking();
  }, []);

  const handleMarkerPress = (spot) => {
    setSelectedSpot(spot);
  };

  const handleBooking = () => {
    if (selectedSpot) {
      navigation.navigate('Booking', { parkingSpot: selectedSpot });
    }
  };

  const SpotDetailsCard = () => {
    if (!selectedSpot) return null;

    return (
      <View style={styles.detailsCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.spotName}>{selectedSpot.name}</Text>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: selectedSpot.isAvailable ? '#4CAF50' : '#F44336' }
          ]}>
            <Text style={styles.statusText}>
              {selectedSpot.isAvailable ? 'Available' : 'Occupied'}
            </Text>
          </View>
        </View>
        
        <Text style={styles.locationText}>{selectedSpot.location}</Text>
        
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Icon name="attach-money" size={20} color="#4A80F0" />
            <Text style={styles.detailText}>${selectedSpot.price}/hour</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Icon name="access-time" size={20} color="#4A80F0" />
            <Text style={styles.detailText}>24/7</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Icon name="star" size={20} color="#4A80F0" />
            <Text style={styles.detailText}>{selectedSpot.rating || '4.5'}</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={[
            styles.bookButton,
            !selectedSpot.isAvailable && styles.disabledButton
          ]}
          onPress={handleBooking}
          disabled={!selectedSpot.isAvailable}
        >
          <Text style={styles.bookButtonText}>
            {selectedSpot.isAvailable ? 'Book Now' : 'Unavailable'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader 
        title="Find Parking" 
        rightComponent={
          <TouchableOpacity style={styles.notificationButton}>
            <Icon name="notifications" size={24} color="#333" />
          </TouchableOpacity>
        }
      />

      <View style={styles.container}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A80F0" />
            <Text style={styles.loadingText}>Loading parking spots...</Text>
          </View>
        ) : (
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              region={region}
              onRegionChangeComplete={setRegion}
            >
              {parkingSpots.map(spot => (
                <Marker
                  key={spot.id}
                  coordinate={{
                    latitude: spot.coordinates.latitude,
                    longitude: spot.coordinates.longitude,
                  }}
                  title={spot.name}
                  description={spot.isAvailable ? 'Available' : 'Occupied'}
                  pinColor={spot.isAvailable ? '#4CAF50' : '#F44336'}
                  onPress={() => handleMarkerPress(spot)}
                />
              ))}
            </MapView>
            
            {/* Active Booking Bar */}
            {activeBooking && (
              <TouchableOpacity 
                style={styles.activeBookingBar}
                onPress={() => navigation.navigate('Checkout', { bookingId: activeBooking.id })}
              >
                <View style={styles.activeBookingContent}>
                  <Icon name="timer" size={24} color="#FFFFFF" />
                  <View style={styles.activeBookingInfo}>
                    <Text style={styles.activeBookingTitle}>Active Booking: {activeBooking.parkingSpotName}</Text>
                    <Text style={styles.activeBookingText}>
                      Tap to checkout
                    </Text>
                  </View>
                </View>
                <Icon name="arrow-forward" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            )}
            
            <SpotDetailsCard />
          </View>
        )}
      </View>
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
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  notificationButton: {
    padding: 8,
  },
  activeBookingBar: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: '#4A80F0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  activeBookingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeBookingInfo: {
    marginLeft: 12,
  },
  activeBookingTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  activeBookingText: {
    color: '#E6EEFF',
    fontSize: 12,
    marginTop: 2,
  },
  detailsCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  spotName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 4,
  },
  bookButton: {
    backgroundColor: '#4A80F0',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#E0E0E0',
  },
});

export default MapScreen;