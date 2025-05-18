// src/App.js
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// Screens
import LoginScreen from './screens/auth/LoginScreen';
import RegisterScreen from './screens/auth/RegisterScreen';
import ForgotPasswordScreen from './screens/auth/ForgotPasswordScreen';
import UserTabNavigator from './navigation/UserTabNavigator';
import AdminTabNavigator from './navigation/AdminTabNavigator';
import LoadingScreen from './screens/LoadingScreen';

const Stack = createStackNavigator();

const App = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // Handle user state changes
  function onAuthStateChanged(user) {
    setUser(user);
    
    if (user) {
      // Fetch user role from Firestore
      firestore()
        .collection('users')
        .doc(user.uid)
        .get()
        .then(documentSnapshot => {
          if (documentSnapshot.exists) {
            setUserRole(documentSnapshot.data().role);
          }
          if (initializing) setInitializing(false);
        })
        .catch(error => {
          console.error('Error fetching user data:', error);
          if (initializing) setInitializing(false);
        });
    } else {
      setUserRole(null);
      if (initializing) setInitializing(false);
    }
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // Unsubscribe on unmount
  }, []);

  if (initializing) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // Auth screens
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        ) : userRole === 'admin' ? (
          // Admin screens
          <Stack.Screen name="AdminHome" component={AdminTabNavigator} />
        ) : (
          // User screens
          <Stack.Screen name="UserHome" component={UserTabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;