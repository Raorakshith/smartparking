// src/screens/user/BookingScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialIcons';

import AppHeader from '../../components/common/AppHeader';
import Button from '../../components/common/Button';

const BookingScreen = ({ route, navigation }) => {
  const { parkingSpot } = route.params;
  const user = auth().currentUser;
  
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(new Date().getTime() + 60 * 60 * 1000)); // 1 hour later
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [duration, setDuration] = useState(1); // duration in hours
  const [totalCost, setTotalCost] = useState(parkingSpot.price); // Initial cost for 1 hour
  
  // Calculate time difference and update duration and cost
  const updateDurationAndCost = (start, end) => {
    const diffInMs = end - start;
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const roundedDuration = Math.max(Math.ceil(diffInHours * 2) / 2, 0.5); // Round to nearest 0.5 hour with minimum 0.5 hour
    
    setDuration(roundedDuration);
    setTotalCost(roundedDuration * parkingSpot.price);
  };
  
  // Handle start date change
  const handleStartDateChange = (date) => {
    if (date >= new Date()) {
      // If new start date is after end date, update end date
      if (date > endDate) {
        const newEndDate = new Date(date.getTime() + 60 * 60 * 1000); // 1 hour after start
        setEndDate(newEndDate);
        updateDurationAndCost(date, newEndDate);
      } else {
        updateDurationAndCost(date, endDate);
      }
      setStartDate(date);
    } else {
      Alert.alert('Invalid Time', 'Start time must be in the future.');
    }
    setShowStartPicker(false);
  };
  
  // Handle end date change
  const handleEndDateChange = (date) => {
    if (date > startDate) {
      setEndDate(date);
      updateDurationAndCost(startDate, date);
    } else {
      Alert.alert('Invalid Time', 'End time must be after start time.');
    }
    setShowEndPicker(false);
  };
  
  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };
  
  // Handle booking continuation
  const handleProceedToPayment = () => {
    const bookingData = {
      parkingSpotId: parkingSpot.id,
      parkingSpotName: parkingSpot.name,
      userId: user.uid,
      userEmail: user.email,
      userName: user.displayName,
      startTime: firestore.Timestamp.fromDate(startDate),
      endTime: firestore.Timestamp.fromDate(endDate),
      duration: duration,
      totalCost: totalCost,
      status: 'pending', // pending, confirmed, completed, cancelled
      createdAt: firestore.FieldValue.serverTimestamp(),
    };
    
    navigation.navigate('Payment', { bookingData });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader 
        title="Booking Details" 
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.spotCard}>
          <View style={styles.spotInfo}>
            <Icon name="local-parking" size={40} color="#4A80F0" style={styles.spotIcon} />
            <View>
              <Text style={styles.spotName}>{parkingSpot.name}</Text>
              <Text style={styles.spotLocation}>{parkingSpot.location}</Text>
            </View>
          </View>
          
          <View style={styles.priceTag}>
            <Text style={styles.priceText}>${parkingSpot.price}/hr</Text>
          </View>
        </View>
        
        <View style={styles.timeSelectionContainer}>
          <Text style={styles.sectionTitle}>Select Time</Text>
          
          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>Start Time</Text>
            <TouchableOpacity 
              style={styles.timeSelector}
              onPress={() => setShowStartPicker(true)}
            >
              <Text style={styles.timeText}>{formatDate(startDate)}</Text>
              <Icon name="access-time" size={20} color="#4A80F0" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>End Time</Text>
            <TouchableOpacity 
              style={styles.timeSelector}
              onPress={() => setShowEndPicker(true)}
            >
              <Text style={styles.timeText}>{formatDate(endDate)}</Text>
              <Icon name="access-time" size={20} color="#4A80F0" />
            </TouchableOpacity>
          </View>
          
          {/* Duration display */}
          <View style={styles.durationContainer}>
            <Text style={styles.durationLabel}>Duration:</Text>
            <Text style={styles.durationValue}>
              {duration === 1 ? '1 hour' : `${duration} hours`}
            </Text>
          </View>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.summaryContainer}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Parking Fee</Text>
            <Text style={styles.summaryValue}>${parkingSpot.price.toFixed(2)} x {duration} hours</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Service Fee</Text>
            <Text style={styles.summaryValue}>$1.00</Text>
          </View>
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${(totalCost + 1).toFixed(2)}</Text>
          </View>
        </View>
        
        <Button
          title="Proceed to Payment"
          onPress={handleProceedToPayment}
          style={styles.proceedButton}
        />
      </ScrollView>
      
      {/* Date Pickers */}
      <DatePicker
        modal
        open={showStartPicker}
        date={startDate}
        onConfirm={handleStartDateChange}
        onCancel={() => setShowStartPicker(false)}
        mode="datetime"
        minimumDate={new Date()}
      />
      
      <DatePicker
        modal
        open={showEndPicker}
        date={endDate}
        onConfirm={handleEndDateChange}
        onCancel={() => setShowEndPicker(false)}
        mode="datetime"
        minimumDate={new Date(startDate.getTime() + 30 * 60 * 1000)} // Minimum 30 minutes after start
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  spotCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F8FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  spotInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spotIcon: {
    marginRight: 12,
  },
  spotName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  spotLocation: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  priceTag: {
    backgroundColor: '#4A80F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  priceText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  timeSelectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeLabel: {
    fontSize: 16,
    color: '#666',
  },
  timeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F8FF',
    borderRadius: 8,
    padding: 12,
  },
  timeText: {
    fontSize: 14,
    color: '#333',
    marginRight: 8,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF3FF',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  durationLabel: {
    fontSize: 16,
    color: '#666',
    marginRight: 8,
  },
  durationValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A80F0',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
  },
  summaryContainer: {
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    color: '#333',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A80F0',
  },
  proceedButton: {
    marginTop: 8,
  },
});

export default BookingScreen;