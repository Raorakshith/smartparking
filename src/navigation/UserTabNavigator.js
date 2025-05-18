// src/navigation/UserTabNavigator.js (Updated with Checkout screens)
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

// User Screens
import MapScreen from '../screens/user/MapScreen';
import BookingScreen from '../screens/user/BookingScreen';
import PaymentScreen from '../screens/user/PaymentScreen';
import BookingHistoryScreen from '../screens/user/BookingHistoryScreen';
import ProfileScreen from '../screens/user/ProfileScreen';
import NotificationsScreen from '../screens/user/NotificationsScreen';
import BookingConfirmationScreen from '../screens/user/BookingConfirmationScreen';
import CheckoutScreen from '../screens/user/CheckoutScreen';
import CheckoutSuccessScreen from '../screens/user/CheckoutSuccessScreen';

const Tab = createBottomTabNavigator();
const MapStack = createStackNavigator();
const BookingStack = createStackNavigator();
const ProfileStack = createStackNavigator();

const MapStackScreen = () => (
  <MapStack.Navigator screenOptions={{ headerShown: false }}>
    <MapStack.Screen name="MapHome" component={MapScreen} />
    <MapStack.Screen name="Booking" component={BookingScreen} />
    <MapStack.Screen name="Payment" component={PaymentScreen} />
    <MapStack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} />
    <MapStack.Screen name="Checkout" component={CheckoutScreen} />
    <MapStack.Screen name="CheckoutSuccess" component={CheckoutSuccessScreen} />
  </MapStack.Navigator>
);

const BookingStackScreen = () => (
  <BookingStack.Navigator screenOptions={{ headerShown: false }}>
    <BookingStack.Screen name="BookingHistory" component={BookingHistoryScreen} />
    <BookingStack.Screen name="Checkout" component={CheckoutScreen} />
    <BookingStack.Screen name="CheckoutSuccess" component={CheckoutSuccessScreen} />
  </BookingStack.Navigator>
);

const ProfileStackScreen = () => (
  <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
    <ProfileStack.Screen name="ProfileHome" component={ProfileScreen} />
    <ProfileStack.Screen name="Notifications" component={NotificationsScreen} />
  </ProfileStack.Navigator>
);

const UserTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Map') {
            iconName = 'map';
          } else if (route.name === 'Bookings') {
            iconName = 'book-online';
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
      <Tab.Screen name="Map" component={MapStackScreen} />
      <Tab.Screen name="Bookings" component={BookingStackScreen} />
      <Tab.Screen name="Profile" component={ProfileStackScreen} />
    </Tab.Navigator>
  );
};

export default UserTabNavigator;