// src/navigation/AdminTabNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Admin Screens
import DashboardScreen from '../screens/admin/DashboardScreen';
import ParkingManagementScreen from '../screens/admin/ParkingManagementScreen';
import AddParkingSpotScreen from '../screens/admin/AddParkingSpotScreen';
// import BookingManagementScreen from '../screens/admin/BookingManagementScreen';
// import AdminProfileScreen from '../screens/admin/AdminProfileScreen';
import UserManagement from '../screens/admin/UserManagement';
import AdminDashboard from '../screens/admin/AdminDashboard';

const Tab = createBottomTabNavigator();
const DashboardStack = createStackNavigator();
const ManagementStack = createStackNavigator();
const ProfileStack = createStackNavigator();

const DashboardStackScreen = () => (
  <DashboardStack.Navigator screenOptions={{ headerShown: false }}>
    <DashboardStack.Screen name="Dashboard" component={DashboardScreen} />
  </DashboardStack.Navigator>
);

const ManagementStackScreen = () => (
  <ManagementStack.Navigator screenOptions={{ headerShown: false }}>
    <ManagementStack.Screen name="ParkingManagement" component={ParkingManagementScreen} />
    <ManagementStack.Screen name="AddParkingSpot" component={AddParkingSpotScreen} />
    <ManagementStack.Screen name="UserManagement" component={UserManagement} />
    {/* <ManagementStack.Screen name="BookingManagement" component={BookingManagementScreen} /> */}
  </ManagementStack.Navigator>
);

const ProfileStackScreen = () => (
  <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
    <ProfileStack.Screen name="AdminProfile" component={AdminDashboard} />
  </ProfileStack.Navigator>
);

const AdminTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = 'dashboard';
          } else if (route.name === 'Management') {
            iconName = 'edit';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4A80F0',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarStyle: {
          paddingBottom: 5,
          height: 60,
        },
      })}>
      <Tab.Screen name="Dashboard" component={DashboardStackScreen} />
      <Tab.Screen name="Management" component={ManagementStackScreen} />
      <Tab.Screen name="Profile" component={ProfileStackScreen} />
    </Tab.Navigator>
  );
};

export default AdminTabNavigator;