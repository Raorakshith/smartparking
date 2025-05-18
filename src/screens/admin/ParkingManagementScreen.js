// src/screens/admin/ParkingManagementScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import firestore from '@react-native-firebase/firestore';

import AppHeader from '../../components/common/AppHeader';
import Button from '../../components/common/Button';

const ParkingManagementScreen = ({ navigation }) => {
  const [parkingSpots, setParkingSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'available', 'occupied'

  useEffect(() => {
    fetchParkingSpots();
  }, []);

  const fetchParkingSpots = async () => {
    try {
      const spotsSnapshot = await firestore()
        .collection('parkingSpots')
        .orderBy('name')
        .get();
      
      const spotsData = spotsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      setParkingSpots(spotsData);
    } catch (error) {
      console.error('Error fetching parking spots:', error);
      Alert.alert('Error', 'Failed to load parking spots.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchParkingSpots();
  };

  const handleAddParkingSpot = () => {
    navigation.navigate('AddParkingSpot');
  };

  const handleEditSpot = (spot) => {
    // Navigate to edit screen with the parking spot data
    navigation.navigate('AddParkingSpot', { parkingSpot: spot, isEditing: true });
  };

  const handleToggleAvailability = async (spot) => {
    try {
      await firestore()
        .collection('parkingSpots')
        .doc(spot.id)
        .update({
          isAvailable: !spot.isAvailable,
        });
      
      // Update local state
      setParkingSpots(prev => 
        prev.map(item => 
          item.id === spot.id
            ? { ...item, isAvailable: !item.isAvailable }
            : item
        )
      );
      
      Alert.alert(
        'Success',
        `Parking spot ${spot.name} is now ${!spot.isAvailable ? 'available' : 'unavailable'}.`
      );
    } catch (error) {
      console.error('Error updating parking spot:', error);
      Alert.alert('Error', 'Failed to update parking spot availability.');
    }
  };

  const handleDeleteSpot = (spot) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete ${spot.name}?`,
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
              await firestore()
                .collection('parkingSpots')
                .doc(spot.id)
                .delete();
              
              // Update local state
              setParkingSpots(prev => prev.filter(item => item.id !== spot.id));
              
              Alert.alert('Success', `Parking spot ${spot.name} has been deleted.`);
            } catch (error) {
              console.error('Error deleting parking spot:', error);
              Alert.alert('Error', 'Failed to delete parking spot.');
            }
          },
        },
      ]
    );
  };

  const getFilteredSpots = () => {
    let filteredSpots = [...parkingSpots];
    
    // Apply search filter
    if (searchQuery) {
      filteredSpots = filteredSpots.filter(spot => 
        spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        spot.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply availability filter
    if (filter === 'available') {
      filteredSpots = filteredSpots.filter(spot => spot.isAvailable);
    } else if (filter === 'occupied') {
      filteredSpots = filteredSpots.filter(spot => !spot.isAvailable);
    }
    
    return filteredSpots;
  };

  const renderParkingSpotItem = ({ item }) => (
    <View style={styles.spotCard}>
      <View style={styles.spotHeader}>
        <Text style={styles.spotName}>{item.name}</Text>
        <View style={[
          styles.statusBadge, 
          { backgroundColor: item.isAvailable ? '#4CAF50' : '#F44336' }
        ]}>
          <Text style={styles.statusText}>
            {item.isAvailable ? 'Available' : 'Occupied'}
          </Text>
        </View>
      </View>
      
      <Text style={styles.spotLocation}>{item.location}</Text>
      
      <View style={styles.spotDetails}>
        <View style={styles.detailItem}>
          <Icon name="attach-money" size={16} color="#666" />
          <Text style={styles.detailText}>${item.price}/hour</Text>
        </View>
        
        {item.capacity && (
          <View style={styles.detailItem}>
            <Icon name="group" size={16} color="#666" />
            <Text style={styles.detailText}>{item.capacity} vehicles</Text>
          </View>
        )}
        
        {item.features && item.features.length > 0 && (
          <View style={styles.detailItem}>
            <Icon name="stars" size={16} color="#666" />
            <Text style={styles.detailText}>{item.features.join(', ')}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleEditSpot(item)}
        >
          <Icon name="edit" size={20} color="#4A80F0" />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleToggleAvailability(item)}
        >
          <Icon 
            name={item.isAvailable ? 'highlight-off' : 'check-circle'} 
            size={20} 
            color={item.isAvailable ? '#F44336' : '#4CAF50'} 
          />
          <Text 
            style={[
              styles.actionText, 
              { color: item.isAvailable ? '#F44336' : '#4CAF50' }
            ]}
          >
            {item.isAvailable ? 'Set Unavailable' : 'Set Available'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleDeleteSpot(item)}
        >
          <Icon name="delete" size={20} color="#F44336" />
          <Text style={[styles.actionText, { color: '#F44336' }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const FilterButton = ({ title, value }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === value && styles.activeFilterButton,
      ]}
      onPress={() => setFilter(value)}
    >
      <Text
        style={[
          styles.filterButtonText,
          filter === value && styles.activeFilterButtonText,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader 
        title="Parking Management" 
        showBackButton
        onBackPress={() => navigation.goBack()}
      />
      
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Icon name="search" size={20} color="#9E9E9E" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search parking spots..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="clear" size={20} color="#9E9E9E" />
              </TouchableOpacity>
            ) : null}
          </View>
          
          <Button
            title="Add New"
            onPress={handleAddParkingSpot}
            style={styles.addButton}
          />
        </View>
        
        <View style={styles.filtersContainer}>
          <FilterButton title="All" value="all" />
          <FilterButton title="Available" value="available" />
          <FilterButton title="Occupied" value="occupied" />
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A80F0" />
          </View>
        ) : (
          <FlatList
            data={getFilteredSpots()}
            renderItem={renderParkingSpotItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            refreshing={refreshing}
            onRefresh={onRefresh}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Icon name="local-parking" size={64} color="#BDBDBD" />
                <Text style={styles.emptyText}>No parking spots found</Text>
                <Text style={styles.emptySubText}>
                  {searchQuery
                    ? `No results for "${searchQuery}"`
                    : filter !== 'all'
                    ? `No ${filter} parking spots found`
                    : 'Start by adding a new parking spot'}
                </Text>
              </View>
            )}
          />
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
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 8,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    marginLeft: 8,
  },
  addButton: {
    height: 40,
    paddingHorizontal: 12,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  activeFilterButton: {
    backgroundColor: '#E6EEFF',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
  },
  activeFilterButtonText: {
    color: '#4A80F0',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  spotCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  spotHeader: {
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
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  spotLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  spotDetails: {
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    color: '#4A80F0',
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default ParkingManagementScreen;