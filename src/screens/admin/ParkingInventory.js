// src/screens/admin/ParkingInventory.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
  SafeAreaView,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  TextInput,
  FAB,
  Portal,
  Modal,
  Switch,
  IconButton,
  ActivityIndicator,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AdminService from '../../services/AdminService';
import BookingService from '../../services/BookingService';

const ParkingInventory = ({ navigation, route }) => {
  const [loading, setLoading] = useState(true);
  const [parkingLots, setParkingLots] = useState([]);
  const [selectedLot, setSelectedLot] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState(null);
  
  // Form state for adding/editing lot
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    latitude: '',
    longitude: '',
    totalSpots: '',
    hourlyRate: '',
    spots: [],
    isActive: true,
  });

  // Check if route params contain a lot to select
  useEffect(() => {
    if (route.params?.selectedLot) {
      const lot = route.params.selectedLot;
      setSelectedLot(lot);
      
      // Prepare edit form data
      if (lot) {
        setFormData({
          name: lot.name || '',
          location: lot.location || '',
          latitude: lot.latitude ? lot.latitude.toString() : '',
          longitude: lot.longitude ? lot.longitude.toString() : '',
          totalSpots: lot.totalSpots ? lot.totalSpots.toString() : '',
          hourlyRate: lot.hourlyRate ? lot.hourlyRate.toString() : '',
          spots: lot.spots || [],
          isActive: lot.isActive !== false, // Default to true if not specified
        });
      }
    }
    
    // Fetch all parking lots
    fetchParkingLots();
  }, [route.params]);

  // Fetch all parking lots
  const fetchParkingLots = async () => {
    setLoading(true);
    try {
      const lots = await BookingService.getAllParkingLots();
      setParkingLots(lots);
      
      // If no lot is selected and we have lots, select the first one
      if (!selectedLot && lots.length > 0) {
        setSelectedLot(lots[0]);
        // Prepare form data for the first lot
        setFormData({
          name: lots[0].name || '',
          location: lots[0].location || '',
          latitude: lots[0].latitude ? lots[0].latitude.toString() : '',
          longitude: lots[0].longitude ? lots[0].longitude.toString() : '',
          totalSpots: lots[0].totalSpots ? lots[0].totalSpots.toString() : '',
          hourlyRate: lots[0].hourlyRate ? lots[0].hourlyRate.toString() : '',
          spots: lots[0].spots || [],
          isActive: lots[0].isActive !== false,
        });
      }
    } catch (error) {
      console.error('Error fetching parking lots:', error);
      setError('Failed to load parking lots. Please try again.');
      Alert.alert('Error', 'Failed to load parking lots. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle lot selection
  const handleSelectLot = (lot) => {
    setSelectedLot(lot);
    
    // Prepare form data for editing
    setFormData({
      name: lot.name || '',
      location: lot.location || '',
      latitude: lot.latitude ? lot.latitude.toString() : '',
      longitude: lot.longitude ? lot.longitude.toString() : '',
      totalSpots: lot.totalSpots ? lot.totalSpots.toString() : '',
      hourlyRate: lot.hourlyRate ? lot.hourlyRate.toString() : '',
      spots: lot.spots || [],
      isActive: lot.isActive !== false,
    });
  };

  // Show add/edit modal
  const showModal = (edit = false) => {
    // If adding new, reset form
    if (!edit) {
      setFormData({
        name: '',
        location: '',
        latitude: '',
        longitude: '',
        totalSpots: '',
        hourlyRate: '',
        spots: [],
        isActive: true,
      });
    }
    
    setEditMode(edit);
    setModalVisible(true);
  };

  // Hide modal
  const hideModal = () => {
    setModalVisible(false);
  };

  // Handle form input changes
  const handleInputChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Generate parking spots
  const generateSpots = () => {
    const numberOfSpots = parseInt(formData.totalSpots);
    
    if (isNaN(numberOfSpots) || numberOfSpots <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid number of spots.');
      return;
    }
    
    // Generate spots array with IDs and default properties
    const spots = [];
    for (let i = 1; i <= numberOfSpots; i++) {
      spots.push({
        id: `${i}`,
        category: i <= 5 ? 'Premium' : i % 10 === 0 ? 'Handicap' : 'Regular',
        accessibility: i % 10 === 0, // Every 10th spot is accessible
      });
    }
    
    setFormData({
      ...formData,
      spots,
    });
    
    Alert.alert('Success', `${numberOfSpots} parking spots generated.`);
  };

  // Save parking lot (add or update)
  const saveParkingLot = async () => {
    // Validate form
    if (!formData.name || !formData.location || !formData.totalSpots || !formData.hourlyRate) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }
    
    try {
      // Prepare data for API
      const lotData = {
        name: formData.name,
        location: formData.location,
        latitude: parseFloat(formData.latitude) || 0,
        longitude: parseFloat(formData.longitude) || 0,
        totalSpots: parseInt(formData.totalSpots) || 0,
        hourlyRate: parseFloat(formData.hourlyRate) || 0,
        spots: formData.spots,
        isActive: formData.isActive,
      };
      
      // Update or add based on edit mode
      if (editMode && selectedLot) {
        await AdminService.updateParkingLot(selectedLot.id, lotData);
        Alert.alert('Success', 'Parking lot updated successfully.');
      } else {
        const newLotId = await AdminService.addParkingLot(lotData);
        Alert.alert('Success', 'New parking lot added successfully.');
      }
      
      // Refresh data
      fetchParkingLots();
      hideModal();
    } catch (error) {
      console.error('Error saving parking lot:', error);
      Alert.alert('Error', error.message || 'Failed to save parking lot.');
    }
  };

  // Delete parking lot
  const deleteParkingLot = async () => {
    if (!selectedLot) return;
    
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete ${selectedLot.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await AdminService.deleteParkingLot(selectedLot.id);
              Alert.alert('Success', 'Parking lot deleted successfully.');
              
              // Refresh data and select another lot
              fetchParkingLots();
              setSelectedLot(null);
            } catch (error) {
              console.error('Error deleting parking lot:', error);
              Alert.alert('Error', error.message || 'Failed to delete parking lot.');
            }
          },
        },
      ]
    );
  };

  // Render loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
        <Text style={styles.loadingText}>Loading parking inventory...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Parking Lots List */}
        <View style={styles.lotsList}>
          <View style={styles.lotsHeader}>
            <Text style={styles.lotsTitle}>Parking Lots</Text>
            <IconButton
              icon="plus-circle"
              color="#4285F4"
              size={24}
              onPress={() => showModal(false)}
            />
          </View>
          
          <FlatList
            data={parkingLots}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.lotItem,
                  selectedLot?.id === item.id && styles.selectedLotItem,
                ]}
                onPress={() => handleSelectLot(item)}
              >
                <View style={styles.lotItemContent}>
                  <Text style={styles.lotName}>{item.name}</Text>
                  <Text style={styles.lotInfo}>{item.totalSpots} spots</Text>
                </View>
                {!item.isActive && (
                  <View style={styles.inactiveBadge}>
                    <Text style={styles.inactiveText}>Inactive</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No parking lots found.</Text>
            }
          />
        </View>

        {/* Parking Lot Details */}
        <View style={styles.lotDetails}>
          {selectedLot ? (
            <>
              <View style={styles.detailsHeader}>
                <View>
                  <Text style={styles.detailsTitle}>{selectedLot.name}</Text>
                  <Text style={styles.detailsSubtitle}>{selectedLot.location}</Text>
                </View>
                <View style={styles.detailsActions}>
                  <Button
                    mode="contained"
                    onPress={() => showModal(true)}
                    style={styles.editButton}
                  >
                    Edit
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={deleteParkingLot}
                    style={styles.deleteButton}
                  >
                    Delete
                  </Button>
                </View>
              </View>

              <Card style={styles.detailsCard}>
                <Card.Content>
                  <View style={styles.detailsGrid}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Total Spots</Text>
                      <Text style={styles.detailValue}>{selectedLot.totalSpots || 0}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Hourly Rate</Text>
                      <Text style={styles.detailValue}>${selectedLot.hourlyRate || 0}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Status</Text>
                      <Text style={styles.detailValue}>
                        {selectedLot.isActive !== false ? 'Active' : 'Inactive'}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Coordinates</Text>
                      <Text style={styles.detailValue}>
                        {selectedLot.latitude ? `${selectedLot.latitude}, ${selectedLot.longitude}` : 'Not set'}
                      </Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>

              {/* Spots List */}
              <View style={styles.spotsSection}>
                <Text style={styles.sectionTitle}>Parking Spots</Text>
                <ScrollView style={styles.spotsGrid}>
                  <View style={styles.spotsContainer}>
                    {selectedLot.spots && selectedLot.spots.length > 0 ? (
                      selectedLot.spots.map((spot) => (
                        <View 
                          key={spot.id} 
                          style={[
                              styles.spotItem,
                            spot.category === 'Premium' && styles.premiumSpot,
                            spot.category === 'Handicap' && styles.handicapSpot,
                            spot.accessibility && styles.accessibleSpot,
                          ]}
                        >
                          <Text style={styles.spotId}>{spot.id}</Text>
                          <Text style={styles.spotCategory}>{spot.category}</Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.emptyText}>No spots defined for this lot.</Text>
                    )}
                  </View>
                </ScrollView>
              </View>
            </>
          ) : (
            <View style={styles.noLotSelected}>
              <Icon name="car-off" size={60} color="#ccc" />
              <Text style={styles.noLotText}>No parking lot selected</Text>
              <Text style={styles.noLotSubtext}>Select a lot from the list or add a new one</Text>
              <Button
                mode="contained"
                onPress={() => showModal(false)}
                style={styles.addButton}
              >
                Add New Lot
              </Button>
            </View>
          )}
        </View>
      </View>

      {/* Add/Edit Lot Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={hideModal}
          contentContainerStyle={styles.modalContainer}
        >
          <ScrollView>
            <Text style={styles.modalTitle}>
              {editMode ? 'Edit Parking Lot' : 'Add New Parking Lot'}
            </Text>

            <TextInput
              label="Lot Name *"
              value={formData.name}
              onChangeText={(text) => handleInputChange('name', text)}
              style={styles.input}
            />

            <TextInput
              label="Location *"
              value={formData.location}
              onChangeText={(text) => handleInputChange('location', text)}
              style={styles.input}
            />

            <View style={styles.rowInputs}>
              <TextInput
                label="Latitude"
                value={formData.latitude}
                onChangeText={(text) => handleInputChange('latitude', text)}
                keyboardType="numeric"
                style={[styles.input, styles.halfInput]}
              />
              <TextInput
                label="Longitude"
                value={formData.longitude}
                onChangeText={(text) => handleInputChange('longitude', text)}
                keyboardType="numeric"
                style={[styles.input, styles.halfInput]}
              />
            </View>

            <View style={styles.rowInputs}>
              <TextInput
                label="Total Spots *"
                value={formData.totalSpots}
                onChangeText={(text) => handleInputChange('totalSpots', text)}
                keyboardType="numeric"
                style={[styles.input, styles.halfInput]}
              />
              <TextInput
                label="Hourly Rate ($) *"
                value={formData.hourlyRate}
                onChangeText={(text) => handleInputChange('hourlyRate', text)}
                keyboardType="numeric"
                style={[styles.input, styles.halfInput]}
              />
            </View>

            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Active Status</Text>
              <Switch
                value={formData.isActive}
                onValueChange={(value) => handleInputChange('isActive', value)}
                color="#4285F4"
              />
            </View>

            <View style={styles.spotsActions}>
              <Text style={styles.spotsLabel}>Parking Spots:</Text>
              <Button 
                mode="outlined" 
                onPress={generateSpots}
                style={styles.generateButton}
              >
                Generate Spots
              </Button>
            </View>

            <Text style={styles.spotCountText}>
              {formData.spots.length} spots defined
            </Text>

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={hideModal}
                style={styles.cancelButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={saveParkingLot}
                style={styles.saveButton}
              >
                Save
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>

      {/* Add Lot FAB button */}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => showModal(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  lotsList: {
    width: '30%',
    borderRightWidth: 1,
    borderRightColor: '#eee',
    backgroundColor: '#fff',
  },
  lotsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  lotsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  lotItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedLotItem: {
    backgroundColor: '#e6f2ff',
    borderLeftWidth: 4,
    borderLeftColor: '#4285F4',
  },
  lotItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lotName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  lotInfo: {
    fontSize: 12,
    color: '#666',
  },
  inactiveBadge: {
    backgroundColor: '#f1f1f1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  inactiveText: {
    fontSize: 10,
    color: '#888',
  },
  emptyText: {
    padding: 16,
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  lotDetails: {
    flex: 1,
    padding: 16,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  detailsSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  detailsActions: {
    flexDirection: 'row',
  },
  editButton: {
    marginRight: 8,
    backgroundColor: '#4285F4',
  },
  deleteButton: {
    borderColor: '#EA4335',
  },
  detailsCard: {
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailItem: {
    width: '50%',
    paddingVertical: 8,
    paddingRight: 16,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  spotsSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  spotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  spotItem: {
    width: 60,
    height: 60,
    margin: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  premiumSpot: {
    backgroundColor: '#e6f4ea',
    borderColor: '#34A853',
  },
  handicapSpot: {
    backgroundColor: '#e8f0fe',
    borderColor: '#4285F4',
  },
  accessibleSpot: {
    borderWidth: 2,
  },
  spotId: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  spotCategory: {
    fontSize: 10,
    color: '#666',
  },
  noLotSelected: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noLotText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
  },
  noLotSubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#4285F4',
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
  },
  spotsActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  spotsLabel: {
    fontSize: 16,
  },
  generateButton: {
    borderColor: '#4285F4',
  },
  spotCountText: {
    color: '#666',
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  cancelButton: {
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: '#4285F4',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#4285F4',
  },
  spotsGrid: {
    flex: 1,
    maxHeight: 400,
  },
});

export default ParkingInventory;