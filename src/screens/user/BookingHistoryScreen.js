// // src/screens/user/BookingHistoryScreen.js
// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   FlatList,
//   TouchableOpacity,
//   ActivityIndicator,
//   RefreshControl,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import firestore from '@react-native-firebase/firestore';
// import auth from '@react-native-firebase/auth';

// import AppHeader from '../../components/common/AppHeader';

// const BookingHistoryScreen = ({ navigation }) => {
//   const [bookings, setBookings] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed', 'cancelled'

//   const user = auth().currentUser;

//   useEffect(() => {
//     fetchBookings();
//   }, []);

//   const fetchBookings = async () => {
//     try {
//       const bookingsSnapshot = await firestore()
//         .collection('bookings')
//         .where('userId', '==', user.uid)
//         .orderBy('createdAt', 'desc')
//         .get();

//       const bookingsList = bookingsSnapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data(),
//       }));

//       setBookings(bookingsList);
//     } catch (error) {
//       console.error('Error fetching bookings:', error);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   const onRefresh = () => {
//     setRefreshing(true);
//     fetchBookings();
//   };

//   const getFilteredBookings = () => {
//     if (filter === 'all') return bookings;
    
//     if (filter === 'active') {
//       return bookings.filter(booking => 
//         booking.status === 'confirmed' && 
//         booking.endTime.toDate() > new Date()
//       );
//     }
    
//     if (filter === 'completed') {
//       return bookings.filter(booking => 
//         booking.status === 'confirmed' && 
//         booking.endTime.toDate() <= new Date()
//       );
//     }
    
//     if (filter === 'cancelled') {
//       return bookings.filter(booking => booking.status === 'cancelled');
//     }
    
//     return bookings;
//   };

//   const formatDate = (timestamp) => {
//     const date = timestamp.toDate();
//     return date.toLocaleString('en-US', {
//       month: 'short',
//       day: 'numeric',
//       hour: 'numeric',
//       minute: '2-digit',
//       hour12: true,
//     });
//   };

//   const getStatusBadgeColor = (booking) => {
//     if (booking.status === 'cancelled') return '#F44336'; // Red
    
//     const now = new Date();
//     const endTime = booking.endTime.toDate();
    
//     if (now > endTime) return '#9E9E9E'; // Gray (completed)
//     return '#4CAF50'; // Green (active)
//   };

//   const getStatusText = (booking) => {
//     if (booking.status === 'cancelled') return 'Cancelled';
    
//     const now = new Date();
//     const endTime = booking.endTime.toDate();
    
//     if (now > endTime) return 'Completed';
//     return 'Active';
//   };

//   const renderBookingItem = ({ item }) => {
//     const statusColor = getStatusBadgeColor(item);
//     const statusText = getStatusText(item);
    
//     return (
//       <TouchableOpacity 
//         style={styles.bookingCard}
//         onPress={() => {
//           // You could navigate to a detailed view or show more options
//           // navigation.navigate('BookingDetails', { booking: item });
//         }}
//       >
//         <View style={styles.cardHeader}>
//           <View style={styles.spotInfo}>
//             <Icon name="local-parking" size={24} color="#4A80F0" />
//             <Text style={styles.spotName}>{item.parkingSpotName}</Text>
//           </View>
          
//           <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
//             <Text style={styles.statusText}>{statusText}</Text>
//           </View>
//         </View>
        
//         <View style={styles.cardBody}>
//           <View style={styles.bookingDetail}>
//             <Icon name="access-time" size={16} color="#666" />
//             <Text style={styles.detailText}>
//               {formatDate(item.startTime)} - {formatDate(item.endTime)}
//             </Text>
//           </View>
          
//           <View style={styles.bookingDetail}>
//             <Icon name="attach-money" size={16} color="#666" />
//             <Text style={styles.detailText}>${(item.totalCost + 1).toFixed(2)}</Text>
//           </View>
          
//           <View style={styles.bookingDetail}>
//             <Icon name="credit-card" size={16} color="#666" />
//             <Text style={styles.detailText}>
//               {item.paymentMethod === 'card' ? 'Credit Card' : 
//                item.paymentMethod === 'paypal' ? 'PayPal' : 'Google Pay'}
//             </Text>
//           </View>
//         </View>
        
//         <View style={styles.actionsRow}>
//           <TouchableOpacity style={styles.actionButton}>
//             <Icon name="receipt" size={20} color="#4A80F0" />
//             <Text style={styles.actionText}>Receipt</Text>
//           </TouchableOpacity>
          
//           {statusText === 'Active' && (
//             <TouchableOpacity style={styles.actionButton}>
//               <Icon name="directions" size={20} color="#4A80F0" />
//               <Text style={styles.actionText}>Directions</Text>
//             </TouchableOpacity>
//           )}
          
//           {statusText === 'Active' && (
//             <TouchableOpacity 
//               style={styles.actionButton}
//               onPress={() => {
//                 // Handle cancel booking logic
//               }}
//             >
//               <Icon name="cancel" size={20} color="#F44336" />
//               <Text style={[styles.actionText, { color: '#F44336' }]}>Cancel</Text>
//             </TouchableOpacity>
//           )}
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   const FilterButton = ({ title, value }) => (
//     <TouchableOpacity
//       style={[
//         styles.filterButton,
//         filter === value && styles.activeFilterButton,
//       ]}
//       onPress={() => setFilter(value)}
//     >
//       <Text
//         style={[
//           styles.filterButtonText,
//           filter === value && styles.activeFilterButtonText,
//         ]}
//       >
//         {title}
//       </Text>
//     </TouchableOpacity>
//   );

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <AppHeader title="My Bookings" />
      
//       <View style={styles.filtersContainer}>
//         <FilterButton title="All" value="all" />
//         <FilterButton title="Active" value="active" />
//         <FilterButton title="Completed" value="completed" />
//         <FilterButton title="Cancelled" value="cancelled" />
//       </View>
      
//       {loading ? (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#4A80F0" />
//           <Text style={styles.loadingText}>Loading bookings...</Text>
//         </View>
//       ) : (
//         <FlatList
//           data={getFilteredBookings()}
//           renderItem={renderBookingItem}
//           keyExtractor={(item) => item.id}
//           contentContainerStyle={styles.listContainer}
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={onRefresh}
//               colors={['#4A80F0']}
//             />
//           }
//           ListEmptyComponent={() => (
//             <View style={styles.emptyContainer}>
//               <Icon name="event-busy" size={64} color="#BDBDBD" />
//               <Text style={styles.emptyText}>No bookings found</Text>
//               <Text style={styles.emptySubText}>
//                 {filter === 'all'
//                   ? "You haven't made any bookings yet."
//                   : `You don't have any ${filter} bookings.`}
//               </Text>
//             </View>
//           )}
//         />
//       )}
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#FFFFFF',
//   },
//   filtersContainer: {
//     flexDirection: 'row',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#EEEEEE',
//   },
//   filterButton: {
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 20,
//     marginRight: 8,
//   },
//   activeFilterButton: {
//     backgroundColor: '#E6EEFF',
//   },
//   filterButtonText: {
//     fontSize: 14,
//     color: '#666',
//   },
//   activeFilterButtonText: {
//     color: '#4A80F0',
//     fontWeight: '600',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingText: {
//     marginTop: 10,
//     fontSize: 16,
//     color: '#666',
//   },
//   listContainer: {
//     padding: 16,
//     paddingBottom: 24,
//   },
//   bookingCard: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   spotInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   spotName: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#333',
//     marginLeft: 8,
//   },
//   statusBadge: {
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 4,
//   },
//   statusText: {
//     fontSize: 12,
//     color: '#FFFFFF',
//     fontWeight: '600',
//   },
//   cardBody: {
//     borderBottomWidth: 1,
//     borderBottomColor: '#EEEEEE',
//     paddingBottom: 12,
//     marginBottom: 12,
//   },
//   bookingDetail: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   detailText: {
//     fontSize: 14,
//     color: '#666',
//     marginLeft: 8,
//   },
//   actionsRow: {
//     flexDirection: 'row',
//     justifyContent: 'flex-start',
//   },
//   actionButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginRight: 20,
//   },
//   actionText: {
//     fontSize: 14,
//     color: '#4A80F0',
//     marginLeft: 4,
//   },
//   emptyContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 60,
//   },
//   emptyText: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#333',
//     marginTop: 16,
//     marginBottom: 8,
//   },
//   emptySubText: {
//     fontSize: 14,
//     color: '#666',
//     textAlign: 'center',
//   },
// });

// export default BookingHistoryScreen;
// src/screens/user/BookingHistoryScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

import AppHeader from '../../components/common/AppHeader';

const BookingHistoryScreen = ({ navigation }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed', 'cancelled'

  const user = auth().currentUser;

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const bookingsSnapshot = await firestore()
        .collection('bookings')
        .where('userId', '==', user.uid)
        .orderBy('createdAt', 'desc')
        .get();

      const bookingsList = bookingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setBookings(bookingsList);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const getFilteredBookings = () => {
    if (filter === 'all') return bookings;
    
    if (filter === 'active') {
      return bookings.filter(booking => 
        booking.status === 'confirmed' && 
        booking.endTime.toDate() > new Date()
      );
    }
    
    if (filter === 'completed') {
      return bookings.filter(booking => 
        booking.status === 'confirmed' && 
        booking.endTime.toDate() <= new Date()
      );
    }
    
    if (filter === 'cancelled') {
      return bookings.filter(booking => booking.status === 'cancelled');
    }
    
    return bookings;
  };

  const formatDate = (timestamp) => {
    const date = timestamp.toDate();
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusBadgeColor = (booking) => {
    if (booking.status === 'cancelled') return '#F44336'; // Red
    
    const now = new Date();
    const endTime = booking.endTime.toDate();
    
    if (now > endTime) return '#9E9E9E'; // Gray (completed)
    return '#4CAF50'; // Green (active)
  };

  const getStatusText = (booking) => {
    if (booking.status === 'cancelled') return 'Cancelled';
    
    const now = new Date();
    const endTime = booking.endTime.toDate();
    
    if (now > endTime) return 'Completed';
    return 'Active';
  };

  const renderBookingItem = ({ item }) => {
    const statusColor = getStatusBadgeColor(item);
    const statusText = getStatusText(item);
    
    return (
      <TouchableOpacity 
        style={styles.bookingCard}
        onPress={() => {
          // You could navigate to a detailed view or show more options
          // navigation.navigate('BookingDetails', { booking: item });
        }}
      >
        <View style={styles.cardHeader}>
          <View style={styles.spotInfo}>
            <Icon name="local-parking" size={24} color="#4A80F0" />
            <Text style={styles.spotName}>{item.parkingSpotName}</Text>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{statusText}</Text>
          </View>
        </View>
        
        <View style={styles.cardBody}>
          <View style={styles.bookingDetail}>
            <Icon name="access-time" size={16} color="#666" />
            <Text style={styles.detailText}>
              {formatDate(item.startTime)} - {formatDate(item.endTime)}
            </Text>
          </View>
          
          <View style={styles.bookingDetail}>
            <Icon name="attach-money" size={16} color="#666" />
            <Text style={styles.detailText}>${(item.totalCost + 1).toFixed(2)}</Text>
          </View>
          
          <View style={styles.bookingDetail}>
            <Icon name="credit-card" size={16} color="#666" />
            <Text style={styles.detailText}>
              {item.paymentMethod === 'card' ? 'Credit Card' : 
               item.paymentMethod === 'paypal' ? 'PayPal' : 'Google Pay'}
            </Text>
          </View>
        </View>
        
 />
              <Text style={styles.actionText}>Directions</Text>
            </TouchableOpacity>
          )}
          
          {statusText === 'Active' && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => {
                // Handle cancel booking logic
              }}
            >
              <Icon name="cancel" size={20} color="#F44336" />
              <Text style={[styles.actionText, { color: '#F44336' }]}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

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
      <AppHeader title="My Bookings" />
      
      <View style={styles.filtersContainer}>
        <FilterButton title="All" value="all" />
        <FilterButton title="Active" value="active" />
        <FilterButton title="Completed" value="completed" />
        <FilterButton title="Cancelled" value="cancelled" />
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A80F0" />
          <Text style={styles.loadingText}>Loading bookings...</Text>
        </View>
      ) : (
        <FlatList
          data={getFilteredBookings()}
          renderItem={renderBookingItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#4A80F0']}
            />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Icon name="event-busy" size={64} color="#BDBDBD" />
              <Text style={styles.emptyText}>No bookings found</Text>
              <Text style={styles.emptySubText}>
                {filter === 'all'
                  ? "You haven't made any bookings yet."
                  : `You don't have any ${filter} bookings.`}
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
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
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
    marginBottom: 12,
  },
  spotInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spotName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
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
  cardBody: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 12,
    marginBottom: 12,
  },
  bookingDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionText: {
    fontSize: 14,
    color: '#4A80F0',
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
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

export default BookingHistoryScreen;