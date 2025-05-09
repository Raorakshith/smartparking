// src/screens/user/HomeScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Card, Title, Paragraph, Button, ActivityIndicator } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import BookingService from '../../services/BookingService';

const HomeScreen = ({ navigation }) => {
  const { userDetails, currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [parkingLots, setParkingLots] = useState([]);
  const [error, setError] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch all required data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch upcoming bookings for the user
      const bookings = await BookingService.getUserBookings(currentUser.uid, 'confirmed');
      
      // Filter for only upcoming bookings (startTime > now)
      const now = new Date();
      const upcoming = bookings.filter(booking => 
        booking.startTime.toDate() > now
      ).slice(0, 3); // Get only the 3 most recent
      
      setUpcomingBookings(upcoming);
      
      // Fetch all parking lots
      const lots = await BookingService.getAllParkingLots();
      setParkingLots(lots);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
      Alert.alert('Error', 'Failed to load data. Pull down to refresh.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Navigate to booking screen with selected lot
  const handleBookParking = (lot) => {
    navigation.navigate('Book', {
      screen: 'BookParking',
      params: { selectedLot: lot }
    });
  };

  // Navigate to booking details
  const viewBookingDetails = (booking) => {
    navigation.navigate('History', {
      screen: 'BookingHistory',
      params: { selectedBooking: booking }
    });
  };

  // Format date and time for display
  const formatDateTime = (timestamp) => {
    const date = timestamp.toDate();
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  // Render loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Welcome Section */}
        <View style={styles.header}>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{userDetails?.name || 'User'}</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Book')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#4285F4' }]}>
                <Icon name="car-multiple" size={24} color="#fff" />
              </View>
              <Text style={styles.actionText}>Book Now</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('History')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#34A853' }]}>
                <Icon name="history" size={24} color="#fff" />
              </View>
              <Text style={styles.actionText}>My Bookings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Profile')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#EA4335' }]}>
                <Icon name="account" size={24} color="#fff" />
              </View>
              <Text style={styles.actionText}>Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Upcoming Reservations */}
        <View style={styles.upcomingContainer}>
          <Text style={styles.sectionTitle}>Upcoming Reservations</Text>
          {upcomingBookings.length > 0 ? (
            upcomingBookings.map((booking) => (
              <Card key={booking.id} style={styles.bookingCard}>
                <Card.Content>
                  <View style={styles.bookingHeader}>
                    <View>
                      <Title>Spot {booking.spotId}</Title>
                      <Paragraph>
                        {formatDateTime(booking.startTime)} - {formatDateTime(booking.endTime).split(' at ')[1]}
                      </Paragraph>
                    </View>
                    <Icon name="qrcode" size={28} color="#4285F4" />
                  </View>
                  <View style={styles.bookingActions}>
                    <Button 
                      mode="contained" 
                      onPress={() => viewBookingDetails(booking)}
                      style={styles.viewButton}
                    >
                      View Details
                    </Button>
                    <Button 
                      mode="outlined" 
                      onPress={() => BookingService.cancelBooking(booking.id, currentUser.uid)
                        .then(() => {
                          Alert.alert('Success', 'Booking cancelled successfully');
                          fetchData();
                        })
                        .catch(err => Alert.alert('Error', err.message))
                      }
                      style={styles.cancelButton}
                    >
                      Cancel
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Icon name="calendar-blank" size={50} color="#ccc" />
              <Text style={styles.emptyText}>No upcoming reservations</Text>
              <Button 
                mode="contained" 
                onPress={() => navigation.navigate('Book')}
                style={styles.bookNowButton}
              >
                Book Now
              </Button>
            </View>
          )}
        </View>

        {/* Available Parking Lots */}
        <View style={styles.lotsContainer}>
          <Text style={styles.sectionTitle}>Available Parking Lots</Text>
          {parkingLots.length > 0 ? (
            parkingLots.map((lot) => (
              <Card key={lot.id} style={styles.lotCard}>
                <Card.Content>
                  <Title>{lot.name}</Title>
                  <Paragraph>{lot.location}</Paragraph>
                  <View style={styles.lotDetails}>
                    <View style={styles.detailItem}>
                      <Icon name="car-multiple" size={20} color="#4285F4" />
                      <Text style={styles.detailText}>{lot.totalSpots} Spots</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Icon name="currency-usd" size={20} color="#34A853" />
                      <Text style={styles.detailText}>${lot.hourlyRate}/hour</Text>
                    </View>
                  </View>
                </Card.Content>
                <Card.Actions>
                  <Button 
                    mode="contained" 
                    onPress={() => handleBookParking(lot)}
                  >
                    Book This Lot
                  </Button>
                </Card.Actions>
              </Card>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Icon name="car-off" size={50} color="#ccc" />
              <Text style={styles.emptyText}>No parking lots available</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#4285F4',
  },
  header: {
    marginBottom: 20,
  },
  welcomeContainer: {
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  actionsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    alignItems: 'center',
    width: '30%',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#333',
  },
  upcomingContainer: {
    marginBottom: 20,
  },
  bookingCard: {
    marginBottom: 10,
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  bookingActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  viewButton: {
    backgroundColor: '#4285F4',
    flex: 1,
    marginRight: 5,
  },
  cancelButton: {
    borderColor: '#EA4335',
    flex: 1,
    marginLeft: 5,
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  emptyText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
    marginBottom: 16,
  },
  bookNowButton: {
    backgroundColor: '#4285F4',
  },
  lotsContainer: {
    marginBottom: 20,
  },
  lotCard: {
    marginBottom: 10,
    elevation: 2,
  },
  lotDetails: {
    flexDirection: 'row',
    marginTop: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  detailText: {
    marginLeft: 6,
    color: '#666',
  },
});

export default HomeScreen;