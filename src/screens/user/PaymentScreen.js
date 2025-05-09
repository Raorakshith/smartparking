// src/screens/user/PaymentScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Card, Title, TextInput, Button, RadioButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import BookingService from '../../services/BookingService';

const PaymentScreen = ({ navigation, route }) => {
  const { currentUser } = useAuth();
  
  // Get booking details from route params
  const {
    reservationId,
    selectedLot,
    selectedSpot,
    selectedDate,
    startTime,
    endTime,
    totalCost
  } = route.params || {};

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  
  // Form validation state
  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

  // Countdown timer for temporary reservation (5 minutes)
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          handleReservationExpired();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format countdown time
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Handle reservation expiration
  const handleReservationExpired = () => {
    Alert.alert(
      'Reservation Expired',
      'Your temporary reservation has expired. Please start a new booking.',
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Book')
        }
      ]
    );
  };

  // Validate form on input change
  useEffect(() => {
    validateForm();
  }, [cardNumber, cardName, expiryDate, cvv]);

  // Validate payment form
  const validateForm = () => {
    let errors = {};
    let formIsValid = true;

    // Only validate card details if card payment method is selected
    if (paymentMethod === 'card') {
      // Validate card number (16 digits, can have spaces)
      const cardNumberClean = cardNumber.replace(/\s/g, '');
      if (!cardNumberClean) {
        errors.cardNumber = 'Card number is required';
        formIsValid = false;
      } else if (!/^\d{16}$/.test(cardNumberClean)) {
        errors.cardNumber = 'Card number must be 16 digits';
        formIsValid = false;
      }

      // Validate card name
      if (!cardName.trim()) {
        errors.cardName = 'Name on card is required';
        formIsValid = false;
      }

      // Validate expiry date (MM/YY format)
      if (!expiryDate) {
        errors.expiryDate = 'Expiry date is required';
        formIsValid = false;
      } else if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
        errors.expiryDate = 'Use MM/YY format';
        formIsValid = false;
      } else {
        const [month, year] = expiryDate.split('/');
        const currentYear = new Date().getFullYear() % 100; // Get last 2 digits of current year
        const currentMonth = new Date().getMonth() + 1; // January is 0
        
        if (parseInt(month) < 1 || parseInt(month) > 12) {
          errors.expiryDate = 'Invalid month';
          formIsValid = false;
        } else if (parseInt(year) < currentYear || 
                  (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
          errors.expiryDate = 'Card has expired';
          formIsValid = false;
        }
      }

      // Validate CVV (3 or 4 digits)
      if (!cvv) {
        errors.cvv = 'CVV is required';
        formIsValid = false;
      } else if (!/^\d{3,4}$/.test(cvv)) {
        errors.cvv = 'CVV must be 3 or 4 digits';
        formIsValid = false;
      }
    }

    setErrors(errors);
    setIsFormValid(formIsValid);
  };

  // Format card number as user types (add spaces)
  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\s/g, '');
    let formatted = '';
    
    for (let i = 0; i < cleaned.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += ' ';
      }
      formatted += cleaned[i];
    }
    
    return formatted;
  };

  // Format expiry date as user types (add slash)
  const formatExpiryDate = (text) => {
    const cleaned = text.replace(/\//g, '');
    if (cleaned.length > 2) {
      return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
    }
    return cleaned;
  };

  // Handle payment submission
  const handlePayment = async () => {
    if (paymentMethod === 'card' && !isFormValid) {
      Alert.alert('Form Error', 'Please fix all errors before submitting');
      return;
    }

    setLoading(true);

    try {
      // In a real app, you would integrate with a payment gateway here
      // For this demo, we'll just mock a successful payment
      
      // Create payment details object
      const paymentDetails = {
        method: paymentMethod,
        timestamp: new Date().toISOString(),
        amount: totalCost,
        // Only include masked card details for demo purposes
        // In a real app, you would use a secure payment token
        ...(paymentMethod === 'card' && {
          cardLast4: cardNumber.slice(-4),
          cardExpiry: expiryDate,
        }),
      };

      // Confirm the booking with payment details
      await BookingService.confirmBooking(reservationId, paymentDetails);

      // Navigate to confirmation screen
      navigation.navigate('Confirmation', {
        bookingId: reservationId,
        paymentDetails,
      });
    } catch (error) {
      console.error('Payment failed:', error);
      Alert.alert('Payment Failed', error.message || 'Failed to process payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Render payment form based on selected method
  const renderPaymentForm = () => {
    switch (paymentMethod) {
      case 'card':
        return (
          <View style={styles.cardForm}>
            <TextInput
              label="Card Number"
              value={cardNumber}
              onChangeText={(text) => setCardNumber(formatCardNumber(text))}
              keyboardType="numeric"
              maxLength={19} // 16 digits + 3 spaces
              style={styles.input}
              error={!!errors.cardNumber}
            />
            {errors.cardNumber && <Text style={styles.errorText}>{errors.cardNumber}</Text>}

            <TextInput
              label="Name on Card"
              value={cardName}
              onChangeText={setCardName}
              style={styles.input}
              error={!!errors.cardName}
            />
            {errors.cardName && <Text style={styles.errorText}>{errors.cardName}</Text>}

            <View style={styles.row}>
              <View style={styles.column}>
                <TextInput
                  label="Expiry Date (MM/YY)"
                  value={expiryDate}
                  onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                  keyboardType="numeric"
                  maxLength={5} // MM/YY
                  style={styles.input}
                  error={!!errors.expiryDate}
                />
                {errors.expiryDate && <Text style={styles.errorText}>{errors.expiryDate}</Text>}
              </View>
              
              <View style={styles.column}>
                <TextInput
                  label="CVV"
                  value={cvv}
                  onChangeText={setCvv}
                  keyboardType="numeric"
                  maxLength={4}
                  style={styles.input}
                  error={!!errors.cvv}
                  secureTextEntry
                />
                {errors.cvv && <Text style={styles.errorText}>{errors.cvv}</Text>}
              </View>
            </View>
          </View>
        );
      
      case 'campus':
        return (
          <View style={styles.campusPayForm}>
            <Text style={styles.campusPayText}>
              Your booking will be charged to your campus account.
            </Text>
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Timer */}
        <View style={styles.timerContainer}>
          <Icon name="timer-outline" size={24} color={timeLeft < 60 ? '#EA4335' : '#4285F4'} />
          <Text style={[
            styles.timerText,
            timeLeft < 60 && styles.timerWarning
          ]}>
            Reservation expires in {formatTime(timeLeft)}
          </Text>
        </View>

        {/* Booking Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Summary</Text>
          <Card style={styles.summaryCard}>
            <Card.Content>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Parking Lot:</Text>
                <Text style={styles.summaryValue}>{selectedLot?.name}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Spot:</Text>
                <Text style={styles.summaryValue}>{selectedSpot?.id}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Date:</Text>
                <Text style={styles.summaryValue}>{selectedDate}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Time:</Text>
                <Text style={styles.summaryValue}>{startTime} - {endTime}</Text>
              </View>
              <View style={styles.summaryTotalRow}>
                <Text style={styles.summaryTotalLabel}>Total Cost:</Text>
                <Text style={styles.summaryTotalValue}>${totalCost.toFixed(2)}</Text>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <Card style={styles.paymentMethodsCard}>
            <RadioButton.Group 
              onValueChange={value => setPaymentMethod(value)} 
              value={paymentMethod}
            >
              <View style={styles.paymentOption}>
                <RadioButton value="card" />
                <Icon name="credit-card" size={24} color="#333" style={styles.paymentIcon} />
                <Text style={styles.paymentText}>Credit/Debit Card</Text>
              </View>
              
              <View style={styles.paymentOption}>
                <RadioButton value="campus" />
                <Icon name="school" size={24} color="#333" style={styles.paymentIcon} />
                <Text style={styles.paymentText}>Campus Account</Text>
              </View>
            </RadioButton.Group>
          </Card>
        </View>

        {/* Payment Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Details</Text>
          <Card style={styles.paymentFormCard}>
            <Card.Content>
              {renderPaymentForm()}
            </Card.Content>
          </Card>
        </View>

        {/* Pay Button */}
        <Button
          mode="contained"
          onPress={handlePayment}
          style={styles.payButton}
          disabled={loading || (paymentMethod === 'card' && !isFormValid)}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            `Pay $${totalCost.toFixed(2)}`
          )}
        </Button>

        {/* Cancel Button */}
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.cancelButton}
          disabled={loading}
        >
          Cancel
        </Button>
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
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  timerText: {
    marginLeft: 8,
    fontWeight: 'bold',
    color: '#4285F4',
  },
  timerWarning: {
    color: '#EA4335',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  summaryCard: {
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  summaryTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginTop: 4,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4285F4',
  },
  paymentMethodsCard: {
    elevation: 2,
    padding: 8,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  paymentIcon: {
    marginRight: 8,
  },
  paymentText: {
    fontSize: 16,
  },
  paymentFormCard: {
    elevation: 2,
  },
  cardForm: {
    paddingVertical: 8,
  },
  input: {
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: -4,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    flex: 1,
    marginRight: 8,
  },
  campusPayForm: {
    padding: 16,
    alignItems: 'center',
  },
  campusPayText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  payButton: {
    marginBottom: 12,
    backgroundColor: '#4285F4',
    paddingVertical: 8,
  },
  cancelButton: {
    borderColor: '#EA4335',
    paddingVertical: 8,
  },
});

export default PaymentScreen;