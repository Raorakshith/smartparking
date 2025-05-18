// src/screens/user/CheckoutScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

import AppHeader from '../../components/common/AppHeader';
import Button from '../../components/common/Button';

const CheckoutScreen = ({ route, navigation }) => {
  const { bookingId } = route.params;
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [actualDuration, setActualDuration] = useState(0);
  const [finalCost, setFinalCost] = useState(0);
  const [additionalCost, setAdditionalCost] = useState(0);
  
  useEffect(() => {
    fetchBookingDetails();
  }, []);
  
  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    const date = timestamp.toDate();
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };
  
  // Calculate time difference in hours
  const calculateHours = (start, end) => {
    const diffInMs = end - start;
    return diffInMs / (1000 * 60 * 60);
  };
  
  // Fetch booking details
  const fetchBookingDetails = async () => {
    try {
      const bookingDoc = await firestore()
        .collection('bookings')
        .doc(bookingId)
        .get();
      
      if (!bookingDoc.exists) {
        Alert.alert('Error', 'Booking not found');
        navigation.goBack();
        return;
      }
      
      const bookingData = {
        id: bookingDoc.id,
        ...bookingDoc.data(),
      };
      
      setBooking(bookingData);
      
      // Calculate actual parking duration until now
      const startTime = bookingData.startTime.toDate();
      const currentTime = new Date();
      const endTime = bookingData.endTime.toDate();
      
      // If current time is before the endTime, calculate based on current time
      // Otherwise use the original endTime (no overtime)
      const checkoutTime = currentTime < endTime ? currentTime : endTime;
      
      const originalDuration = bookingData.duration;
      const actualDuration = parseFloat(calculateHours(startTime, checkoutTime).toFixed(2));
      
      setActualDuration(actualDuration);
      
      // Calculate costs
      const hourlyRate = bookingData.totalCost / originalDuration;
      const calculatedCost = parseFloat((actualDuration * hourlyRate).toFixed(2));
      const additionalCost = 0; // No additional cost if checking out early or on time
      
      // If checking out late (after endTime)
      if (currentTime > endTime) {
        const overtimeHours = parseFloat(calculateHours(endTime, currentTime).toFixed(2));
        const overtimeCost = parseFloat((overtimeHours * hourlyRate * 1.5).toFixed(2)); // 1.5x rate for overtime
        setAdditionalCost(overtimeCost);
        setFinalCost(bookingData.totalCost + overtimeCost);
      } else {
        setFinalCost(calculatedCost);
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
      Alert.alert('Error', 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle checkout process
  const handleCheckout = async () => {
    setProcessing(true);
    
    try {
      // Update the booking in Firestore
      await firestore()
        .collection('bookings')
        .doc(bookingId)
        .update({
          status: 'completed',
          actualEndTime: firestore.FieldValue.serverTimestamp(),
          actualDuration: actualDuration,
          additionalCost: additionalCost,
          finalCost: finalCost,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
      
      // Update parking spot availability
      await firestore()
        .collection('parkingSpots')
        .doc(booking.parkingSpotId)
        .update({
          isAvailable: true,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
      
      // Navigate to checkout success screen
      navigation.navigate('CheckoutSuccess', {
        bookingId: bookingId,
        parkingSpotName: booking.parkingSpotName,
        duration: actualDuration,
        totalCost: finalCost,
        additionalCost: additionalCost,
      });
    } catch (error) {
      console.error('Error processing checkout:', error);
      Alert.alert('Error', 'Failed to process checkout. Please try again.');
      setProcessing(false);
    }
  };
  
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AppHeader 
          title="Checkout" 
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A80F0" />
          <Text style={styles.loadingText}>Loading booking details...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // Determine if this is an early, on-time, or late checkout
  const currentTime = new Date();
  const endTime = booking.endTime.toDate();
  const checkoutStatus = currentTime > endTime ? 'late' : (
    currentTime < endTime ? 'early' : 'on-time'
  );
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader 
        title="Checkout" 
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />
      
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Booking Summary</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: '#4A80F0' }
              ]}
            >
              <Text style={styles.statusText}>Active</Text>
            </View>
          </View>
          
          <View style={styles.parkingDetails}>
            <Icon name="local-parking" size={24} color="#4A80F0" />
            <View style={styles.parkingInfo}>
              <Text style={styles.parkingName}>{booking.parkingSpotName}</Text>
              <Text style={styles.bookingId}>Booking ID: {booking.id}</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.timeDetails}>
            <View style={styles.timeRow}>
              <Text style={styles.timeLabel}>Start Time:</Text>
              <Text style={styles.timeValue}>{formatDate(booking.startTime)}</Text>
            </View>
            
            <View style={styles.timeRow}>
              <Text style={styles.timeLabel}>Booked Until:</Text>
              <Text style={styles.timeValue}>{formatDate(booking.endTime)}</Text>
            </View>
            
            <View style={styles.timeRow}>
              <Text style={styles.timeLabel}>Current Time:</Text>
              <Text style={styles.timeValue}>
                {new Date().toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}
              </Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.costBreakdown}>
            <Text style={styles.breakdownTitle}>Cost Breakdown</Text>
            
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Original Booking:</Text>
              <Text style={styles.costValue}>${booking.totalCost.toFixed(2)}</Text>
            </View>
            
            {checkoutStatus === 'late' && additionalCost > 0 && (
              <View style={styles.costRow}>
                <Text style={styles.costLabel}>Late Fee:</Text>
                <Text style={[styles.costValue, styles.extraCost]}>
                  +${additionalCost.toFixed(2)}
                </Text>
              </View>
            )}
            
            {checkoutStatus === 'early' && (
              <View style={styles.costRow}>
                <Text style={styles.costLabel}>Actual Usage:</Text>
                <Text style={styles.costValue}>
                  ${finalCost.toFixed(2)}
                </Text>
              </View>
            )}
            
            <View style={styles.divider} />
            
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount:</Text>
              <Text style={styles.totalValue}>${finalCost.toFixed(2)}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.checkoutInfo}>
          <View
            style={[
              styles.checkoutStatusContainer,
              checkoutStatus === 'late' 
                ? styles.lateCheckout 
                : checkoutStatus === 'early' 
                  ? styles.earlyCheckout 
                  : styles.onTimeCheckout
            ]}
          >
            <Icon 
              name={
                checkoutStatus === 'late' 
                  ? 'schedule' 
                  : checkoutStatus === 'early' 
                    ? 'timelapse' 
                    : 'check-circle'
              } 
              size={24} 
              color="#FFFFFF" 
            />
            <Text style={styles.checkoutStatusText}>
              {checkoutStatus === 'late' 
                ? 'Late Checkout' 
                : checkoutStatus === 'early' 
                  ? 'Early Checkout' 
                  : 'On-time Checkout'}
            </Text>
          </View>
          
          <Text style={styles.checkoutDescription}>
            {checkoutStatus === 'late' 
              ? 'You are checking out after your booking end time. A late fee has been applied.' 
              : checkoutStatus === 'early' 
                ? 'You are checking out before your booking end time. You will only be charged for the time used.' 
                : 'You are checking out on time. Thank you for using our service!'}
          </Text>
        </View>
        
        <Button
          title={processing ? 'Processing...' : 'Complete Checkout'}
          onPress={handleCheckout}
          loading={processing}
          style={styles.checkoutButton}
        />
        
        <Button
          title="Cancel"
          onPress={() => navigation.goBack()}
          variant="outline"
          style={styles.cancelButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  container: {
    padding: 16,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
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
  parkingDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  parkingInfo: {
    marginLeft: 12,
  },
  parkingName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  bookingId: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 16,
  },
  timeDetails: {
    marginBottom: 8,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  timeLabel: {
    fontSize: 14,
    color: '#666',
  },
  timeValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  costBreakdown: {
    marginBottom: 8,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  costLabel: {
    fontSize: 14,
    color: '#666',
  },
  costValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  extraCost: {
    color: '#F44336',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A80F0',
  },
  checkoutInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  checkoutStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  earlyCheckout: {
    backgroundColor: '#4CAF50',
  },
  onTimeCheckout: {
    backgroundColor: '#4A80F0',
  },
  lateCheckout: {
    backgroundColor: '#F44336',
  },
  checkoutStatusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  checkoutDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  checkoutButton: {
    marginBottom: 12,
  },
  cancelButton: {},
});

export default CheckoutScreen;