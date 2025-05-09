// src/screens/user/ConfirmationScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  SafeAreaView,
} from 'react-native';
import { Card, Title, Paragraph, Button, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '../../context/AuthContext';
import BookingService from '../../services/BookingService';

const ConfirmationScreen = ({ navigation, route }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [parkingLot, setParkingLot] = useState(null);
  const [qrCodeData, setQrCodeData] = useState('');

  // Get booking ID from route params
  const { bookingId, paymentDetails } = route.params || {};

  // Fetch booking details
  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    if (!bookingId) return;

    setLoading(true);
    try {
      // Get booking details
      const bookingData = await BookingService.getBookingById(bookingId);
      setBooking(bookingData);

      // Get parking lot details
      const lotData = await BookingService.getParkingLotById(bookingData.lotId);
      setParkingLot(lotData);

      // Generate QR code data
      const qrData = BookingService.generateQRCodeData(bookingId, currentUser.uid);
      setQrCodeData(qrData);
    } catch (error) {
      console.error('Error fetching booking details:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Format time for display
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Handle share booking
  const handleShareBooking = async () => {
    try {
      const message = `I've booked a parking spot at ${parkingLot?.name}!\n\nDate: ${formatDate(booking?.date)}\nTime: ${formatTime(booking?.startTime)} - ${formatTime(booking?.endTime)}\nSpot: ${booking?.spotId}`;
      
      await Share.share({
        message,
        title: 'My Parking Booking',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Navigate to home
  const goToHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  // View booking history
  const viewBookings = () => {
    navigation.navigate('History');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.successContainer}>
          <View style={styles.iconContainer}>
            <Icon name="check-circle" size={80} color="#34A853" />
          </View>
          <Text style={styles.successTitle}>Booking Confirmed!</Text>
          <Text style={styles.successText}>
            Your parking spot has been successfully booked.
          </Text>
        </View>

        {/* Booking QR Code */}
        <View style={styles.qrContainer}>
          <Text style={styles.qrTitle}>Scan to Check-In</Text>
          <View style={styles.qrCodeBox}>
            {qrCodeData ? (
              <QRCode value={qrCodeData} size={200} />
            ) : (
              <View style={styles.qrPlaceholder}>
                <Icon name="qrcode" size={80} color="#ccc" />
              </View>
            )}
          </View>
          <Text style={styles.qrInstructions}>
            Show this QR code at the parking entrance
          </Text>
        </View>

        {/* Booking Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Details</Text>
          <Card style={styles.detailsCard}>
            <Card.Content>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Booking ID:</Text>
                <Text style={styles.detailValue}>
                  {bookingId?.substring(0, 8) || 'Loading...'}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Parking Lot:</Text>
                <Text style={styles.detailValue}>
                  {parkingLot?.name || 'Loading...'}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Location:</Text>
                <Text style={styles.detailValue}>
                  {parkingLot?.location || 'Loading...'}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Spot Number:</Text>
                <Text style={styles.detailValue}>
                  {booking?.spotId || 'Loading...'}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date:</Text>
                <Text style={styles.detailValue}>
                  {booking ? formatDate(booking.date) : 'Loading...'}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Time:</Text>
                <Text style={styles.detailValue}>
                  {booking 
                    ? `${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}` 
                    : 'Loading...'}
                </Text>
              </View>
              
              <Divider style={styles.divider} />
              
              <View style={styles.paymentSection}>
                <Text style={styles.paymentTitle}>Payment Information</Text>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Method:</Text>
                  <Text style={styles.detailValue}>
                    {paymentDetails?.method === 'card' 
                      ? `Card ending in ${paymentDetails?.cardLast4 || '****'}` 
                      : 'Campus Account'}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Amount:</Text>
                  <Text style={[styles.detailValue, styles.amount]}>
                    ${paymentDetails?.amount?.toFixed(2) || '0.00'}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Date:</Text>
                  <Text style={styles.detailValue}>
                    {paymentDetails?.timestamp 
                      ? new Date(paymentDetails.timestamp).toLocaleDateString() 
                      : 'Today'}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button 
            mode="contained" 
            icon="home"
            onPress={goToHome}
            style={styles.actionButton}
          >
            Go to Home
          </Button>
          
          <Button 
            mode="outlined" 
            icon="history"
            onPress={viewBookings}
            style={styles.actionButton}
          >
            View Bookings
          </Button>
          
          <Button 
            mode="outlined" 
            icon="share-variant"
            onPress={handleShareBooking}
            style={styles.actionButton}
          >
            Share
          </Button>
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
  successContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#34A853',
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  qrContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    marginBottom: 24,
    elevation: 2,
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  qrCodeBox: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 16,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  qrInstructions: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  detailsCard: {
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    maxWidth: '60%',
    textAlign: 'right',
  },
  divider: {
    marginVertical: 12,
  },
  paymentSection: {
    marginTop: 8,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  amount: {
    color: '#34A853',
  },
  actionButtons: {
    marginBottom: 24,
  },
  actionButton: {
    marginBottom: 12,
  },
});

export default ConfirmationScreen;