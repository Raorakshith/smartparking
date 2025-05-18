// src/screens/admin/DashboardScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

import AppHeader from '../../components/common/AppHeader';

const DashboardScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalParkingSpots: 0,
    availableSpots: 0,
    activeBookings: 0,
    totalRevenue: 0,
    recentBookings: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch parking spots data
      const spotsSnapshot = await firestore()
        .collection('parkingSpots')
        .get();
      
      const totalSpots = spotsSnapshot.size;
      const availableSpots = spotsSnapshot.docs.filter(
        doc => doc.data().isAvailable
      ).length;

      // Fetch active bookings (confirmed status and end time > now)
      const now = firestore.Timestamp.now();
      const activeBookingsSnapshot = await firestore()
        .collection('bookings')
        .where('status', '==', 'confirmed')
        .where('endTime', '>', now)
        .get();
      
      const activeBookings = activeBookingsSnapshot.size;

      // Fetch recent bookings
      const recentBookingsSnapshot = await firestore()
        .collection('bookings')
        .orderBy('createdAt', 'desc')
        .limit(5)
        .get();
      
      const recentBookings = recentBookingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Calculate total revenue (simplified for demo purposes)
      // In a real app, you would use a more sophisticated calculation or aggregation
      const revenueSnapshot = await firestore()
        .collection('bookings')
        .where('status', '==', 'confirmed')
        .get();
      
      let totalRevenue = 0;
      revenueSnapshot.docs.forEach(doc => {
        totalRevenue += doc.data().totalCost || 0;
      });

      setDashboardData({
        totalParkingSpots: totalSpots,
        availableSpots: availableSpots,
        activeBookings: activeBookings,
        totalRevenue: totalRevenue,
        recentBookings: recentBookings,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AppHeader title="Admin Dashboard" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A80F0" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader 
        title="Admin Dashboard" 
        rightComponent={
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={() => {
              setLoading(true);
              fetchDashboardData();
            }}
          >
            <Icon name="refresh" size={24} color="#333" />
          </TouchableOpacity>
        }
      />
      
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.statCardsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: '#E3F2FD' }]}>
              <Icon name="local-parking" size={24} color="#2196F3" />
            </View>
            <Text style={styles.statNumber}>{dashboardData.totalParkingSpots}</Text>
            <Text style={styles.statLabel}>Total Parking Spots</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: '#E8F5E9' }]}>
              <Icon name="check-circle" size={24} color="#4CAF50" />
            </View>
            <Text style={styles.statNumber}>{dashboardData.availableSpots}</Text>
            <Text style={styles.statLabel}>Available Spots</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: '#FFF3E0' }]}>
              <Icon name="directions-car" size={24} color="#FF9800" />
            </View>
            <Text style={styles.statNumber}>{dashboardData.activeBookings}</Text>
            <Text style={styles.statLabel}>Active Bookings</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: '#F3E5F5' }]}>
              <Icon name="attach-money" size={24} color="#9C27B0" />
            </View>
            <Text style={styles.statNumber}>${dashboardData.totalRevenue.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Total Revenue</Text>
          </View>
        </View>
        
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Bookings</Text>
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={() => navigation.navigate('BookingManagement')}
          >
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.bookingsList}>
          {dashboardData.recentBookings.length > 0 ? (
            dashboardData.recentBookings.map((booking) => (
              <View key={booking.id} style={styles.bookingItem}>
                <View style={styles.bookingHeader}>
                  <Text style={styles.bookingSpotName}>{booking.parkingSpotName}</Text>
                  <View style={[
                    styles.statusBadge, 
                    { backgroundColor: booking.status === 'confirmed' ? '#4CAF50' : '#F44336' }
                  ]}>
                    <Text style={styles.statusText}>
                      {booking.status === 'confirmed' ? 'Confirmed' : 'Cancelled'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.bookingDetails}>
                  <View style={styles.detailRow}>
                    <Icon name="person" size={16} color="#666" />
                    <Text style={styles.detailText}>{booking.userName}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Icon name="access-time" size={16} color="#666" />
                    <Text style={styles.detailText}>
                      {formatDate(booking.startTime)} - {formatDate(booking.endTime)}
                    </Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Icon name="attach-money" size={16} color="#666" />
                    <Text style={styles.detailText}>${(booking.totalCost + 1).toFixed(2)}</Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No recent bookings</Text>
            </View>
          )}
        </View>
        
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('AddParkingSpot')}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#E8F5E9' }]}>
              <Icon name="add-location" size={24} color="#4CAF50" />
            </View>
            <Text style={styles.actionText}>Add Parking Spot</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('ParkingManagement')}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#E3F2FD' }]}>
              <Icon name="edit-location" size={24} color="#2196F3" />
            </View>
            <Text style={styles.actionText}>Manage Parking</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('UserManagement')}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#FFF3E0' }]}>
              <Icon name="people" size={24} color="#FF9800" />
            </View>
            <Text style={styles.actionText}>Manage Users</Text>
          </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: 16,
  },
  refreshButton: {
    padding: 8,
  },
  statCardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAllButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  viewAllText: {
    fontSize: 14,
    color: '#4A80F0',
    fontWeight: '500',
  },
  bookingsList: {
    marginBottom: 20,
  },
  bookingItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bookingSpotName: {
    fontSize: 16,
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
  bookingDetails: {},
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  noDataContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
  },
  noDataText: {
    fontSize: 14,
    color: '#666',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
});

export default DashboardScreen;