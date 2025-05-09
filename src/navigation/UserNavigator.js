import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Screens
import HomeScreen from '../screens/user/HomeScreen';
import BookingScreen from '../screens/user/BookingScreen';
import PaymentScreen from '../screens/user/PaymentScreen';
import ConfirmationScreen from '../screens/user/ConfirmationScreen';
import BookingHistoryScreen from '../screens/user/BookingHistoryScreen';
import ProfileScreen from '../screens/user/ProfileScreen';

const Tab = createBottomTabNavigator();
const BookingStack = createStackNavigator();
const HistoryStack = createStackNavigator();
const ProfileStack = createStackNavigator();

// Booking process navigator
const BookingStackNavigator = () => {
  return (
    <BookingStack.Navigator 
      initialRouteName="BookParking"
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#4285F4',
        },
        headerTintColor: '#fff',
      }}
    >
      <BookingStack.Screen 
        name="BookParking" 
        component={BookingScreen} 
        options={{ title: 'Book Parking' }}
      />
      <BookingStack.Screen 
        name="Payment" 
        component={PaymentScreen} 
        options={{ title: 'Payment' }}
      />
      <BookingStack.Screen 
        name="Confirmation" 
        component={ConfirmationScreen} 
        options={{ title: 'Booking Confirmation' }}
      />
    </BookingStack.Navigator>
  );
};

// Booking history navigator
const HistoryStackNavigator = () => {
  return (
    <HistoryStack.Navigator 
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#4285F4',
        },
        headerTintColor: '#fff',
      }}
    >
      <HistoryStack.Screen 
        name="BookingHistory" 
        component={BookingHistoryScreen} 
        options={{ title: 'My Bookings' }}
      />
    </HistoryStack.Navigator>
  );
};

// Profile navigator
const ProfileStackNavigator = () => {
  return (
    <ProfileStack.Navigator 
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#4285F4',
        },
        headerTintColor: '#fff',
      }}
    >
      <ProfileStack.Screen 
        name="ProfileScreen" 
        component={ProfileScreen} 
        options={{ title: 'My Profile' }}
      />
    </ProfileStack.Navigator>
  );
};

// Main user tab navigator
const UserNavigator = () => {
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
  
            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Book') {
              iconName = focused ? 'parking' : 'parking';
            } else if (route.name === 'History') {
              iconName = focused ? 'history' : 'history';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'account' : 'account-outline';
            }
            
            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#4285F4',
          tabBarInactiveTintColor: '#888',
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Book" component={BookingStackNavigator} />
        <Tab.Screen name="History" component={HistoryStackNavigator} />
        <Tab.Screen name="Profile" component={ProfileStackNavigator} />
      </Tab.Navigator>
    );
  };
  
  export default UserNavigator;
  