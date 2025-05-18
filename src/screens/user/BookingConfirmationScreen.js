// src/screens/user/BookingConfirmationScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import Button from '../../components/common/Button';

const BookingConfirmationScreen = ({ route, navigation }) => {
  const { bookingId, bookingData } = route.params;
  
  const formatDate = (timestamp) => {
    const date = timestamp.toDate();
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.successContainer}>
          <View style={styles.iconCircle}>
            <Icon name="check" size={40} color="#FFFFFF" />
          </View>
          
          <Text style={styles.successTitle}>Booking Confirmed!</Text>
          <Text style={styles.successText}>
            Your parking space has been successfully booked.
          </Text>
        </View>
        
        <View style={styles.card}>
          <View style={styles.bookingDetails}>
            <View style={styles.detailRow}>
              <Icon name="local-parking" size={24} color="#4A80F0" />
              <View style={styles.detailTexts}>
                <Text style={styles.detailLabel}>Parking Spot</Text>
                <Text style={styles.detailValue}>{bookingData.parkingSpotName}</Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.detailRow}>
              <Icon name="access-time" size={24} color="#4A80F0" />
              <View style={styles.detailTexts}>
                <Text style={styles.detailLabel}>Start Time</Text>
                <Text style={styles.detailValue}>{formatDate(bookingData.startTime)}</Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.detailRow}>
              <Icon name="access-time" size={24} color="#4A80F0" />
              <View style={styles.detailTexts}>
                <Text style={styles.detailLabel}>End Time</Text>
                <Text style={styles.detailValue}>{formatDate(bookingData.endTime)}</Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.detailRow}>
              <Icon name="attach-money" size={24} color="#4A80F0" />
              <View style={styles.detailTexts}>
                <Text style={styles.detailLabel}>Total Cost</Text>
                <Text style={styles.detailValue}>${(bookingData.totalCost + 1).toFixed(2)}</Text>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.qrContainer}>
          <Text style={styles.qrText}>Show this QR code when arriving at the parking spot</Text>
          <Image 
            source={require('../../assets/qr-placeholder.png')} 
            style={styles.qrCode}
            resizeMode="contain"
          />
          <Text style={styles.bookingIdText}>Booking ID: {bookingId}</Text>
        </View>
        
        <View style={styles.buttonsContainer}>
          <Button
            title="View Booking Details"
            onPress={() => navigation.navigate('Bookings')}
            style={styles.viewButton}
            variant="secondary"
          />
          
          <Button
            title="Back to Map"
            onPress={() => navigation.navigate('MapHome')}
            style={styles.mapButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    padding: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },
  successContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bookingDetails: {},
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailTexts: {
    marginLeft: 16,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  qrText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  qrCode: {
    width: 200,
    height: 200,
    marginBottom: 8,
  },
  bookingIdText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  buttonsContainer: {
    flexDirection: 'column',
    gap: 12,
  },
  viewButton: {
    marginBottom: 12,
  },
  mapButton: {},
});

export default BookingConfirmationScreen;