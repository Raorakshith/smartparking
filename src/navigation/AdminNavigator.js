// src/navigation/AdminNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Admin Screens
import AdminDashboard from '../screens/admin/AdminDashboard';
import ParkingInventory from '../screens/admin/ParkingInventory';
import UserManagement from '../screens/admin/UserManagement';
import SystemSettings from '../screens/admin/SystemSettings';

const Tab = createBottomTabNavigator();
const AdminStack = createStackNavigator();
const InventoryStack = createStackNavigator();
const UsersStack = createStackNavigator();
const SettingsStack = createStackNavigator();

// Dashboard navigator
const DashboardStackNavigator = () => {
  return (
    <AdminStack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#4285F4',
        },
        headerTintColor: '#fff',
      }}
    >
      <AdminStack.Screen 
        name="Dashboard" 
        component={AdminDashboard} 
        options={{ title: 'Admin Dashboard' }}
      />
    </AdminStack.Navigator>
  );
};

// Inventory navigator
const InventoryStackNavigator = () => {
  return (
    <InventoryStack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#4285F4',
        },
        headerTintColor: '#fff',
      }}
    >
      <InventoryStack.Screen 
        name="ParkingInventory" 
        component={ParkingInventory} 
        options={{ title: 'Parking Inventory' }}
      />
    </InventoryStack.Navigator>
  );
};

// Users navigator
const UsersStackNavigator = () => {
  return (
    <UsersStack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#4285F4',
        },
        headerTintColor: '#fff',
      }}
    >
      <UsersStack.Screen 
        name="UserManagement" 
        component={UserManagement} 
        options={{ title: 'User Management' }}
      />
    </UsersStack.Navigator>
  );
};

// Settings navigator
const SettingsStackNavigator = () => {
  return (
    <SettingsStack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#4285F4',
        },
        headerTintColor: '#fff',
      }}
    >
      <SettingsStack.Screen 
        name="SystemSettings" 
        component={SystemSettings} 
        options={{ title: 'System Settings' }}
      />
    </SettingsStack.Navigator>
  );
};

// Main admin tab navigator
const AdminNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
          } else if (route.name === 'Inventory') {
            iconName = focused ? 'car-multiple' : 'car-multiple';
          } else if (route.name === 'Users') {
            iconName = focused ? 'account-group' : 'account-group-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'cog' : 'cog-outline';
          }
          
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4285F4',
        tabBarInactiveTintColor: '#888',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardStackNavigator} />
      <Tab.Screen name="Inventory" component={InventoryStackNavigator} />
      <Tab.Screen name="Users" component={UsersStackNavigator} />
      <Tab.Screen name="Settings" component={SettingsStackNavigator} />
    </Tab.Navigator>
  );
};

export default AdminNavigator;