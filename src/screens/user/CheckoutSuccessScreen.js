// src/screens/user/CheckoutSuccessScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import Button from '../../components/common/Button';

const CheckoutSuccessScreen = ({ route, navigation }) => {
  const { 
    bookingId, 
    parkingSpotName, 
    duration, 
    totalCost, 
    additionalCost 
  } = route.params;
  
  const formattedDuration = () => {
    if (duration < 1) {
      const minutes = Math.round(duration * 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    
    const hours = Math.floor(duration);
    const minutes = Math.round((duration - hours) * 60);
    
    if (minutes === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    
    return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
  };
  
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.successContainer}>
          <View style={styles.iconCircle}>
            <Icon name="check" size={40} color="#FFFFFF" />
          </View>
          
          <Text style={styles.successTitle}>Checkout Complete!</Text>
          <Text style={styles.successText}>
            Thank you for using our parking service.
          </Text>
        </View>
        
        <View style={styles.receiptCard}>
          <View style={styles.receiptHeader}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/parking-logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.companyName}>Campus Parking</Text>
            </View>
            
            <Text style={styles.receiptTitle}>Parking Receipt</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.receiptDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Parking Location:</Text>
              <Text style={styles.detailValue}>{parkingSpotName}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date:</Text>
              <Text style={styles.detailValue}>{currentDate}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Checkout Time:</Text>
              <Text style={styles.detailValue}>{currentTime}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Duration:</Text>
              <Text style={styles.detailValue}>{formattedDuration()}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Base Amount:</Text>
              <Text style={styles.detailValue}>${(totalCost - additionalCost).toFixed(2)}</Text>
            </View>
            
            {additionalCost > 0 && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Additional Charges:</Text>
                <Text style={[styles.detailValue, styles.additionalCharges]}>
                  ${additionalCost.toFixed(2)}
                </Text>
              </View>
            )}
            
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>${totalCost.toFixed(2)}</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.noteContainer}>
            <Text style={styles.noteText}>
              Thank you for choosing Campus Parking. Your payment has been processed successfully.
            </Text>
            <Text style={styles.bookingReference}>
              Reference: {bookingId.substring(0, 8).toUpperCase()}
            </Text>
          </View>
        </View>
        
        <View style={styles.buttonsContainer}>
          <Button
            title="Download Receipt"
            onPress={() => Alert.alert('Info', 'Receipt download functionality would be implemented here.')}
            style={styles.downloadButton}
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
  receiptCard: {
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
  receiptHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  logo: {
    width: 60,
    height: 60,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A80F0',
    marginTop: 4,
  },
  receiptTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 16,
  },
  receiptDetails: {},
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    textAlign: 'right',
  },
  additionalCharges: {
    color: '#F44336',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A80F0',
  },
  noteContainer: {
    alignItems: 'center',
  },
  noteText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  bookingReference: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  buttonsContainer: {
    flexDirection: 'column',
    gap: 12,
  },
  downloadButton: {
    marginBottom: 12,
  },
  mapButton: {},
});

export default CheckoutSuccessScreen;