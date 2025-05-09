// src/components/booking/SpotSelector.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  FlatList
} from 'react-native';
import { Surface, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const SpotSelector = ({ spots, onSelectSpot }) => {
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Get unique categories from spots
  const categories = ['All', ...Array.from(new Set(spots.map(spot => spot.category || 'General')))];

  // Filter spots by category
  const filteredSpots = selectedCategory === 'All' 
    ? spots 
    : spots.filter(spot => spot.category === selectedCategory);

  // Handle spot selection
  const handleSpotSelection = (spot) => {
    setSelectedSpot(spot);
  };

  // Handle confirm selection
  const handleConfirm = () => {
    if (selectedSpot) {
      onSelectSpot(selectedSpot);
    }
  };

  return (
    <View style={styles.container}>
      {/* Categories */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <Chip
            key={category}
            selected={selectedCategory === category}
            onPress={() => setSelectedCategory(category)}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.selectedCategoryChip
            ]}
            textStyle={[
              styles.categoryText,
              selectedCategory === category && styles.selectedCategoryText
            ]}
          >
            {category}
          </Chip>
        ))}
      </ScrollView>

      {/* Spots Grid */}
      <FlatList
        data={filteredSpots}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        contentContainerStyle={styles.spotsContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.spotItem,
              selectedSpot?.id === item.id && styles.selectedSpotItem,
              item.accessibility && styles.accessibleSpot
            ]}
            onPress={() => handleSpotSelection(item)}
          >
            <View style={styles.spotContent}>
              <Text style={[
                styles.spotText,
                selectedSpot?.id === item.id && styles.selectedSpotText
              ]}>
                {item.id}
              </Text>
              {item.accessibility && (
                <Icon name="wheelchair-accessibility" size={14} color="#333" style={styles.accessibilityIcon} />
              )}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No spots available in this category</Text>
          </View>
        }
      />

      {/* Legend */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendSpot, styles.regularSpot]} />
          <Text style={styles.legendText}>Regular</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSpot, styles.accessibleSpot]} />
          <Text style={styles.legendText}>Accessible</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSpot, styles.selectedSpotItem]} />
          <Text style={styles.legendText}>Selected</Text>
        </View>
      </View>

      {/* Confirmation Button */}
      <TouchableOpacity 
        style={[
          styles.confirmButton,
          !selectedSpot && styles.disabledButton
        ]}
        onPress={handleConfirm}
        disabled={!selectedSpot}
      >
        <Text style={styles.confirmButtonText}>
          {selectedSpot ? `Confirm Spot ${selectedSpot.id}` : 'Select a Spot'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  categoriesContainer: {
    paddingVertical: 12,
  },
  categoryChip: {
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  selectedCategoryChip: {
    backgroundColor: '#4285F4',
  },
  categoryText: {
    color: '#666',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  spotsContainer: {
    paddingVertical: 16,
  },
  spotItem: {
    flex: 1,
    margin: 5,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedSpotItem: {
    backgroundColor: '#4285F4',
    borderColor: '#4285F4',
  },
  accessibleSpot: {
    backgroundColor: '#b3e6ff',
    borderColor: '#80d4ff',
  },
  spotContent: {
    alignItems: 'center',
  },
  spotText: {
    fontWeight: 'bold',
    color: '#333',
  },
  selectedSpotText: {
    color: '#fff',
  },
  accessibilityIcon: {
    marginTop: 2,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontStyle: 'italic',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  legendSpot: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  regularSpot: {
    backgroundColor: '#f0f0f0',
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  confirmButton: {
    backgroundColor: '#4285F4',
    padding: 14,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 16,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default SpotSelector;