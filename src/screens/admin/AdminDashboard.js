// src/screens/admin/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Card, Title, Paragraph, Button, ActivityIndicator } from 'react-native-paper';
import { LineChart, PieChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import BookingService from '../../services/BookingService';
import AdminService from '../../services/AdminService';

const AdminDashboard = ({ navigation }) => {
  const { userDetails } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    occupancyRate: 0,
    parkingLots: [],
    recentBookings: [],
    weeklyBookings: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{ data: [0, 0, 0, 0, 0, 0, 0] }],
    },
    occupancyByLot: [],
  });
  const [error, setError] = useState(null);

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await AdminService.getDashboardData();
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  // Render loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Admin Welcome Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome,</Text>
          <Text style={styles.adminName}>{userDetails?.name || 'Admin'}</Text>
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>

        {/* Key Stats Cards */}
        <View style={styles.statsContainer}>
          <Card style={[styles.statsCard, { backgroundColor: '#4285F4' }]}>
            <Card.Content>
              <Icon name="car-multiple" size={30} color="#fff" style={styles.statsIcon} />
              <Title style={styles.statsTitle}>{dashboardData.totalBookings}</Title>
              <Paragraph style={styles.statsText}>Total Bookings</Paragraph>
            </Card.Content>
          </Card>

          <Card style={[styles.statsCard, { backgroundColor: '#34A853' }]}>
            <Card.Content>
              <Icon name="currency-usd" size={30} color="#fff" style={styles.statsIcon} />
              <Title style={styles.statsTitle}>${dashboardData.totalRevenue.toFixed(2)}</Title>
              <Paragraph style={styles.statsText}>Total Revenue</Paragraph>
            </Card.Content>
          </Card>

          <Card style={[styles.statsCard, { backgroundColor: '#EA4335' }]}>
            <Card.Content>
              <Icon name="percent" size={30} color="#fff" style={styles.statsIcon} />
              <Title style={styles.statsTitle}>{dashboardData.occupancyRate}%</Title>
              <Paragraph style={styles.statsText}>Occupancy Rate</Paragraph>
            </Card.Content>
          </Card>
        </View>

        {/* Weekly Bookings Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Weekly Bookings</Text>
          <LineChart
            data={dashboardData.weeklyBookings}
            width={Dimensions.get('window').width - 32}
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(66, 133, 244, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#4285F4',
              },
            }}
            bezier
            style={styles.chart}
          />
        </View>

        {/* Occupancy by Lot */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Occupancy by Lot</Text>
          {dashboardData.parkingLots.length > 0 ? (
            <View>
              <PieChart
                data={dashboardData.occupancyByLot.map((lot, index) => ({
                  name: lot.name,
                  population: lot.occupancyRate,
                  color: getColorByIndex(index),
                  legendFontColor: '#7F7F7F',
                  legendFontSize: 12,
                }))}
                width={Dimensions.get('window').width - 32}
                height={220}
                chartConfig={{
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
              <View style={styles.lotsList}>
                {dashboardData.parkingLots.map((lot, index) => (
                  <Card key={lot.id} style={styles.lotCard}>
                    <Card.Content>
                      <View style={styles.lotHeader}>
                        <View style={styles.lotInfo}>
                          <Title>{lot.name}</Title>
                          <Paragraph>{lot.location}</Paragraph>
                        </View>
                        <View style={[styles.occupancyBadge, getOccupancyColor(lot.occupancyRate)]}>
                          <Text style={styles.occupancyText}>{lot.occupancyRate}%</Text>
                        </View>
                      </View>
                      <View style={styles.lotStats}>
                        <View style={styles.lotStat}>
                          <Icon name="car" size={16} color="#4285F4" />
                          <Text style={styles.lotStatText}>
                            {lot.occupiedSpots} / {lot.totalSpots} spots
                          </Text>
                        </View>
                        <View style={styles.lotStat}>
                          <Icon name="currency-usd" size={16} color="#34A853" />
                          <Text style={styles.lotStatText}>${lot.revenue.toFixed(2)} today</Text>
                        </View>
                      </View>
                      <Button
                        mode="outlined"
                        onPress={() => navigation.navigate('Inventory', {
                          screen: 'ParkingInventory',
                          params: { selectedLot: lot }
                        })}
                        style={styles.viewDetailsButton}
                      >
                        View Details
                      </Button>
                    </Card.Content>
                  </Card>
                ))}
              </View>
            </View>
          ) : (
            <Text style={styles.emptyText}>No parking lots available</Text>
          )}
        </View>

        {/* Recent Bookings */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Recent Bookings</Text>
          {dashboardData.recentBookings.length > 0 ? (
            dashboardData.recentBookings.map((booking) => (
              <Card key={booking.id} style={styles.bookingCard}>
                <Card.Content>
                  <View style={styles.bookingHeader}>
                    <View>
                      <Text style={styles.bookingSpot}>Spot {booking.spotId}</Text>
                      <Text style={styles.bookingLot}>{booking.lotName}</Text>
                    </View>
                    <View style={styles.bookingStatus}>
                      <Text style={[
                        styles.statusText,
                        booking.status === 'confirmed' ? styles.statusConfirmed : 
                        booking.status === 'cancelled' ? styles.statusCancelled :
                        styles.statusTemporary
                      ]}>
                        {booking.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.bookingDetails}>
                    <View style={styles.bookingDetail}>
                      <Icon name="account" size={16} color="#666" />
                      <Text style={styles.bookingDetailText}>{booking.userName}</Text>
                    </View>
                    <View style={styles.bookingDetail}>
                      <Icon name="calendar" size={16} color="#666" />
                      <Text style={styles.bookingDetailText}>
                        {new Date(booking.date.seconds * 1000).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.bookingDetail}>
                      <Icon name="clock-outline" size={16} color="#666" />
                      <Text style={styles.bookingDetailText}>
                        {new Date(booking.startTime.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                        {new Date(booking.endTime.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                    <View style={styles.bookingDetail}>
                      <Icon name="currency-usd" size={16} color="#666" />
                      <Text style={styles.bookingDetailText}>${booking.amount.toFixed(2)}</Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ))
          ) : (
            <Text style={styles.emptyText}>No recent bookings</Text>
          )}
          
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Users')}
            style={styles.viewAllButton}
          >
            View All Bookings
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Helper function to get color by index
const getColorByIndex = (index) => {
  const colors = ['#4285F4', '#34A853', '#FBBC05', '#EA4335', '#5F6368', '#185ABC', '#137333', '#EA8600', '#C5221F', '#3C4043'];
  return colors[index % colors.length];
};

// Helper function to get occupancy color
const getOccupancyColor = (rate) => {
  if (rate < 50) {
    return styles.lowOccupancy;
  } else if (rate < 80) {
    return styles.mediumOccupancy;
  } else {
    return styles.highOccupancy;
  }
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
  header: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
  },
  adminName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statsCard: {
    width: '31%',
    borderRadius: 8,
  },
  statsIcon: {
    marginBottom: 8,
  },
  statsTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statsText: {
    color: '#fff',
    opacity: 0.8,
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  lotsList: {
    marginTop: 16,
  },
  lotCard: {
    marginBottom: 12,
  },
  lotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lotInfo: {
    flex: 1,
  },
  occupancyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  lowOccupancy: {
    backgroundColor: '#E6F4EA',
  },
  mediumOccupancy: {
    backgroundColor: '#FCE8E6',
  },
  highOccupancy: {
    backgroundColor: '#FEEFC3',
  },
  occupancyText: {
    fontWeight: 'bold',
  },
  lotStats: {
    flexDirection: 'row',
    marginTop: 12,
    marginBottom: 12,
  },
  lotStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  lotStatText: {
    marginLeft: 6,
    color: '#666',
  },
  viewDetailsButton: {
    marginTop: 8,
  },
  bookingCard: {
    marginBottom: 12,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingSpot: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bookingLot: {
    fontSize: 14,
    color: '#666',
  },
  bookingStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusConfirmed: {
    color: '#34A853',
  },
  statusCancelled: {
    color: '#EA4335',
  },
  statusTemporary: {
    color: '#FBBC05',
  },
  bookingDetails: {
    marginTop: 12,
  },
  bookingDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  bookingDetailText: {
    marginLeft: 8,
    color: '#666',
  },
  viewAllButton: {
    marginTop: 16,
    backgroundColor: '#4285F4',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    padding: 16,
  },
});

export default AdminDashboard;