// src/screens/user/BookingScreen.js
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
import { Card, Title, Paragraph, Button, Modal, Portal } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../context/AuthContext';
import BookingService from '../../services/BookingService';
import ParkingMap from '../../components/booking/ParkingMap';
import SpotSelector from '../../components/booking/SpotSelector';

const BookingScreen = ({ navigation, route }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [parkingLots, setParkingLots] = useState([]);
  const [selectedLot, setSelectedLot] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedStartTime, setSelectedStartTime] = useState(new Date());
  const [selectedEndTime, setSelectedEndTime] = useState(new Date(new Date().setHours(new Date().getHours() + 1)));
  const [availableSpots, setAvailableSpots] = useState([]);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);
  const [isSpotSelectorVisible, setIsSpotSelectorVisible] = useState(false);
  const [totalCost, setTotalCost] = useState(0);

  // Initialize with route params if available
  useEffect(() => {
    if (route.params?.selectedLot) {
      setSelectedLot(route.params.selectedLot);
    }
    
    fetchParkingLots();
  }, [route.params]);

  // Calculate total cost when times or spot changes
  useEffect(() => {
    if (selectedLot && selectedStartTime && selectedEndTime) {
      calculateTotalCost();
    }
  }, [selectedLot, selectedStartTime, selectedEndTime, selectedSpot]);

  // Fetch all parking lots
  const fetchParkingLots = async () => {
    setLoading(true);
    try {
      const lots = await BookingService.getAllParkingLots();
      setParkingLots(lots);
      
      // If we have a lot from route params, find it in the fetched lots
      if (route.params?.selectedLot) {
        const lot = lots.find(l => l.id === route.params.selectedLot.id);
        if (lot) {
          setSelectedLot(lot);
        }
      }
    } catch (error) {
      console.error('Error fetching parking lots:', error);
      Alert.alert('Error', 'Failed to load parking lots.');
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format time for display
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Handle date change
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      // Keep the time from the existing date but update the day
      const updatedDate = new Date(selectedDate);
      
      // Update start time
      const newStartTime = new Date(selectedDate);
      newStartTime.setHours(selectedStartTime.getHours());
      newStartTime.setMinutes(selectedStartTime.getMinutes());
      setSelectedStartTime(newStartTime);
      
      // Update end time
      const newEndTime = new Date(selectedDate);
      newEndTime.setHours(selectedEndTime.getHours());
      newEndTime.setMinutes(selectedEndTime.getMinutes());
      setSelectedEndTime(newEndTime);
      
      setSelectedDate(updatedDate);
      checkAvailableSpots();
    }
  };

  // Handle start time change
  const onStartTimeChange = (event, selectedTime) => {
    setShowStartTimePicker(false);
    if (selectedTime) {
      // Ensure start time is not after end time
      if (selectedTime >= selectedEndTime) {
        // If it is, set end time to start time + 1 hour
        const newEndTime = new Date(selectedTime);
        newEndTime.setHours(selectedTime.getHours() + 1);
        setSelectedEndTime(newEndTime);
      }
      setSelectedStartTime(selectedTime);
      checkAvailableSpots();
    }
  };

  // Handle end time change
  const onEndTimeChange = (event, selectedTime) => {
    setShowEndTimePicker(false);
    if (selectedTime) {
      // Ensure end time is after start time
      if (selectedTime <= selectedStartTime) {
        Alert.alert('Invalid Time', 'End time must be after start time.');
        return;
      }
      setSelectedEndTime(selectedTime);
      checkAvailableSpots();
    }
  };

  // Check available spots for selected date and time
  const checkAvailableSpots = async () => {
    if (!selectedLot) return;
    
    setLoading(true);
    try {
      // Format date and times for the API
      const dateStr = selectedDate.toISOString().split('T')[0];
      const startTimeStr = `${selectedStartTime.getHours().toString().padStart(2, '0')}:${selectedStartTime.getMinutes().toString().padStart(2, '0')}`;
      const endTimeStr = `${selectedEndTime.getHours().toString().padStart(2, '0')}:${selectedEndTime.getMinutes().toString().padStart(2, '0')}`;
      
      const spots = await BookingService.getAvailableSpots(
        selectedLot.id,
        dateStr,
        startTimeStr,
        endTimeStr
      );
      
      setAvailableSpots(spots);
      setSelectedSpot(null); // Reset selected spot
    } catch (error) {
      console.error('Error checking available spots:', error);
      Alert.alert('Error', 'Failed to check available spots.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate total cost
  const calculateTotalCost = () => {
    if (!selectedLot || !selectedStartTime || !selectedEndTime) return;
    
    const hourlyRate = selectedLot.hourlyRate || 0;
    const timeInHours = (selectedEndTime - selectedStartTime) / (1000 * 60 * 60);
    const cost = hourlyRate * timeInHours;
    
    setTotalCost(cost);
  };

  // Handle spot selection
  const handleSpotSelection = (spot) => {
    setSelectedSpot(spot);
    setIsSpotSelectorVisible(false);
  };

  // Proceed to payment
  const proceedToPayment = async () => {
    if (!selectedLot || !selectedSpot) {
      Alert.alert('Selection Required', 'Please select a parking lot and spot.');
      return;
    }
    
    try {
      // Format date and times for the API
      const dateStr = selectedDate.toISOString().split('T')[0];
      const startTimeStr = `${selectedStartTime.getHours().toString().padStart(2, '0')}:${selectedStartTime.getMinutes().toString().padStart(2, '0')}`;
      const endTimeStr = `${selectedEndTime.getHours().toString().padStart(2, '0')}:${selectedEndTime.getMinutes().toString().padStart(2, '0')}`;
      
      // Create temporary reservation
      const reservationId = await BookingService.temporaryReservation(
        currentUser.uid,
        selectedLot.id,
        selectedSpot.id,
        dateStr,
        startTimeStr,
        endTimeStr
      );
      
      // Navigate to payment screen with reservation details
      navigation.navigate('Payment', {
        reservationId,
        selectedLot,
        selectedSpot,
        selectedDate: dateStr,
        startTime: startTimeStr,
        endTime: endTimeStr,
        totalCost
      });
    } catch (error) {
      console.error('Error creating reservation:', error);
      Alert.alert('Reservation Failed', error.message || 'Failed to create reservation.');
    }
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
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Parking Lot Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Parking Lot</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {parkingLots.map((lot) => (
              <TouchableOpacity
                key={lot.id}
                onPress={() => {
                  setSelectedLot(lot);
                  setSelectedSpot(null);
                  checkAvailableSpots();
                }}
              >
                <Card
                  style={[
                    styles.lotCard,
                    selectedLot?.id === lot.id && styles.selectedLotCard,
                  ]}
                >
                  <Card.Content>
                    <Title style={styles.lotName}>{lot.name}</Title>
                    <Paragraph style={styles.lotInfo}>{lot.location}</Paragraph>
                    <View style={styles.lotDetails}>
                      <Text style={styles.lotDetail}>
                        <Icon name="car-multiple" size={14} /> {lot.totalSpots} spots
                      </Text>
                      <Text style={styles.lotDetail}>
                        <Icon name="currency-usd" size={14} /> ${lot.hourlyRate}/hr
                      </Text>
                    </View>
                  </Card.Content>
                </Card>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {selectedLot && (
            <TouchableOpacity
              style={styles.mapButton}
              onPress={() => setIsMapModalVisible(true)}
            >
              <Icon name="map-marker" size={16} color="#4285F4" />
              <Text style={styles.mapButtonText}>View on Map</Text>
            </TouchableOpacity>
          )}
        </View>

        {selectedLot && (
          <>
            {/* Date and Time Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select Date & Time</Text>
              <Card style={styles.dateTimeCard}>
                <Card.Content>
                  <TouchableOpacity
                    style={styles.datePickerButton}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Icon name="calendar" size={24} color="#4285F4" />
                    <Text style={styles.dateTimeText}>
                      {formatDate(selectedDate)}
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.timeContainer}>
                    <TouchableOpacity
                      style={styles.timePickerButton}
                      onPress={() => setShowStartTimePicker(true)}
                    >
                      <Icon name="clock-start" size={24} color="#4285F4" />
                      <Text style={styles.dateTimeText}>
                        {formatTime(selectedStartTime)}
                      </Text>
                    </TouchableOpacity>

                    <Text style={styles.toText}>to</Text>

                    <TouchableOpacity
                      style={styles.timePickerButton}
                      onPress={() => setShowEndTimePicker(true)}
                    >
                      <Icon name="clock-end" size={24} color="#4285F4" />
                      <Text style={styles.dateTimeText}>
                        {formatTime(selectedEndTime)}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <Button
                    mode="contained"
                    onPress={checkAvailableSpots}
                    style={styles.checkButton}
                  >
                    Check Availability
                  </Button>
                </Card.Content>
              </Card>

              {/* Date and Time Pickers (Hidden by default) */}
              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  is24Hour={false}
                  display="default"
                  onChange={onDateChange}
                  minimumDate={new Date()}
                />
              )}

              {showStartTimePicker && (
                <DateTimePicker
                  value={selectedStartTime}
                  mode="time"
                  is24Hour={false}
                  display="default"
                  onChange={onStartTimeChange}
                />
              )}

              {showEndTimePicker && (
                <DateTimePicker
                  value={selectedEndTime}
                  mode="time"
                  is24Hour={false}
                  display="default"
                  onChange={onEndTimeChange}
                />
              )}
            </View>

            {/* Spot Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select Parking Spot</Text>
              {availableSpots.length > 0 ? (
                <>
                  <Card style={styles.spotCard}>
                    <Card.Content>
                      <Paragraph>
                        {availableSpots.length} spots available for the selected time
                      </Paragraph>
                      {selectedSpot ? (
                        <View style={styles.selectedSpotContainer}>
                          <Icon name="car-hatchback" size={24} color="#4285F4" />
                          <Text style={styles.selectedSpotText}>
                            Spot {selectedSpot.id} selected
                          </Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.selectSpotButton}
                          onPress={() => setIsSpotSelectorVisible(true)}
                        >
                          <Text style={styles.selectSpotText}>Choose a Spot</Text>
                        </TouchableOpacity>
                      )}
                    </Card.Content>
                  </Card>
                </>
              ) : (
                <Card style={styles.noSpotsCard}>
                  <Card.Content>
                    <View style={styles.noSpotsContainer}>
                      <Icon name="car-off" size={40} color="#ccc" />
                      <Text style={styles.noSpotsText}>
                        No spots available for the selected time
                      </Text>
                      <Text style={styles.noSpotsSubtext}>
                        Please select a different time or date
                      </Text>
                    </View>
                  </Card.Content>
                </Card>
              )}
            </View>

            {/* Booking Summary */}
            {selectedSpot && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Booking Summary</Text>
                <Card style={styles.summaryCard}>
                  <Card.Content>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Parking Lot:</Text>
                      <Text style={styles.summaryValue}>{selectedLot.name}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Spot:</Text>
                      <Text style={styles.summaryValue}>{selectedSpot.id}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Date:</Text>
                      <Text style={styles.summaryValue}>{formatDate(selectedDate)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Time:</Text>
                      <Text style={styles.summaryValue}>
                        {formatTime(selectedStartTime)} - {formatTime(selectedEndTime)}
                      </Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Duration:</Text>
                      <Text style={styles.summaryValue}>
                        {((selectedEndTime - selectedStartTime) / (1000 * 60 * 60)).toFixed(1)} hours
                      </Text>
                    </View>
                    <View style={styles.summaryTotalRow}>
                      <Text style={styles.summaryTotalLabel}>Total Cost:</Text>
                      <Text style={styles.summaryTotalValue}>${totalCost.toFixed(2)}</Text>
                    </View>
                  </Card.Content>
                </Card>

                <Button
                  mode="contained"
                  onPress={proceedToPayment}
                  style={styles.proceedButton}
                >
                  Proceed to Payment
                </Button>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Map Modal */}
      <Portal>
        <Modal
          visible={isMapModalVisible}
          onDismiss={() => setIsMapModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Parking Map</Text>
            <TouchableOpacity onPress={() => setIsMapModalVisible(false)}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          {selectedLot && (
            <ParkingMap parkingLot={selectedLot} />
          )}
        </Modal>
      </Portal>

      {/* Spot Selector Modal */}
      <Portal>
        <Modal
          visible={isSpotSelectorVisible}
          onDismiss={() => setIsSpotSelectorVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select a Spot</Text>
            <TouchableOpacity onPress={() => setIsSpotSelectorVisible(false)}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          {availableSpots.length > 0 && (
            <SpotSelector
              spots={availableSpots}
              onSelectSpot={handleSpotSelection}
            />
          )}
        </Modal>
      </Portal>
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
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  lotCard: {
    width: 200,
    marginRight: 12,
    elevation: 2,
  },
  selectedLotCard: {
    borderColor: '#4285F4',
    borderWidth: 2,
  },
  lotName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  lotInfo: {
    fontSize: 14,
    color: '#666',
  },
  lotDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  lotDetail: {
    fontSize: 12,
    color: '#666',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  mapButtonText: {
    color: '#4285F4',
    marginLeft: 4,
  },
  dateTimeCard: {
    elevation: 2,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },
  timePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateTimeText: {
    marginLeft: 10,
    fontSize: 16,
  },
  toText: {
    color: '#666',
  },
  checkButton: {
    marginTop: 10,
    backgroundColor: '#4285F4',
  },
  spotCard: {
    elevation: 2,
  },
  selectedSpotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f2ff',
    padding: 10,
    borderRadius: 4,
    marginTop: 10,
  },
  selectedSpotText: {
    marginLeft: 10,
    fontWeight: 'bold',
    color: '#4285F4',
  },
  selectSpotButton: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 10,
  },
  selectSpotText: {
    color: '#4285F4',
    fontWeight: 'bold',
  },
  noSpotsCard: {
    elevation: 2,
    backgroundColor: '#f9f9f9',
  },
  noSpotsContainer: {
    alignItems: 'center',
    padding: 20,
  },
  noSpotsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 10,
  },
  noSpotsSubtext: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
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
  proceedButton: {
    marginTop: 16,
    backgroundColor: '#4285F4',
    paddingVertical: 8,
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 8,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default BookingScreen;