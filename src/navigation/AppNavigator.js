import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import UserNavigator from './UserNavigator';
import AdminNavigator from './AdminNavigator';
import LoadingScreen from '../screens/common/LoadingScreen';

const AppNavigator = () => {
  const { currentUser, loading, userDetails, isAdmin } = useAuth();

  // Determine which navigator to show
  const renderNavigator = () => {
    if (loading) {
      return <LoadingScreen />;
    }

    if (!currentUser) {
      return <AuthNavigator />;
    }

    if (isAdmin()) {
      return <AdminNavigator />;
    }

    return <UserNavigator />;
  };

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {renderNavigator()}
    </NavigationContainer>
  );
};

export default AppNavigator;