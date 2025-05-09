// src/screens/admin/UserManagement.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  ActivityIndicator,
  Searchbar,
  Menu,
  Divider,
  Dialog,
  Portal,
  RadioButton,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AdminService from '../../services/AdminService';
import BookingService from '../../services/BookingService';

const UserManagement = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [roleDialogVisible, setRoleDialogVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [userBookings, setUserBookings] = useState([]);
  const [bookingsVisible, setBookingsVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const allUsers = await AdminService.getAllUsers();
      setUsers(allUsers);
      setFilteredUsers(allUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      Alert.alert('Error', 'Failed to load users. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredUsers(users);
      return;
    }
    
    const filtered = users.filter(
      (user) =>
        user.name?.toLowerCase().includes(query.toLowerCase()) ||
        user.email?.toLowerCase().includes(query.toLowerCase()) ||
        user.vehicleNumber?.toLowerCase().includes(query.toLowerCase())
    );
    
    setFilteredUsers(filtered);
  };

  // Open user menu
  const openMenu = (user) => {
    setSelectedUser(user);
    setMenuVisible(true);
  };

  // Close user menu
  const closeMenu = () => {
    setMenuVisible(false);
  };

  // Show role change dialog
  const showRoleDialog = () => {
    setSelectedRole(selectedUser?.role || 'user');
    setRoleDialogVisible(true);
    closeMenu();
  };

  // Hide role dialog
  const hideRoleDialog = () => {
    setRoleDialogVisible(false);
  };

  // Change user role
  const changeUserRole = async () => {
    if (!selectedUser) return;
    
    setLoading(true);
    try {
      await AdminService.updateUserRole(selectedUser.id, selectedRole);
      Alert.alert('Success', `User role updated to ${selectedRole}.`);
      
      // Update users list
      setUsers(users.map((user) =>
        user.id === selectedUser.id ? { ...user, role: selectedRole } : user
      ));
      setFilteredUsers(filteredUsers.map((user) =>
        user.id === selectedUser.id ? { ...user, role: selectedRole } : user
      ));
    } catch (error) {
      console.error('Error updating user role:', error);
      Alert.alert('Error', 'Failed to update user role. Please try again.');
    } finally {
      setLoading(false);
      hideRoleDialog();
    }
  };

  // View user bookings
  const viewUserBookings = async () => {
    if (!selectedUser) return;
    
    setLoading(true);
    try {
      const bookings = await BookingService.getUserBookings(selectedUser.id);
      setUserBookings(bookings);
      setBookingsVisible(true);
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      Alert.alert('Error', 'Failed to load user bookings. Please try again.');
    } finally {
      setLoading(false);
      closeMenu();
    }
  };

  // Hide bookings dialog
  const hideBookingsDialog = () => {
    setBookingsVisible(false);
  };

  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  // Format time for display
  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Render loading state
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
        <Text style={styles.loadingText}>Loading users...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>User Management</Text>
        <Text style={styles.subtitle}>{users.length} registered users</Text>
      </View>

      <Searchbar
        placeholder="Search users..."
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchBar}
      />

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.userCard}>
            <Card.Content>
              <View style={styles.userHeader}>
                <View>
                  <Title>{item.name || 'No Name'}</Title>
                  <Paragraph>{item.email || 'No Email'}</Paragraph>
                </View>
                <TouchableOpacity onPress={() => openMenu(item)}>
                  <Icon name="dots-vertical" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.userDetails}>
                <View style={styles.detailItem}>
                  <Icon name="car" size={16} color="#4285F4" />
                  <Text style={styles.detailText}>
                    {item.vehicleType || 'No Vehicle Type'}
                  </Text>
                </View>
                
                <View style={styles.detailItem}>
                  <Icon name="card-account-details" size={16} color="#4285F4" />
                  <Text style={styles.detailText}>
                    {item.vehicleNumber || 'No Vehicle Number'}
                  </Text>
                </View>
                
                <View style={styles.detailItem}>
                  <Icon name="shield-account" size={16} color="#4285F4" />
                  <Text style={styles.detailText}>
                    Role: {item.role || 'user'}
                  </Text>
                </View>
                
                <View style={styles.detailItem}>
                  <Icon name="calendar" size={16} color="#4285F4" />
                  <Text style={styles.detailText}>
                    Joined: {formatDate(item.createdAt) || 'Unknown'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.userActions}>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setSelectedUser(item);
                    viewUserBookings();
                  }}
                  style={styles.actionButton}
                >
                  View Bookings
                </Button>
                
                <Button
                  mode="outlined"
                  onPress={() => {
                    setSelectedUser(item);
                    showRoleDialog();
                  }}
                  style={styles.actionButton}
                >
                  Change Role
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="account-off" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No users found</Text>
          </View>
        }
      />

      {/* User Menu */}
      <Menu
        visible={menuVisible}
        onDismiss={closeMenu}
        anchor={{ x: 0, y: 0 }} // This will be adjusted when menu is opened
      >
        <Menu.Item
          onPress={viewUserBookings}
          title="View Bookings"
          icon="calendar-clock"
        />
        <Menu.Item
          onPress={showRoleDialog}
          title="Change Role"
          icon="shield-account"
        />
        <Divider />
        <Menu.Item
          onPress={closeMenu}
          title="Cancel"
          icon="close"
        />
      </Menu>

      {/* Role Change Dialog */}
      <Portal>
        <Dialog visible={roleDialogVisible} onDismiss={hideRoleDialog}>
          <Dialog.Title>Change User Role</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogText}>
              Select a role for {selectedUser?.name || 'this user'}:
            </Text>
            <RadioButton.Group
              onValueChange={(value) => setSelectedRole(value)}
              value={selectedRole}
            >
              <View style={styles.roleOption}>
                <RadioButton value="user" />
                <Text>User</Text>
              </View>
              <View style={styles.roleOption}>
                <RadioButton value="admin" />
                <Text>Admin</Text>
              </View>
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideRoleDialog}>Cancel</Button>
            <Button onPress={changeUserRole}>Confirm</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* User Bookings Dialog */}
      <Portal>
        <Dialog visible={bookingsVisible} onDismiss={hideBookingsDialog} style={styles.bookingsDialog}>
          <Dialog.Title>Bookings - {selectedUser?.name || 'User'}</Dialog.Title>
          <Dialog.Content>
            {userBookings.length > 0 ? (
              <FlatList
                data={userBookings}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <Card style={styles.bookingCard}>
                    <Card.Content>
                      <View style={styles.bookingHeader}>
                        <Text style={styles.bookingSpot}>Spot {item.spotId}</Text>
                        <Text style={[
                          styles.bookingStatus,
                          item.status === 'confirmed' ? styles.statusConfirmed : 
                          item.status === 'cancelled' ? styles.statusCancelled :
                          styles.statusTemporary
                        ]}>
                          {item.status.toUpperCase()}
                        </Text>
                      </View>
                      
                      <Text style={styles.bookingDate}>
                        {formatDate(item.date)}
                      </Text>
                      
                      <Text style={styles.bookingTime}>
                        {formatTime(item.startTime)} - {formatTime(item.endTime)}
                      </Text>
                      
                      {item.paymentDetails && (
                        <Text style={styles.bookingPayment}>
                          Payment: ${item.paymentDetails.amount?.toFixed(2) || '0.00'}
                        </Text>
                      )}
                    </Card.Content>
                  </Card>
                )}
                style={styles.bookingsList}
              />
            ) : (
              <Text style={styles.noBookingsText}>No bookings found for this user.</Text>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideBookingsDialog}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  searchBar: {
    margin: 16,
    elevation: 2,
  },
  listContent: {
    padding: 16,
  },
  userCard: {
    marginBottom: 16,
    elevation: 2,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userDetails: {
    marginTop: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    marginLeft: 8,
    color: '#666',
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  dialogText: {
    marginBottom: 16,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bookingsDialog: {
    maxHeight: '80%',
  },
  bookingCard: {
    marginBottom: 8,
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
  bookingStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
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
  bookingDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  bookingTime: {
    fontSize: 14,
    color: '#666',
  },
  bookingPayment: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#34A853',
    marginTop: 4,
  },
  bookingsList: {
    maxHeight: 400,
  },
  noBookingsText: {
    textAlign: 'center',
    color: '#666',
    padding: 16,
  },
});

export default UserManagement;